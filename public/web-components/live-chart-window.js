
class LiveChartWindow extends ChartWindow {
    constructor() {
        super();
        SocketManager.init();
    }

    connectedCallback() {
        super.connectedCallback();

        this.liveChartDiv = document.createElement("div");
        this.liveChartDiv.id = "liveRaceChartDiv" + this.id;
        this.liveChartDiv.style.overflow = "hidden";

        this.raceStatus = document.createElement("div");
        this.raceStatus.id = "raceStatusBox" + this.id;
        this.raceStatus.textContent = "Waiting for race status...";

        this.liveChartDiv.appendChild(this.raceStatus);

        const currentClass = this.getAttribute('class');
        this.setAttribute('class', `INeedEventHost ${currentClass}`);

        this.dropDown = document.createElement("select");
        this.dropDown.id = "eventDropdown" + this.id;

        this.dropDown.onfocus = (event) => {
            this.currentEventHost = event.target.value;
        };

        this.dropDown.onchange = (event) => {
            if (this.currentEventHost != null) {
                this.getHostCallbacks().forEach(eventCallback => SocketManager.removeHostCallback(this.currentEventHost, eventCallback.event, eventCallback.callback, this.id));
            }

            this.getHostCallbacks().forEach(eventCallback => SocketManager.addHostCallback(event.target.value, eventCallback.event, eventCallback.callback, this.id));
            this.currentEventHost = event.target.value;
        };

        this.liveChartDiv.appendChild(this.dropDown);
        this.prepend(this.liveChartDiv);

    }

    updateRaceStatus(status) {
        this.raceStatus.textContent = `Race Status: ${status}`;
        if (status === "start") {
            this.raceChart.data.datasets = [];
        }
    }

    onEventChange(data) {
        const dropDown = document.getElementById(this.dropDown.id);
        dropDown.innerHTML = "";
        dropDown.appendChild(createDefauiltOption("Select an Event Host", ""));

        this.getHostCallbacks().forEach(eventCallback => SocketManager.removeHostCallback(this.currentEventHost, eventCallback.event, eventCallback.callback, this.id));
        this.currentEventHost = null;

        data.hosts.forEach((host) => {
            const option = document.createElement("option");
            option.value = `${data.eventId}|${host.id}`;
            option.textContent = `${host.name}`;
            dropDown.appendChild(option);
        });
    }

    getHostCallbacks() {
        return [
            { event: 'raceDataUpdate', callback: this.updateRaceChart },
            { event: 'raceStatus', callback: this.updateRaceStatus }
        ];
    }

    disconnectedCallback() {
        this.getHostCallbacks().forEach(eventCallback => SocketManager.removeHostCallback(this.currentEventHost, eventCallback.event, eventCallback.callback, this.id));
        super.disconnectedCallback();
    }

}

customElements.define('live-chart-window', LiveChartWindow);