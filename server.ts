// seed leader board, collate rooms, call pilots per group, run 3 races = 1 heat, change group, repeat... all groups run 3 heats, shuffle by points, repeat
// finish time, number pilots per heat -> assign fastest pilot points = number of pilots, down to 1, repeat for 3 heats * 2, the heat of 4 races

import express, { Application, Request, Response } from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import http from "http";
import fs from "fs";
import { Server as SocketIOServer } from "socket.io";
import EmailSenderHolder from "./models/emailSender";

const app: Application = express();
const server = http.createServer(app);
const io = new SocketIOServer(server);

import viewRouter from "./routers/views";
import raceApi from "./routers/raceApi";
import userRouter from "./routers/user";
import eventRouter from "./routers/event";
import RequestPlus from "./models/RequestPlus";

const settings = JSON.parse(fs.readFileSync("./settings.json", "utf-8"));

EmailSenderHolder.initSender(settings.smtpHost, settings.smtpPort, settings.smtpSecure, settings.smtpUsername, settings.smtpPassword, settings.smtpFrom);

mongoose.connection.on('connected', (event) => console.log('connected ' + event));
mongoose.connection.on('open', (event) => console.log('open ' + event));
mongoose.connection.on('disconnected', (event) => console.log('disconnected ' + event));
mongoose.connection.on('reconnected', (event) => console.log('reconnected ' + event));
mongoose.connection.on('disconnecting', (event) => console.log('disconnecting ' + event));
mongoose.connection.on('close', (event) => console.log('close ' + event));
mongoose.connection.on('error', err => console.log(err));

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

server.listen(settings.serverPort, () => {
    console.log(`Server running on port ${settings.serverPort}`);
});

io.on("connection", function (socket) {
    socket.on("join-room", function (room) {
        if (!socket.rooms.has(room)) {
            socket.join(room);
            console.log(`Client: ${socket.id} connected to room: ${room}`);
        }
    });
    socket.on("leave-room", function (room) {
        console.log(`Client: ${socket.id} disconnected from room: ${room}`);
        socket.leave(room);
    });
    socket.on("disconnecting", () => {
        console.log(socket.rooms);
        socket.rooms.forEach((k, v) => {
            console.log(`Client: ${socket.id} disconnected from room: ${k}`);
            socket.leave(v);
        });
    });
    console.log(`Connection from client: ${socket.id}`);
});
