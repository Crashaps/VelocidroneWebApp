import mongoose, { Document, Schema, Model } from "mongoose";

interface IEventData extends Document {
	name: string;
	createDate: Date;
	eventStartDate: Date;
	heatCount: number;
	hostIds: Array<string>;
	active: boolean;
	pointsbased: boolean;
}

const EventDataSchema: Schema = new mongoose.Schema({
	name: String,
	createDate: Date,
	eventStartDate: Date,
	heatCount: Number,
	hostIds: Array,
	active: Boolean,
	pointsBased: Boolean
});

const EventData: Model<IEventData> = mongoose.model<IEventData>("EventData", EventDataSchema);

class Event extends EventData {
	constructor();
	constructor(event?: IEventData) {
		super();

		this.name = event?.name ?? "";
		this.createDate = event?.createDate ?? new Date();
		this.eventStartDate = event?.eventStartDate ?? new Date();
		this.heatCount = event?.heatCount ?? 0;
		this.hostIds = event?.hostIds ?? [];
		this.active = event?.active ?? false;
		this.pointsbased = event?.pointsbased ?? false;

		this._id = event?._id ?? new mongoose.Types.ObjectId();
		this.isNew = event?.isNew ?? true;
	}

	static createEvent(name: string, createdDate: Date, eventStartDate: Date, heatCount: number, hostIds: string[], active: boolean, pointsBased: boolean): Event {
		const event = new Event();
		event.name = name;
		event.createDate = createdDate;
		event.eventStartDate = eventStartDate;
		event.heatCount = heatCount;
		event.hostIds = hostIds;
		event.active = active;
		event.pointsbased = pointsBased;
		return event;
	}

	static async findOneByHostId(hostId: string): Promise<Event | null> {
		return await this.findOne({ hostIds: { $in: [hostId] }, active: true });
	}
}

export default Event;
