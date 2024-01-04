import express, { Request, Response } from "express";
import path from "path";

const viewRouter = express.Router();

viewRouter.get("/", (req: Request, res: Response) => {
  res.sendFile( path.parse(__dirname).dir + "/views/index.html");
});

viewRouter.get("/index", (req: Request, res: Response) => {
    res.sendFile(path.parse(__dirname).dir + "/views/index.html");
});

viewRouter.get("/event", (req: Request, res: Response) => {
    res.sendFile(path.parse(__dirname).dir + "/views/event.html");
});

viewRouter.get("/historical", (req: Request, res: Response) => {
    res.sendFile(path.parse(__dirname).dir + "/views/historical.html");
});

viewRouter.get("/login", (req: Request, res: Response) => {
  res.sendFile( path.parse(__dirname).dir + "/views/login.html");
});

viewRouter.get("/admin", (req: Request, res: Response) => {
  res.sendFile( path.parse(__dirname).dir + "/views/admin.html");
});

viewRouter.get("/user", (req: Request, res: Response) => {
  res.sendFile( path.parse(__dirname).dir + "/views/user.html");
});

export default viewRouter;