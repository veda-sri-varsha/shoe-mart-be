import dotenv from "dotenv";
import { envSchema } from "../schema/env.schema";

dotenv.config();

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("Invalid environment variables:", parsedEnv.error.issues);
  process.exit(1);
}

const config = {
  PORT: parsedEnv.data.PORT,
  DATABASE_URL: parsedEnv.data.DATABASE_URL,
  JWT_SECRET: parsedEnv.data.JWT_ACCESS_SECRET,
  JWT_EXPIRATION: parsedEnv.data.JWT_ACCESS_EXPIRATION,
  JWT_REFRESH_SECRET: parsedEnv.data.JWT_REFRESH_SECRET,
  JWT_REFRESH_EXPIRATION: parsedEnv.data.JWT_REFRESH_EXPIRATION,
  JWT_VERIFY_SECRET: parsedEnv.data.JWT_VERIFY_SECRET,
  RAZORPAY_KEY: parsedEnv.data.RAZORPAY_KEY_ID,
  RAZORPAY_SECRET: parsedEnv.data.RAZORPAY_KEY_SECRET,
  SMTP_HOST: parsedEnv.data.SMTP_HOST,
  SMTP_PORT: parsedEnv.data.SMTP_PORT,
  SMTP_USERNAME: parsedEnv.data.SMTP_USERNAME,
  SMTP_PASSWORD: parsedEnv.data.SMTP_PASSWORD,
  SMTP_FROM_EMAIL: parsedEnv.data.SMTP_FROM_EMAIL,
};

export default config;
