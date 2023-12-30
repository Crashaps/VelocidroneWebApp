/* eslint-disable @typescript-eslint/no-unused-vars */
import express, { Request, Response } from "express";
import RequestPlus from "../models/RequestPlus";
import Auth from "../middleware/auth";
import Event from "../models/event";
import User from "../models/user";
import Race, { IRaceData } from "../models/race";
import { RaceFinishTimes } from "../models/raceFinishTimes";

const eventRouter = express.Router();

eventRouter.get("/current-events", async (req: Request, res: Response) => {
	const events = await Event.find({});
	const users = await User.findByIds(events.flatMap((e) => e.hostIds));

	const e = await Promise.all(events.map(async (p) =>
	({
		id: p.id,
		name: p.name,
		hosts: await Promise.all(p.hostIds.map(async (h) => ({
			id: h,
			name: users.find((u) => u.id == h)?.name
		})))
	})));

	res.json(e);
});

eventRouter.post("/create-event", Auth.byToken, async (req: RequestPlus, res: Response) => {
	if (!req.user) {
		res.status(401).send();
		return;
	}

	const event = Event.createEvent(req.body.name, new Date(Date.now()), new Date(req.body.eventStartDate), req.body.heatCount, [req.user._id], false, true);

	await event.save();
});

eventRouter.get("/current-finish-times/:eventId", async (req: Request, res: Response) => {
	try {
		const eventId = req.params.eventId;

		const raceData = await Race.findByEventId(eventId);

		const pilotFinishTimes: RaceFinishTimes[] = [];

		raceData.forEach((data) => {
			const pilot = pilotFinishTimes.find((e) => e.pilotName === data.pilotName);

			if (pilot === undefined) {
				pilotFinishTimes.push(new RaceFinishTimes(data.pilotName, [data.gateData[data.gateData.length - 1].time]));
			}
			else {
				pilotFinishTimes[pilotFinishTimes.indexOf(pilot)].addTime(data.gateData[data.gateData.length - 1].time);
			}
		});

		res.json(pilotFinishTimes);
	} catch (error) {
		res.status(500).send("Error fetching finish times");
	}
});

eventRouter.post("/heatstart", async (req: Request, res: Response) => {
	// do some heat stuff.....
	// TODO: heat start per colour group

});

eventRouter.get("/historical-data/:pilotName", async (req: Request, res: Response) => {
	try {
		const pilotName = req.params.pilotName;
		const historicalData = await Race.find({ pilotName: pilotName });
		res.json(historicalData.map(createHistoricData));
	} catch (error) {
		res.status(500).send("Error fetching historical data");
	}
});

eventRouter.get("/components", async (req: Request, res: Response) => {
	try {
		res.send("Race Chart")
	}
	catch (error) {

	}
});

eventRouter.get("/list-races/:eventId/:pilotName", async (req: Request, res: Response) => {
	try {
        const eventId = req.params.eventId;
        const pilotName = req.params.pilotName;
        const races = await Race.find({ eventId: eventId, pilotName: pilotName });
        res.json(races.map(createHeatList));
    } catch (error) {
        res.status(500).send("Error fetching historical data");
    }
});

eventRouter.get("/list-pilots/:eventId", async (req: Request, res: Response) => {
	const eventId = req.params.eventId;
	const races = await Race.find({ eventId: eventId });

	const pilotNames = races.map((race) => race.pilotName);

	res.json([...new Set(pilotNames)]);
});

eventRouter.delete("/delete-race/:raceId", Auth.byToken, async (req: RequestPlus, res: Response) => {
	const race = await Race.findById(req.params.raceId);
	if (!race) {
		res.status(404).send();
        return;
	}

	const deleteResult = await race.deleteOne();

	if (deleteResult.deletedCount == 0) {
		res.status(500).send("Failed to delete");
	}

	if (race) {
		if (await Race.decrementHeatNumber(race.pilotName, race.eventId, 1, race.heatNumber)){
			res.status(200).send("Success");
		} else {
			res.status(500).send("Failed");
		}
	} else {
		res.status(500).send("Error deleting race");
	}
});

function createHeatList(data: IRaceData){
	return {
		heat: data.heatNumber,
        time: data.gateData[data.gateData.length - 1].time,
		_id: data._id
	};
}

function createHistoricData(data: IRaceData) {
	return {
		pilotName: data.pilotName,
		eventId: data.eventId,
		raceTime: data.gateData[data.gateData.length - 1].time
	};
}


export default eventRouter;