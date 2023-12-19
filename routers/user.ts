import express, { Response } from "express";

import RequestPlus from "../models/RequestPlus";
import Auth from "../middleware/auth";

const userRouter = express.Router();

userRouter.post("/login", Auth.byCredentials, async (req: RequestPlus, res: Response) => {
    if (!req.user) {
        res.status(401).send();
        return;
    }
    
    const token = await req.user.generateAuthToken();

    res.json({ token });
});


export default userRouter;