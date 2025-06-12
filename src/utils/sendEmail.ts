import nodemailer from 'nodemailer';

export const sendEmail = async (to: string, subject: string, text: string) => {
  // Create a transporter with email service config
  const transporter = nodemailer.createTransport({
    service: 'gmail', // usr can use gmail or any other email provider
    auth: {
      user: process.env.EMAIL_USER, //  email address
      pass: process.env.EMAIL_PASS, //  email password or app password
    },
  });

  // Email options
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    text,
  };

  // Send email
  await transporter.sendMail(mailOptions);
};
