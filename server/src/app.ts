import express, { Request, Response } from "express";
import cookieParser from "cookie-parser";
import User from "./models/user.schema";
import UserAuth from "./middlewares/UserAuth";
import router from "./routes/index";
import cors from "cors"; 


const app: express.Application = express();

app.use(express.json());
app.use(cookieParser());

app.use(cors({
  origin: "http://localhost:3000", 
  credentials: true,               
}));


app.get('/',(req,res) => {
  res.send("Welcome to the E-Commerce API");
});

app.use("/api", router);


app.post("/sendRequest", UserAuth, async (req: Request, res: Response) => {
  try {
   const user = (req as any).user; 
    console.log("Sending Connection Request");
    res.send("Connection sent: " + user?.name);
  } catch (err: any) {
    res.status(500).send("Error sending request: " + err.message);
  }
});

app.get("/feed", async (_req: Request, res: Response) => {
  try {
    const users = await User.find({});
    res.send(users);
  } catch (err: any) {
    res.status(500).send("Error fetching feed: " + err.message);
  }
});

export default app;
