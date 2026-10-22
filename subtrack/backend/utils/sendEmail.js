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

const sendEmail = async (options) => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn("SMTP_USER or SMTP_PASS is missing in .env. Email skipped.");
    return { skipped: true, message: "SMTP credentials missing in .env" };
  }

  const rawHost = process.env.SMTP_HOST || "smtp.gmail.com";
  const ipv4Host = await resolveIPv4Host(rawHost);

  const port = Number(process.env.SMTP_PORT) || 587;
  const isSecure = port === 465;

  const transporter = nodemailer.createTransport({
    host: ipv4Host,
    port: port,
    secure: isSecure,
    servername: rawHost, // Retains SNI for TLS certificate validation
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    connectionTimeout: 15000,
  });

  const mailOptions = {
    from: process.env.FROM_EMAIL || `"SubTrack" <${process.env.SMTP_USER}>`,
    to: options.email || options.to,
    subject: options.subject,
    text: options.message || options.text,
    html: options.html,
  };

  const info = await transporter.sendMail(mailOptions);
  return info;
};

export default sendEmail;
