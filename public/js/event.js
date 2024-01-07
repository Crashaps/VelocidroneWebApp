window.onload = function () {
    var eventHostSocket = io();
    var eventSocket = io();

    var ctx = document.getElementById("raceChart").getContext("2d");
    var raceChart = new Chart(ctx, {
        type: "line",
        data: {
            datasets: [],
        },
        options: {
            plugins: {
                legend: {
                    labels: {
                        color: "white",
                        font: {
                            size: 15
                        }
                    }
                }
            },
            scales: {
                y: {
                    ticks: {
                        color: "white",
                        font: {
                            size: 15,
                        },
                        stepSize: 1,
                        beginAtZero: true
                    }
                },
                x: {
                    ticks: {
                        color: "white",
                        font: {
                            size: 15
                        },
                        stepSize: 1,
                        beginAtZero: true
                    }
                }
            }
        },
    });

    document.raceChart = raceChart;

    eventHostSocket.on("raceStatus", function (status) {
        var statusBox = document.getElementById("raceStatusBox");
        statusBox.textContent = `Race Status: ${status}`;
        if (status === "start") {
            raceChart.data.datasets = [];
        }
    });

    eventHostSocket.on("raceDataUpdate", updateRaceChart);

    eventSocket.on("pilotFinished", function (data) {
        addTimeToTable({ pilotName: data.pilotName, time: data.time });
    });


    document.getElementById("eventDropdown").addEventListener("focus", function () {
        document.currentEventHost = this.value;
    });

    document.getElementById("eventDropdown").addEventListener("change", function () {
        const selectedEventId = this.value.split("|")[0];
        if (selectedEventId) {
            fetch("/current-finish-times/" + selectedEventId)
                .then((response) => response.json())
                .then(fillTimesTable)
                .catch((error) => console.error("Error:", error));

            if (document.currentEventHost != null) {
                eventHostSocket.emit("leave-room", document.currentEventHost);
                eventSocket.emit("leave-room", document.currentEventHost.split("|")[0]);
            }

            eventHostSocket.emit("join-room", this.value);
            eventSocket.emit("join-room", selectedEventId);

            document.currentEventHost = this.value;
        }
    });

    fetch("/current-events")
        .then((response) => response.json())
        .then((events) => {
            const dropdown = document.getElementById("eventDropdown");
            events.forEach((event) => {
                event.hosts.forEach((host) => {
                    const option = document.createElement("option");
                    option.value = `${event.id}|${host.id}`;
                    option.textContent = `${event.name}: ${host.name}`;
                    dropdown.appendChild(option);
                });
            });
        })
        .catch((error) => console.error("Error:", error));

    window.addEventListener("beforeunload", () => {
        resetReplays();
    });

};

function updateRaceChart(data) {
    const raceChart = document.raceChart;
    let dataset = raceChart.data.datasets.find(
        (ds) => ds.label === data.pilotName
    );
    if (dataset) {
        dataset.data.push({
            x:
                data.gateData[data.gateData.length - 1].lap.toString() +
                "-" +
                data.gateData[data.gateData.length - 1].gate.toString(),
            y: data.gateData[data.gateData.length - 1].time,
        });

        dataset.data = dataset.data.sort(function (a, b) {
            const aSplit = a.x.split('-');
            const bSplit = b.x.split('-');

            if (Number(aSplit[0]) < Number(bSplit[0])) {
                return -1;
            }
            else if (Number(aSplit[0]) > Number(bSplit[0])) {
                return 1;
            }
            else if (Number(aSplit[1]) < Number(bSplit[1])) {
                return -1;
            }
            else if (Number(aSplit[1]) > Number(bSplit[1])) {
                return 1;
            }
            else {
                return 0;
            }

        });

    } else {
        raceChart.data.datasets.push({
            label: data.pilotName,
            data: [
                {
                    x:
                        data.gateData[data.gateData.length - 1].lap.toString() +
                        "-" +
                        data.gateData[data.gateData.length - 1].gate.toString(),
                    y: data.gateData[data.gateData.length - 1].time,
                },
            ],
            borderColor: data.colour,
            fill: false,
        });
    }

    raceChart.options.animation = false;

    raceChart.update();
    raceChart.update();

    raceChart.options.animation = {
        duration: 1000,
    };
}

function fillTimesTable(data) {
    const tableBody = document.getElementById("finishTimesBody");

    tableBody.innerHTML = "";
    data.forEach((item, index) => {
        let row = tableBody.insertRow();
        let pilotNameCell = row.insertCell(0);
        pilotNameCell.innerHTML = `<a class="fingerPointer" onclick="replayPilotBest('${item.pilotName}')">${item.pilotName} </a>`;

        item.times.forEach((time) => {
            let timeCell = row.insertCell();
            timeCell.textContent = time;
        });

        const tableHead = document.getElementById("finishTimesTable").tHead;
        var columnCount = tableHead.rows[0].cells.length - 1;
        if (columnCount < item.times.length) {
            for (let i = columnCount + 1; i <= item.times.length; i++) {
                let newHeader = tableHead.rows[0].insertCell();
                newHeader.outerHTML = `<th><a class="fingerPointer" onclick="replayHeatIdeal(${i})">Race ${i}</a></th>`;
            }
        }
    });
}

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

function addTimeToTable(data) {
    var pilotRow = getRowByPilotName(data.pilotName);

    if (pilotRow == null) {
        const tableBody = document.getElementById("finishTimesBody");
        pilotRow = tableBody.insertRow();
        let pilotNameCell = pilotRow.insertCell(0);
        pilotNameCell.innerHTML = `<a class="fingerPointer" onclick="replayPilotBest('${data.pilotName}')">${data.pilotName} </a>`;
    }

    var cell = pilotRow.insertCell();
    cell.textContent = data.time;

    const tableHead = document.getElementById("finishTimesTable").tHead;
    var columnCount = tableHead.rows[0].cells.length - 1;
    if (pilotRow.cells.length > tableHead.rows[0].cells.length) {
        let newHeader = tableHead.rows[0].insertCell();
        newHeader.outerHTML = `<th><a class="fingerPointer" onclick="replay(${pilotRow.cells.length - 1})">Race ${pilotRow.cells.length - 1}</a></th>`;
    }
}

function getRowByPilotName(pilotName) {
    const table = document.getElementById("finishTimesTable");
    const rows = table.getElementsByTagName("tr");

    for (let i = 0; i < rows.length; i++) {
        // Assuming the pilot's name is in the first cell
        const currentPilotName = rows[i].cells[0].textContent;
        if (currentPilotName === pilotName) {
            return rows[i]; // This is the row you're looking for
        }
    }

    return null; // Return null if no row is found for the given pilot name
}
