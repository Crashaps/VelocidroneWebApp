class PilotTimesWindow extends TableWindow {
    constructor() {
        super();
        this.pilotFinishedCallback = this.addTimeToTable.bind(this);
        SocketManager.init();
    }

    connectedCallback() {
        super.connectedCallback();

        const heading = document.createElement('h2');
        heading.textContent = 'Event Finish Times';
        this.prepend(heading);

        SocketManager.addEventCallback("pilotFinished", this.pilotFinishedCallback, this.id);
    }

    disconnectedCallback() {
        SocketManager.removeEventCallback("pilotFinished", this.pilotFinishedCallback, this.id);
    }

    fillTimesTable(data) {
        const tbody = this.table.querySelector('#finishTimesBody' + this.id);
        tbody.innerHTML = "";
        data.forEach(item => {
            let row = tbody.insertRow();
            let pilotNameCell = row.insertCell(0);
            pilotNameCell.innerHTML = `<a class="fingerPointer" onclick="ReplayManager.replayPilotBest('${item.pilotName}')">${item.pilotName} </a>`;
            item.times.forEach(time => {
                let timeCell = row.insertCell();
                timeCell.textContent = time;
            });

            this.updateHeaders(row);
        });
    }

    addTimeToTable(data) {
        const tbody = this.table.querySelector('#finishTimesBody' + this.id);
        let pilotRow = this.getRowByPilotName(data.pilotName, tbody);

        if (!pilotRow) {
            pilotRow = tbody.insertRow();
            let pilotNameCell = pilotRow.insertCell(0);
            pilotNameCell.innerHTML = `<a class="fingerPointer" onclick="ReplayManager.replayPilotBest('${data.pilotName}')">${data.pilotName} </a>`;
        }
        let cell = pilotRow.insertCell();
        cell.textContent = data.time;

        this.updateHeaders(pilotRow);
    }

    updateHeaders(pilotRow) {
        const headerRow = this.table.tHead.rows[0];

        for (let i = headerRow.cells.length; i < pilotRow.cells.length; i++) {
            let newHeader = headerRow.insertCell();
            newHeader.outerHTML = `<th><a class="fingerPointer" onclick="ReplayManager.replayHeatIdeal(${i})">Race ${i}</a></th>`;
        }
    }

    getRowByPilotName(pilotName, tbody) {
        const rows = tbody.getElementsByTagName("tr");

        for (let i = 0; i < rows.length; i++) {
            const currentPilotName = rows[i].cells[0].textContent.trim();
            if (currentPilotName === pilotName) {
                return rows[i];
            }
        }

        return null;
    }
}

customElements.define('pilot-times-window', PilotTimesWindow);
