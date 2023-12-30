import jwt from "jsonwebtoken";
import User from "../models/user";
import { Response, NextFunction } from "express";
import RequestPlus from "../models/RequestPlus";

const auth = {
    byApiKey: async (req: RequestPlus, res: Response, next: NextFunction) => {
        try {
            const token = req.header("x-api-key");

            if (!token) {
                throw new Error();
            }

            const user = await User.getByApiKey(token);
            req.user = user;
            next();
        }
        catch (error) {
            res.status(401).json({ message: "No token provided." });
        }
    },
    byToken: async (req: RequestPlus, res: Response, next: NextFunction) => {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const settings = require("../settings.json");

        const token = req.header("Authorization") || "";

        console.log("token: " + token);
        console.log("JWTKey " + settings.JWTKey);

        try {
            const data = jwt.verify(token, settings.JWTKey) as jwt.JwtPayload;

            try {
                const user = await User.getByToken(data._id, token);
                if (!user) {
                    throw new Error();
                }

                req.user = user;
                req.token = token;
                next();
            } catch (error) {
                res.status(401).send({ error: "Not authorized to access this resource" });
            }
        } catch (outerErr) {
            res.status(500).send({ error: "Internal Server Error" });
        }
    },
    byCredentials: async (req: RequestPlus, res: Response, next: NextFunction) => {
        try {
            const { username, password } = req.body;
            const user = await User.getByName(username);

            if (!user || await user.isPasswordMatch(password) == false) {
                res.status(401).send({ error: "Login failed! Check authentication credentials" });
            } else {
                req.user = user;
                next();
            }
        } catch (err) {
            res.status(501).send({ error: "Login failed! Internal server error" });
        }
    },
};

export default auth;
