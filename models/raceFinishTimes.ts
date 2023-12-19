

export class RaceFinishTimes {
    constructor(pilotName: string, times: number[]) {
        this.pilotName = pilotName;
        this.times = times;
    }

    public pilotName: string;
    public times: number[];

    addTime(time: number): void {
        this.times.push(time);
    }
}