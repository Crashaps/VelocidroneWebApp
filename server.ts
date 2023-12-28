// seed leader board, collate rooms, call pilots per group, run 3 races = 1 heat, change group, repeat... all groups run 3 heats, shuffle by points, repeat
// finish time, number pilots per heat -> assign fastest pilot points = number of pilots, down to 1, repeat for 3 heats * 2, the heat of 4 races

import express, { Application, Request, Response } from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import http from "http";
import fs from "fs";
import { Server as SocketIOServer } from "socket.io";

const app: Application = express();
const server = http.createServer(app);
const io = new SocketIOServer(server);

import viewRouter from "./routers/views";
import raceApi from "./routers/raceApi";
import userRouter from "./routers/user";
import eventRouter from "./routers/event";
import RequestPlus from "./models/RequestPlus";

const settings = JSON.parse(fs.readFileSync("./settings.json", "utf-8"));

mongoose.connect(settings.mongodb);

app.use(bodyParser.json());
app.use(express.static(__dirname + "/public"));

app.use((req: Request, res: Response, next) => {
    (req as RequestPlus).io = io;
    next();
});

app.use(viewRouter);
app.use(raceApi);
app.use(userRouter);
app.use(eventRouter);

server.listen(3000, () => {
    console.log("Server running on port 3000");
});

io.on("connection", function (socket) {
    socket.on("room", function (room) {
        socket.join(room);
        console.log(`Client: ${socket.id} connected to room: ${room}`);
    });
    console.log(`Connection from client: ${socket.id}`);
});
