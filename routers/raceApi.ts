import express, { Response } from "express";

import Race from "../models/race";
import Event from "../models/event";
import auth from "../middleware/auth";
import RequestPlus from "../models/RequestPlus";

const raceRouter = express.Router();

raceRouter.post("/racestatus", auth.byApiKey, async (req: RequestPlus, res: Response) => {
    const event = await Event.findOneByHostId(req.user?._id);

    if (event === null) {
        res.status(400).send("Event not found");
        return;
    }

    if (req.body.racestatus.raceAction == "start") {
        // raceDateTime = new Date(Date.now());
        // raceStarted = true;
    }
    else if (req.body.racestatus.raceAction == "race finished") {
        //raceStarted = false;
    }
    else if (req.body.racestatus.raceAction == "abort") {
        const races = await Race.findByEventIdAndHostId(event?._id, req.user?._id, false);

        races.forEach((race) => {
            race.aborted = true;
            race.save();
        });
    }

    if (req.io) {
        req.io.in(`${event._id}|${req.user?._id}`).emit("raceStatus", req.body.racestatus.raceAction);
    }

    res.send("Data received and saved");
});

raceRouter.post("/racedata", auth.byApiKey, async (req: RequestPlus, res: Response) => {
    try {
        const raceData = req.body;

        if (!req.user) {
            res.status(401).send();
            return;
        }

        const event = await Event.findOneByHostId(req.user._id);

        if (!event) {
            res.status(401).send();
            return;
        }

        for (const pilotName of Object.keys(raceData["racedata"])) {
            const pilotRace = raceData["racedata"][pilotName];
            const pilotFinished = pilotRace.finished.toLowerCase() == "true";

            let data: Race | null;

            let races = await Race.findByEventIdAndPilotName(event._id.toString(), pilotName, false);

            if (races.length > 1) {
                const heatNumber = races[0].heatNumber;
                let first = races.reduce((prev, curr) => { return prev.heatDateTime ?? new Date() < (curr.heatDateTime ?? new Date()) ? prev : curr; });

                if (races.every((race) => race.heatNumber == heatNumber)) {
                    await Promise.all(races.filter((race) => race !== first).map(async (race) => {
                        race.aborted = true;
                        race.gateData.forEach((gate) => {
                            first.gateData.push(gate);
                        });
                        await race.save();
                    }));
                }

                data = first;
            }
            else if (races.length == 1) {
                data = races[0];
            }
            else {
                data = null;
            }

            if (data !== null) {
                if (data.hasGateTime(pilotRace.time)) {
                    continue;
                }

                data.finished = pilotFinished;
            }
            else {
                const heatNumber = await Race.countByPilotAndEventId(pilotName, String(event._id), true);
                data = Race.createRace(pilotName, pilotFinished, false, "#" + pilotRace.colour, new Date(Date.now()), heatNumber + 1, event._id, req.user._id);
            }

            data.addGateData(pilotRace.position, pilotRace.lap, pilotRace.gate, pilotRace.time);

            await data.save();

            if (req.io) {
                try {
                    req.io.in(`${event._id}|${req.user._id}`).emit("raceDataUpdate", data);
                } catch (error) {
                    console.error(error);
                }

                if (data.finished == true) {
                    let finishedForHeat: Race[] | null = null;

                    try {
                        finishedForHeat = event.pointsbased == false ? null : await Race.findByEventIdAndHeatNumber(event._id, data.heatNumber, true);

                        if (finishedForHeat !== null) {
                            finishedForHeat = finishedForHeat.sort((a, b) => b.gateData[a.gateData.length - 1].time - a.gateData[a.gateData.length - 1].time);

                            finishedForHeat.forEach((race) => {
                                race.points = (finishedForHeat?.indexOf(race) ?? 0) + 1;
                                race.save();
                            });
                        }
                    } catch (error) {
                        console.error(error);
                    }

                    try {
                        req.io.in(`${event._id}`).emit("pilotFinished",
                            {
                                pilotName: data.pilotName,
                                time: data.gateData[data.gateData.length - 1].time,
                                pilotPoints: finishedForHeat?.map((race) => ({
                                    pilotName: race.pilotName,
                                    points: race.points
                                }))
                            });
                    } catch (error) {
                        console.error(error);
                    }
                }
            }
        }
    }
    catch (error) {
        console.error({ time: new Date(Date.now()).toUTCString(), error: error });
        res.status(500).send({ error: "Internal server error" });
        return;
    }

    res.send("Data received and saved");
});

export default raceRouter;