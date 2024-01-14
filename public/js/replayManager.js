class ReplayManager {
    static animationFrameId = null;
    static chartWindow = null;
    static replayData = [];
    static startTime = null;

    constructor() {
        throw new Error("This is a singleton class and cannot be instantiated");
    }

    static getChartWindow() {
        if (!ReplayManager.chartWindow) {
            ReplayManager.chartWindow = document.createElement('chart-window');
            ReplayManager.chartWindow.id = "replayChartWindow";
            document.body.appendChild(ReplayManager.chartWindow);
        }
        ReplayManager.chartWindow.style.zIndex = 1000;

        return ReplayManager.chartWindow;
    }

    static resetReplays() {
        if (ReplayManager.animationFrameId) {
            cancelAnimationFrame(ReplayManager.animationFrameId);
        }
        ReplayManager.replayData = [];

        if (ReplayManager.chartWindow) {
            ReplayManager.chartWindow.raceChart.data.datasets = [];
        }
    }

    static startReplayLoop() {
        ReplayManager.startTime = performance.now();
        ReplayManager.animationFrameId = requestAnimationFrame(ReplayManager.replayLoop);
    }

    static replayLoop(timestamp) {
        const elapsedTime = timestamp - ReplayManager.startTime;
        const chartWindow = ReplayManager.getChartWindow();
        let isMoreDataToProcess = false;

        ReplayManager.replayData.forEach(item => {
            item.gateData.forEach(gateData => {
                if (!gateData.processed && gateData.time <= elapsedTime) {
                    chartWindow.updateRaceChart({
                        pilotName: item.pilotName,
                        colour: item.colour,
                        gateData: [{
                            time: gateData.time / 1000,
                            gate: gateData.gate,
                            lap: gateData.lap
                        }]
                    });
                    gateData.processed = true; // Mark as processed
                }
                if (gateData.time > elapsedTime) {
                    isMoreDataToProcess = true; // There's more data to process in future frames
                }
            });
            item.gateData = item.gateData.filter(gateData => !gateData.processed); // Remove processed
        });

        ReplayManager.replayData = ReplayManager.replayData.filter(item => item.gateData.length > 0);

        if (isMoreDataToProcess) {
            ReplayManager.animationFrameId = requestAnimationFrame(ReplayManager.replayLoop);
        } else {
            // Animation complete, reset if necessary
            ReplayManager.resetReplays();
        }
    }

    static prepareReplayData(rawData) {
        const colors = createRainbowDiv(0, rawData.length * 1.1);

        ReplayManager.replayData = rawData.map(item => ({
            pilotName: item.pilotName,
            colour: colors[rawData.indexOf(item)],
            gateData: item.gateData.map(gateData => ({
                time: gateData.time * 1000, // Convert time to milliseconds
                gate: gateData.gate,
                lap: gateData.lap
            }))
        }));
    }

    static getRandomColor() {
        return `#${Math.floor(Math.random() * 16777215).toString(16)}`;
    }

    static replayPilotDif(pilotName) {
        ReplayManager.fetchReplayData(`/heat/${document.currentEventId}/${encodeURIComponent(pilotName)}`);
    }

    static replayPilotBest(pilotName) {
        ReplayManager.fetchReplayData(`/bestPossible/${document.currentEventId}/${encodeURIComponent(pilotName)}`);
    }

    static replayPilot(pilotName) {
        ReplayManager.fetchReplayData(`/heat/${document.currentEventId}/${encodeURIComponent(pilotName)}`);
    }

    static replay(heatNumber) {
        ReplayManager.fetchReplayData(`/heatdata/${document.currentEventId}/${heatNumber}`);
    }

    static replayHeatIdeal(heatNumber) {
        ReplayManager.fetchReplayData(`/heatdata/${document.currentEventId}/${heatNumber}/ideal`);
    }

    static fetchReplayData(url) {
        fetch(url)
            .then((response) => response.json())
            .then((data) => {
                ReplayManager.resetReplays();
                ReplayManager.prepareReplayData(data);
                ReplayManager.startReplayLoop();
            }).catch((error) => { console.log(error); });
    }
}

