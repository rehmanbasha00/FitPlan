import nodemailer from 'nodemailer';

// Sends a real email using SMTP credentials (works with Gmail: create an
// "App password" at https://myaccount.google.com/apppasswords and set
// SMTP_HOST=smtp.gmail.com, SMTP_PORT=465, SMTP_USER=you@gmail.com,
// SMTP_PASS=<app password>). Any other SMTP provider works the same way.
export async function sendOtpEmail(to: string, code: string) {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 465);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) return { sent: false, configured: false };

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass }
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM || user,
    to,
    subject: 'Your Fitplan verification code',
    text: `Your Fitplan verification code is ${code}. It expires in 5 minutes.`,
    html: `<p>Your Fitplan verification code is <strong>${code}</strong>.</p><p>It expires in 5 minutes.</p>`
  });

  return { sent: true, configured: true };
}
