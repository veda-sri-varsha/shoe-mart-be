import config from "../config/index";
import transporter from "../services/mailTransport";

interface MailOptions {
  email: string;
  subject: string;
  message: string;
}

const mailHelper = async (options: MailOptions): Promise<void> => {
  const message = {
    from: `${config.SMTP_FROM_EMAIL} <${config.SMTP_USERNAME}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  await transporter.sendMail(message);
};

export default mailHelper;
