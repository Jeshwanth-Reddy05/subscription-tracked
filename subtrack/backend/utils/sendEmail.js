import nodemailer from "nodemailer";

const sendEmail = async (options) => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn("SMTP_USER or SMTP_PASS is missing in .env. Email skipped.");
    return { skipped: true, message: "SMTP credentials missing in .env" };
  }

  const port = Number(process.env.SMTP_PORT) || 587;
  const isSecure = port === 465;

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: port,
    secure: isSecure,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    connectionTimeout: 10000,
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
