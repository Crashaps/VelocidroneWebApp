class TableWindow extends ClosableMiniWindow {
    constructor() {
        super();
    }

    connectedCallback() {
        super.connectedCallback();

        this.createTable();
    }

    createTable() {
        this.table = document.createElement('table');
        this.table.id = 'finishTimesTable' + this.id;

        const thead = document.createElement('thead');
        const tr = document.createElement('tr');
        const th = document.createElement('th');
        th.textContent = 'Pilot Name';
        tr.appendChild(th);
        thead.appendChild(tr);
        this.table.appendChild(thead);

        const tbody = document.createElement('tbody');
        tbody.id = 'finishTimesBody' + this.id;
        this.table.appendChild(tbody);

        this.appendChild(this.table);
    }
}

customElements.define('table-window', TableWindow);
