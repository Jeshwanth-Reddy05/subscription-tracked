import nodemailer from "nodemailer";
import dns from "dns/promises";
import net from "net";

/**
 * Resolves a hostname strictly to an IPv4 address to prevent ENETUNREACH errors
 * on hosting environments (like Render or Docker containers) that lack outbound IPv6 routing.
 */
const resolveIPv4Host = async (hostname) => {
  if (!hostname || net.isIP(hostname)) {
    return hostname;
  }
  try {
    const addresses = await dns.resolve4(hostname);
    if (addresses && addresses.length > 0) {
      return addresses[0];
    }
  } catch (err) {
    console.warn(`IPv4 DNS lookup for ${hostname} fallback:`, err.message);
  }
  return hostname;
};

const createTransportWithTimeout = (host, port, secure, servername) => {
  return nodemailer.createTransport({
    host,
    port,
    secure,
    servername,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    connectionTimeout: 8000,
    greetingTimeout: 8000,
    socketTimeout: 10000,
  });
};

const sendEmail = async (options) => {
  const recipient = options.email || options.to;
  const subject = options.subject;
  const textContent = options.message || options.text;
  const htmlContent = options.html;

  // 1. Google Apps Script Webhook Bridge (Sends directly from mullapandi49@gmail.com to ANY recipient over HTTPS 443)
  if (process.env.GMAIL_WEBHOOK_URL) {
    try {
      const res = await fetch(process.env.GMAIL_WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain;charset=utf-8",
        },
        body: JSON.stringify({
          to: recipient,
          subject: subject,
          text: textContent,
          html: htmlContent,
        }),
        redirect: "follow",
      });

      const text = await res.text();
      let data = {};
      try {
        data = JSON.parse(text);
      } catch (e) {
        data = { message: text };
      }

      if (data.status === "error") {
        throw new Error(data.message || "Gmail Webhook dispatch error");
      }
      return data;
    } catch (apiErr) {
      console.error("Gmail Webhook dispatch error:", apiErr.message);
      throw apiErr;
    }
  }

  // 2. HTTP API Provider: Resend (Works over HTTPS port 443, bypassing cloud firewall SMTP blocks like Render Free Tier)
  if (process.env.RESEND_API_KEY) {
    try {
      // Resend requires onboarding@resend.dev unless a custom domain is verified
      let fromAddress =
        process.env.RESEND_FROM || "SubTrack <onboarding@resend.dev>";
      if (
        process.env.FROM_EMAIL &&
        !process.env.FROM_EMAIL.includes("@gmail.com") &&
        !process.env.FROM_EMAIL.includes("@yahoo.com") &&
        !process.env.FROM_EMAIL.includes("@outlook.com")
      ) {
        fromAddress = process.env.FROM_EMAIL;
      }

      let res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromAddress,
          to: [recipient],
          subject: subject,
          text: textContent,
          html: htmlContent,
        }),
      });

      let data = await res.json();

      // If Resend free sandbox restricted delivery to account owner's email, auto-forward to allowed email
      if (!res.ok) {
        const errorMsg = data.message || data.error?.message || "";
        const match = errorMsg.match(/own email address \(([^)]+)\)/);
        if (match && match[1] && match[1] !== recipient) {
          const allowedRecipient = match[1];
          console.warn(
            `Resend sandbox restriction: rerouting email from ${recipient} to account owner ${allowedRecipient}`
          );
          res = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: fromAddress,
              to: [allowedRecipient],
              subject: `[SubTrack Sandbox for ${recipient}] ${subject}`,
              text: textContent,
              html: htmlContent,
            }),
          });
          data = await res.json();
          if (res.ok) {
            data.reroutedTo = allowedRecipient;
            data.originalRecipient = recipient;
            return data;
          }
        }
        throw new Error(
          data.message || data.error?.message || "Resend API error"
        );
      }
      return data;
    } catch (apiErr) {
      console.error("Resend API dispatch error:", apiErr.message);
      throw apiErr;
    }
  }

  // 2. HTTP API Provider: Brevo (Sendinblue REST API over port 443)
  if (process.env.BREVO_API_KEY) {
    try {
      const senderEmail = process.env.SMTP_USER || "noreply@subtrack.com";
      const res = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sender: { email: senderEmail, name: "SubTrack" },
          to: [{ email: recipient }],
          subject: subject,
          textContent: textContent,
          htmlContent: htmlContent,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Brevo API error");
      }
      return data;
    } catch (apiErr) {
      console.error("Brevo API dispatch error:", apiErr.message);
      throw apiErr;
    }
  }

  // 3. Fallback to standard Nodemailer SMTP (Works in local dev, VPS, or paid Render plans)
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn(
      "Neither RESEND_API_KEY nor SMTP_USER/SMTP_PASS is configured. Email skipped."
    );
    return { skipped: true, message: "Email credentials missing in .env" };
  }

  const rawHost = process.env.SMTP_HOST || "smtp.gmail.com";
  const ipv4Host = await resolveIPv4Host(rawHost);

  // Default to port 465 (SSL) for Gmail or when unset
  const isGmail = rawHost.toLowerCase().includes("gmail");
  const configuredPort = Number(process.env.SMTP_PORT);
  const primaryPort = isGmail ? 465 : configuredPort || 587;
  const primarySecure = primaryPort === 465;

  const mailOptions = {
    from: process.env.FROM_EMAIL || `"SubTrack" <${process.env.SMTP_USER}>`,
    to: recipient,
    subject: subject,
    text: textContent,
    html: htmlContent,
  };

  try {
    const transporter = createTransportWithTimeout(
      ipv4Host,
      primaryPort,
      primarySecure,
      rawHost
    );
    return await transporter.sendMail(mailOptions);
  } catch (err) {
    // If primary port failed or timed out, attempt alternate port
    const fallbackPort = primaryPort === 465 ? 587 : 465;
    const fallbackSecure = fallbackPort === 465;
    console.warn(
      `SMTP send on port ${primaryPort} failed (${err.message}). Retrying on port ${fallbackPort}...`
    );

    try {
      const fallbackTransporter = createTransportWithTimeout(
        ipv4Host,
        fallbackPort,
        fallbackSecure,
        rawHost
      );
      return await fallbackTransporter.sendMail(mailOptions);
    } catch (fallbackErr) {
      // Check for timeout or network unreachable (Render Free Tier outbound SMTP block)
      if (
        fallbackErr.message.includes("timeout") ||
        fallbackErr.message.includes("ENETUNREACH") ||
        fallbackErr.code === "ETIMEDOUT"
      ) {
        throw new Error(
          `SMTP connection timed out on ports ${primaryPort} & ${fallbackPort}. Render Free Tier blocks outbound SMTP traffic (ports 25, 465, 587) to prevent abuse. To send emails from Render for free, sign up at resend.com (free 3,000 emails/mo) and add RESEND_API_KEY in your Render Environment Variables.`
        );
      }
      throw fallbackErr;
    }
  }
};

export default sendEmail;
