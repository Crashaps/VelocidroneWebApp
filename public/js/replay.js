
function resetReplays() {
    if (document.replayThreads) {
        document.replayThreads.forEach((thread) => {
            clearTimeout(thread);
        });
    }

    document.replayThreads = [];
}

function replayPilotDif(pilotName) {
    document.raceChart.data.datasets = [];

    resetReplays();

    fetch(`/heat/${document.currentEventHost.split("|")[0]}/${encodeURIComponent(pilotName)}`)
        .then((response) => response.json())
        .then((data) => {
            data.forEach((item, index) => {
                item.gateData.forEach((gateData, gateIndex) => {
                    document.replayThreads.push(setTimeout(() => {
                        const randomColor = Math.floor(Math.random() * 16777215).toString(16)
                        updateRaceChart({
                            pilotName: `${item.pilotName} ${index}`,
                            colour: `#${randomColor}`,
                            gateData: [{
                                time: (gateIndex == 0 ? gateData.time : gateData.time - item.gateData[gateIndex - 1].time),
                                gate: gateData.gate,
                                lap: gateData.lap
                            }]
                        });
                    }, gateData.time * 100));
                });
            });
        }).catch((error) => { console.log(error); });
}

function replayPilotBest(pilotName) {
    document.raceChart.data.datasets = [];

    resetReplays();

    fetch(`/bestPossible/${document.currentEventHost.split("|")[0]}/${encodeURIComponent(pilotName)}`)
        .then((response) => response.json())
        .then((data) => {
            const colors = createRainbowDiv(0, data.length);

            data.forEach((item, index) => {
                item.gateData.forEach((gateData, gateIndex) => {
                    document.replayThreads.push(setTimeout(() => {
                        updateRaceChart({
                            pilotName: `${item.pilotName} ${item.heatNumber}`,
                            colour: item.heatNumber > 0 ? colors[item.heatNumber - 1] : "#000000",
                            gateData: [{
                                time: gateData.time,
                                gate: gateData.gate,
                                lap: gateData.lap
                            }]
                        });
                    }, gateData.time * 1000));
                });
            });
        }).catch((error) => { console.log(error); });
}

function replayPilot(pilotName) {
    document.raceChart.data.datasets = [];

    resetReplays();

    fetch(`/heat/${document.currentEventHost.split("|")[0]}/${encodeURIComponent(pilotName)}`)
        .then((response) => response.json())
        .then((data) => {

            data.forEach((item, index) => {
                item.gateData.forEach((gateData, gateIndex) => {
                    document.replayThreads.push(setTimeout(() => {
                        const randomColor = Math.floor(Math.random() * 16777215).toString(16)
                        updateRaceChart({
                            pilotName: `${item.pilotName} ${index}`,
                            colour: `#${randomColor}`,
                            gateData: [{
                                time: gateData.time,
                                gate: gateData.gate,
                                lap: gateData.lap
                            }]
                        });
                    }, gateData.time * 100));
                });
            });
        }).catch((error) => { console.log(error); });
}

function replay(heatNumber) {
    document.raceChart.data.datasets = [];

    resetReplays();

    fetch(`/heatdata/${document.currentEventHost.split("|")[0]}/${heatNumber}`)
        .then((response) => response.json())
        .then((data) => {
            const colors = createRainbowDiv(0, data.length * 1.1);

            data.forEach((item, index) => {
                item.gateData.forEach((gateData) => {
                    document.replayThreads.push(setTimeout(() => {
                        updateRaceChart({
                            pilotName: item.pilotName,
                            colour: colors[index],
                            gateData: [{
                                time: gateData.time,
                                gate: gateData.gate,
                                lap: gateData.lap
                            }]
                        });
                    }, gateData.time * 10));
                });
            });
        }).catch((error) => { console.log(error); });
}

function replayHeatIdeal(heatNumber) {
    document.raceChart.data.datasets = [];

    resetReplays();

    fetch(`/heatdata/${document.currentEventHost.split("|")[0]}/${heatNumber}/ideal`)
        .then((response) => response.json())
        .then((data) => {
            const colors = createRainbowDiv(0, data.length * 1.1);

            data.forEach((item, index) => {
                item.gateData.forEach((gateData) => {
                    document.replayThreads.push(setTimeout(() => {
                        updateRaceChart({
                            pilotName: item.pilotName,
                            colour: colors[index],
                            gateData: [{
                                time: gateData.time,
                                gate: gateData.gate,
                                lap: gateData.lap
                            }]
                        });
                    }, gateData.time * 10));
                });
            });
        }).catch((error) => { console.log(error); });
}