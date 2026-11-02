import nodemailer from "nodemailer";

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}): Promise<void> {
  const host = process.env.EMAIL_SMTP_HOST;
  const port = parseInt(process.env.EMAIL_SMTP_PORT || "587", 10);
  const user = process.env.EMAIL_SMTP_USERNAME;
  const pass = process.env.EMAIL_SMTP_PASSWORD;
  const from = process.env.EMAIL_SENDER_EMAIL || "AIUB Job Fair 2026 <no-reply@aiub.edu>";

  if (!host || !user || !pass) {
    console.log(`[Email Simulation] To: ${to} | Subject: ${subject}`);
    return;
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  await transporter.sendMail({
    from,
    to,
    subject,
    html,
  });
}
