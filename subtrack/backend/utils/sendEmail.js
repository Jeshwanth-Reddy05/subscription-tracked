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
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn("SMTP_USER or SMTP_PASS is missing in .env. Email skipped.");
    return { skipped: true, message: "SMTP credentials missing in .env" };
  }

  const rawHost = process.env.SMTP_HOST || "smtp.gmail.com";
  const ipv4Host = await resolveIPv4Host(rawHost);

  // Default to port 465 (SSL) for Gmail or when unset, since Render and cloud firewalls block port 587
  const isGmail = rawHost.toLowerCase().includes("gmail");
  const configuredPort = Number(process.env.SMTP_PORT);
  const primaryPort = isGmail ? 465 : (configuredPort || 587);
  const primarySecure = primaryPort === 465;

  const mailOptions = {
    from: process.env.FROM_EMAIL || `"SubTrack" <${process.env.SMTP_USER}>`,
    to: options.email || options.to,
    subject: options.subject,
    text: options.message || options.text,
    html: options.html,
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
    // If primary port timed out or failed (e.g. cloud host blocked port 587), fallback to alternate port
    const fallbackPort = primaryPort === 465 ? 587 : 465;
    const fallbackSecure = fallbackPort === 465;
    console.warn(
      `SMTP send on port ${primaryPort} failed (${err.message}). Retrying on port ${fallbackPort}...`
    );

    const fallbackTransporter = createTransportWithTimeout(
      ipv4Host,
      fallbackPort,
      fallbackSecure,
      rawHost
    );
    return await fallbackTransporter.sendMail(mailOptions);
  }
};

export default sendEmail;
