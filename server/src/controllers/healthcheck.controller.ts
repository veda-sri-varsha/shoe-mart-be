import { Request, Response } from "express";

const healthcheck = (req: Request, res: Response) => {
  return res.status(200).json({
    status: 200,
    message: "OK",
    data: "Health check passed",
  });
};

export { healthcheck };
