class EventForm extends HTMLElement {
    constructor() {
        super();
        //this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        
        this.submitType = this.getAttribute('submit-type');

        this.form = document.createElement('form');
        this.form.id = 'eventForm';

        this.eventId = document.createElement('input');
        this.eventId.type = 'hidden';
        this.eventId.id = 'eventId';
        this.form.appendChild(this.eventId);

        this.eventNameLabel = this.createFormLabel('Event Name', 'eventName');
        this.eventName = this.createFormInput('text', 'eventName', 'eventName', true);
        this.eventStartDateLabel = this.createFormLabel('Event Start Date', 'eventStartDate');
        this.eventStartDate = this.createFormInput('date', 'eventStartDate', 'eventStartDate', true);
        this.heatCountLabel = this.createFormLabel('Heat Count', 'heatCount');
        this.heatCount = this.createFormInput('number', 'heatCount', 'heatCount', true);
        this.hostsLabel = this.createFormLabel('Hosts', 'hosts');

        this.host = document.createElement('host-select');
        this.host.id = 'host';
        this.form.appendChild(this.host);
        this.form.appendChild(document.createElement('br'));

        this.submitButton = document.createElement('button');
        this.submitButton.type = 'submit';
        this.submitButton.textContent = `${this.submitType}`;
        this.form.appendChild(this.submitButton);
        this.form.appendChild(document.createElement('br'));

        this.appendChild(this.form);

        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.createEvent(this.submitType === 'Create' ? 'POST' : 'PUT');
        });
    }

    createFormInput(type, id, name, required) {
        const input = document.createElement('input');
        input.type = type;
        input.id = id;
        input.name = name;
        input.required = required;
        
        this.form.appendChild(input);
        this.form.appendChild(document.createElement('br'));

        return input;
    }

    createFormLabel(text, htmlFor){
        const label = document.createElement('label');
        label.htmlFor = htmlFor;
        label.textContent = text;

        this.form.appendChild(label);
        this.form.appendChild(document.createElement('br'));

        return label;
    }

    populateEvent(event) {
        this.eventId.value = event.id;
        this.eventName.value = event.name;
        this.eventStartDate.value = event.eventStartDate;
        this.heatCount.value = event.heatCount;
        this.host.selectedUsers = event.hostIds;
        this.submitType = 'Update';
        this.submitButton.textContent = `${this.submitType}`;
    }

    createEvent(method) {
        const token = localStorage.getItem("token");
        if (!token) {
            alert("You must be logged in to create an event.");
            return;
        }

        fetch('/event', {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token
            },
            body: JSON.stringify({
                name: this.eventName.value,
                eventStartDate: this.eventStartDate.value,
                heatCount: this.heatCount.value,
                hostIds: this.host.selectedUsers.map(user => user.id)
            })
        })
            .then(response => response.json())
            .then(data => {
                const dropdown = document.getElementById("eventDropdown");
                const option = document.createElement("option");
                option.value = `${data._id}`;
                option.textContent = `${data.name}`;
                dropdown.appendChild(option);

                this.form.reset();
            })
            .catch(error => { console.log(error); });
    }
}

customElements.define('event-form', EventForm);