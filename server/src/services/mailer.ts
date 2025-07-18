import nodemailer from "nodemailer";

interface sendMailProps {
  to: string;
  subject: string;
  text?: string;
  html: string;
  attachments?: any[];
}

interface mailOptionsProps extends sendMailProps {
  from: {
    name: string;
    address: string | any;
  };
}

// Create a transporter using nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com", // Correct SMTP host for Gmail
  port: 587,
  secure: false, // Use `true` for port 465, `false` for other ports
  auth: {
    user: process.env.SENDER_EMAIL, // Your Gmail address
    pass: process.env.APP_PASSWORD, // App-specific password for Gmail
  },
});

// Send mail function
const sendMail = ({
  to,
  subject,
  text,
  html,
  attachments = [],
}: sendMailProps) => {
  const mailOptions: mailOptionsProps = {
    from: {
      name: "ByteBubble", // Sender's name
      address: process.env.SENDER_EMAIL, // Sender's email address
    },
    to: to,
    subject: subject,
    text: text,
    html: html,
    attachments: Array.isArray(attachments) ? attachments : [attachments], // Ensure attachments is an array
  };

  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        reject(error); // Reject with actual error
      } else {
        resolve(true);
      }
    });
  });
};

export { sendMail };
