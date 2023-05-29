import express, { Request, Response } from 'express';
import * as nodemailer from 'nodemailer';

const router = express.Router();

router.post('/', async (req: Request, res: Response) => {
  const { email, name, message } = req.body;
  if (!email || !name || !message) return res.status(400).json({ error: 'Missing email, name, message' });
  const mailBody = `
    <div>
      <h2>Signally Contact Form</h2>
      <p>Name: ${name}</p>
      <p>Email: ${email}</p>
      <p>Message: ${message}</p>
    </div>
  `;

  const emails = [process.env.SMTP_EMAIL!];

  sendMail(emails, mailBody, 'Signally Contact Form');
  res.status(200).send('Sent!');
});

async function sendMail(emailAddresses: string[], mailBody: string, subject: string) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: true,
    auth: {
      user: `${process.env.SMTP_EMAIL}`,
      pass: `${process.env.SMTP_PASSWORD}`
    }
  });
  const mailOptions = {
    from: `Contact alert for Signally <${process.env.SMTP_EMAIL!}>`,
    to: `${emailAddresses}`,
    subject: `${subject}`,
    html: `${mailBody}`
  };

  transporter.sendMail(mailOptions, (error: any, data: any) => {
    if (error) console.log(error);
    if (!error) console.log('Sent!');
  });
}

module.exports = router;
