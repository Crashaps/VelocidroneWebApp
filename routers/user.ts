import express, { Response } from "express";

import RequestPlus from "../models/RequestPlus";
import Auth from "../middleware/auth";

import EmailSenderHolder from "../models/emailSender";

import User from "../models/user";
import path from "path";

import crypto from "crypto";

const userRouter = express.Router();

userRouter.post("/login", Auth.byCredentials, async (req: RequestPlus, res: Response) => {
    if (!req.user) {
        res.status(401).send();
        return;
    }

    const token = await req.user.generateAuthToken();

    res.json({ token });
});

userRouter.post("/invite", Auth.byToken, async (req: RequestPlus, res: Response) => {
    if (!req.user) {
        res.status(401).send();
        return;
    }

    const { email } = req.body;
    if (!email) {
        res.status(400).send();
        return;
    }

    const user = User.createUser(email, crypto.randomUUID(), email);
    const firstUuid = crypto.randomUUID().replace(/-/g, "");
    const secondUuid = crypto.randomUUID().replace(/-/g, "");
    user.token = `${firstUuid}${secondUuid}`;

    await user.save();

    await EmailSenderHolder.sendMail(
        email,
        "Invitation",
        "You have been invited to join the race!",
        `
        <html>
            <body>
                <h1>
                    <a href="https://velocevent.com/accept?ref=${user.token}">You have been invited to join the race! </a>
                </h1>
            </body>
        </html>`
    );

    res.send({message: "Successfully invited!"});
});

userRouter.get("/accept", async (req: RequestPlus, res: Response) => {
    const user = await User.findOne({ token: req.query.ref });

    if (!user) {
        res.status(401).send();
        return;
    }

    res.sendFile(path.parse(__dirname).dir + "/views/acceptInvite.html");
});

userRouter.post("/accept", async (req: RequestPlus, res: Response) => {
    const user = await User.findOne({ token: req.headers.authorization }) as User;

    if (!user) {
        res.status(401).send();
        return;
    }

    user.name = req.body.username;
    user.password = req.body.password;

    const token = await user.generateAuthToken();

    res.json({ token: token });
});

userRouter.post("/generateApiKey", Auth.byToken, async (req: RequestPlus, res: Response) => {
    if (!req.user) {
        res.status(401).send();
        return;
    }

    req.user.apiKey = crypto.randomUUID().replace(/-/g, "")
    await req.user.save();
    res.json({ apiKey: req.user.apiKey });
});

userRouter.get("/userdetails", Auth.byToken, async (req: RequestPlus, res: Response) => {
    if (!req.user) {
        res.status(401).send();
        return;
    }

    res.json({ username: req.user.name, email: req.user.email, apiKey: req.user.apiKey });
});

export default userRouter;