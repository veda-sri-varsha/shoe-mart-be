import dotenv from "dotenv";

dotenv.config();

const config = {
 PORT: process.env.PORT,
  DATABASE_URL: process.env.DATABASE_URL as string,
  JWT_SECRET: process.env.JWT_ACCESS_SECRET as string,
  JWT_EXPIRATION: Number(process.env.JWT_ACCESS_EXPIRATION),
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME as string,
  JWT_REFRESH_EXPIRATION: Number(process.env.JWT_REFRESH_EXPIRATION),
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET as string,
  RAZORPAY_KEY: process.env.RAZORPAY_KEY_ID as string,
  RAZORPAY_SECRET: process.env.RAZORPAY_KEY_SECRET as string,
  JWT_VERIFY_SECRET: process.env.JWT_VERIFY_SECRET as string,

  SMTP_HOST: process.env.SMTP_HOST as string,
  SMTP_PORT: process.env.SMTP_PORT as string,
  SMTP_USERNAME: process.env.SMTP_USERNAME as string,
  SMTP_PASSWORD: process.env.SMTP_PASSWORD as string,
  SMTP_FROM_EMAIL: process.env.SMTP_FROM_EMAIL as string,

};

export default config;
