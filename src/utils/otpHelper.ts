export type OtpResult = {
  otp: string;
  expireAt: Date;
};

export const generateOtp = (expiryMinutes: number = 10): OtpResult => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit
  const expireAt = new Date(Date.now() + expiryMinutes * 60 * 1000);
  return { otp, expireAt };
};