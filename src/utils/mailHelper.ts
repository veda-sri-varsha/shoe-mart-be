import config from "../config/index";
import transporter from "../services/mailTransport";

interface MailOptions {
  email: string;
  subject: string;
  message: string;
}

const mailHelper = async (options: MailOptions): Promise<void> => {
  const message = {
    from: config.SMTP_FROM_EMAIL, 
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: `<p>${options.message}</p>`,
  };

  try {
    const info = await transporter.sendMail(message);
    console.log("Email sent successfully");
  } catch (error) {
    console.error("Email sending failed:", error);
    throw error;
  }
};

export default mailHelper;
