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
        this.table.remove();
        this.createTable();

        const tbody = this.table.querySelector('#finishTimesBody' + this.id);        

        data.forEach(item => {
            let row = tbody.insertRow();
            this.createPilotNameCell(row, item.pilotName);
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
            this.createPilotNameCell(pilotRow, data.pilotName);
        }

        let cell = pilotRow.insertCell();
        cell.textContent = data.time;

        this.updateHeaders(pilotRow);
    }

    createPilotNameCell(pilotRow, pilotName) {
        let pilotNameCell = pilotRow.insertCell(0);
        pilotNameCell.className = "fingerPointer";
        pilotNameCell.innerHTML = pilotName;

        const hLightRow = this.highlightRow.bind(this);
        const hRemoveRow = this.removeRowHighlight.bind(this);

        pilotNameCell.addEventListener("click", function () {
            ReplayManager.replayPilotBest(pilotName)
        });
        pilotNameCell.addEventListener("mouseover", function () {
            hLightRow(pilotRow);
        });
        pilotNameCell.addEventListener("mouseout", function () {
            hRemoveRow(pilotRow);
        });
    }

    updateHeaders(pilotRow) {
        const headerRow = this.table.tHead.rows[0];

        for (let i = headerRow.cells.length; i < pilotRow.cells.length; i++) {
            let newHeader = headerRow.insertCell();

            newHeader.innerHTML = `Race ${i}`;
            newHeader.classList.add("raceNumFingerPointer");

            const hLightColumn = this.highlightColumn.bind(this);
            const hRemoveColumn = this.removeColumnHighlight.bind(this);

            newHeader.addEventListener("click", function () {
                ReplayManager.replayHeatIdeal(i)
            });
            newHeader.addEventListener("mouseover", function () {
                hLightColumn(i);
            });
            newHeader.addEventListener("mouseout", function () {
                hRemoveColumn(i);
            });
        }
    }

    getRowByPilotName(pilotName, tbody) {
        const rows = tbody.rows;

        for (let i = 0; i < rows.length; i++) {
            const currentPilotName = rows[i].cells[0].textContent.trim();
            if (currentPilotName === pilotName) {
                return rows[i];
            }
        }

        return null;
    }

    highlightRow(row) {
        row.classList.add("highlightedRow");
    }

    removeRowHighlight(row) {
        row.classList.remove("highlightedRow");
    }

    highlightColumn(columnIndex) {
        for (let i = 0; i < this.table.rows.length; i++) {
            if ((this.table.rows[i].cells.length - 1) >= columnIndex) {
                this.table.rows[i].cells[columnIndex].classList.add("highlightedColumn");
            }
        }
    }

    removeColumnHighlight(columnIndex) {
        for (let i = 0; i < this.table.rows.length; i++) {
            if ((this.table.rows[i].cells.length - 1) >= columnIndex) {
                this.table.rows[i].cells[columnIndex].classList.remove("highlightedColumn");
            }
        }
    }
}

customElements.define('pilot-times-window', PilotTimesWindow);
