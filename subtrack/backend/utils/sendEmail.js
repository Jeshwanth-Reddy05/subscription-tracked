import nodemailer from "nodemailer";

const sendEmail = async (options) => {
  // Create a reusable transporter object using the default SMTP transport
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.mailtrap.io",
    port: process.env.SMTP_PORT || 2525,
    auth: {
      user: process.env.SMTP_USER || "",
      pass: process.env.SMTP_PASS || "",
    },
  });

  // Define email options
  const mailOptions = {
    from: process.env.FROM_EMAIL || '"SubTrack" <noreply@subtrack.com>',
    to: options.email || options.to,
    subject: options.subject,
    text: options.message || options.text,
    html: options.html,
  };

  // Send the email
  const info = await transporter.sendMail(mailOptions);
  return info;
};

export default sendEmail;
