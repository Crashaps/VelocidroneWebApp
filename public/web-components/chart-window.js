class ChartWindow extends ClosableMiniWindow {
    constructor() {
        super();
    }

    connectedCallback() {
        super.connectedCallback();

        this.chartDiv = document.createElement("div");
        this.chartDiv.id = "raceChartDiv" + this.id;
        this.chartDiv.style.width = "95%";
        this.chartDiv.style.height = "95%";
        this.chartDiv.style.position = "absolute";
        this.chartDiv.style.overflow = "hidden";

        let canvas = document.createElement("canvas");
        canvas.id = "raceChart" + this.id;
        canvas.style.width = "90%";
        canvas.style.height = "90%";
        canvas.style.position = "relative";

        let ctx = canvas.getContext("2d");
        this.raceChart = this.createRaceChart(ctx);

        this.chartDiv.appendChild(canvas);
        this.appendChild(this.chartDiv);
    }

    createRaceChart(ctx) {
        return new Chart(ctx, {
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
    }

    updateRaceChart(data) {
        const raceChart = this.raceChart;
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

    disconnectedCallback() {
    }
}

customElements.define('chart-window', ChartWindow);