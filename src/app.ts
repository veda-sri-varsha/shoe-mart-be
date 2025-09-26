import express, { Request, Response } from "express";
import cookieParser from "cookie-parser";
import router from "./routes";
import cors from "cors";

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CLIENT_URL, 
    credentials: true, 
  })
);

app.get('/', (_req: Request, res: Response) => {
  res.send("Welcome to the E-Commerce API");
});

app.get("/healthcheck", (_req: Request, res: Response) => {
  return res.status(200).json({
    status: 200,
    message: "OK",
    data: "Health check passed",
  });
});

app.use("/api", router);

export default app;
