import { Request } from "express";
import { Server as SocketIOServer } from "socket.io";
import User from "./user";

export default interface RequestPlus extends Request {
    io?: SocketIOServer,
    user?: User;
    token?: string;
// eslint-disable-next-line semi
}