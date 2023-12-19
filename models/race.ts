import mongoose, { Document, Schema, Model } from "mongoose";

export interface IGateData {
	position: number;
	lap: number;
	gate: number;
	time: number
}

export interface IRaceData extends Document {
	pilotName: string;
	finished: boolean;
	aborted: boolean;
	colour: string;
	gateData: IGateData[];
	heatDateTime?: Date;
	heatNumber: number;
	eventId: string;
	hostId: string;
}

const RaceDataSchema: Schema = new mongoose.Schema({
	pilotName: { type: String, required: true },
	finished: Boolean,
	aborted: Boolean,
	colour: String,
	gateData: [{
		position: Number,
		lap: Number,
		gate: Number,
		time: Number
	}],
	heatDateTime: Date,
	heatNumber: Number,
	eventId: String
});

const RaceData: Model<IRaceData> = mongoose.model<IRaceData>("RaceData", RaceDataSchema);

class Race extends RaceData {
	constructor();
	constructor(race?: IRaceData) {
		super();

		this.pilotName = race?.pilotName ?? "";
		this.finished = race?.finished ?? false;
		this.colour = race?.colour ?? "";
		this.heatDateTime = race?.heatDateTime;
		this.heatNumber = race?.heatNumber ?? 0;
		this.eventId = race?.eventId ?? "";
		this.aborted = race?.aborted ?? false;

		this.gateData = race?.gateData ?? [];

		this._id = race?._id ?? new mongoose.Types.ObjectId();
		this.isNew = race?.isNew ?? true;

	}

	addGateData(position: number, lap: number, gate: number, time: number): void {
		this.gateData.push({ position, lap, gate, time });
	}

	hasGateTime(time: number): boolean {
		for (const gate of this.gateData) {
			if (gate.time == time) {
				return true;
			}
		}

		return false;
	}

	static createRace(pilotName: string, finished: boolean, aborted: boolean, colour: string, heatDateTime: Date, heatNumber: number, eventId: string): Race {
		const race = new Race();
		race.pilotName = pilotName;
		race.finished = finished;
		race.aborted = aborted;
		race.colour = colour;
		race.heatDateTime = heatDateTime;
		race.heatNumber = heatNumber;
		race.eventId = eventId;
		race.gateData = [];
		return race;
	}

	static async getByPilotName(pilotName: string): Promise<Race[]> {
		return (await this.find({ pilotName: pilotName })) as Race[];
	}

	static async findByEventId(eventId: string, finished?: boolean, aborted: boolean = false): Promise<Race[]> {
		if (finished === undefined) {
			return await this.find({ eventId: eventId, aborted: aborted });
		}
		else {
			return await this.find({ eventId: eventId, finished: finished, aborted: aborted });
		}
	}

	static async findByEventIdAndHostId(eventId: string, hostId: string, finished?: boolean, aborted: boolean = false): Promise<Race[]> {
		if (finished === undefined) {
            return await this.find({ eventId: eventId, hostId: hostId, aborted: aborted });
        }
        else {
            return await this.find({ eventId: eventId, hostId: hostId, finished: finished, aborted: aborted });
        }
	}	

	static async findOneByPilotAndEventId(pilotName: string, eventId: string, finished?: boolean, aborted: boolean = false): Promise<Race | null> {
		if (finished === undefined) {
			return await this.findOne({ pilotName: pilotName, eventId: eventId, aborted: aborted });
		}
		else {
			return await this.findOne({ pilotName: pilotName, eventId: eventId, finished: finished, aborted: aborted });
		}
	}

	static async countByPilotAndEventId(pilotName: string, eventId: string, finished?: boolean, aborted: boolean = false): Promise<number> {
		if (finished === undefined) {
			return await this.countDocuments({ pilotName: pilotName, eventId: eventId, aborted: aborted });
		}
		else {
			return await this.countDocuments({ pilotName: pilotName, eventId: eventId, finished: finished, aborted: aborted });
		}
	}
}

export default Race;
