window.onload = function () {
    SocketManager.init();

    document.getElementById("eventDropdown").addEventListener("focus", function () {
        document.currentEventId = this.value;
    });

    document.getElementById("eventDropdown").addEventListener("change", function () {
        const selectedEventId = this.value;
        if (selectedEventId) {
            fetch("/current-finish-times/" + selectedEventId)
                .then((response) => response.json())
                .then((data) => {
                    const pilotTimesWindow = document.querySelector('pilot-times-window');
                    if (pilotTimesWindow) {
                        pilotTimesWindow.fillTimesTable(data);
                    }
                })
                .catch((error) => console.error("Error:", error));

            if (document.currentEventId != null) {
                SocketManager.leaveEventRoom(document.currentEventId);
            }

            SocketManager.joinEventRoom(selectedEventId);

            fetch(`/eventhosts/${selectedEventId}`)
                .then((response) => response.json())
                .then((data) => {
                    const needingEventHost = document.getElementsByClassName("INeedEventHost");
                    for (let i = 0; i < needingEventHost.length; i++) {
                        needingEventHost[i].onEventChange(data);
                    }
                })
                .catch((error) => console.error("Error:", error));

            document.currentEventId = this.value;
        }
    });

    fetch("/current-events")
        .then((response) => response.json())
        .then((events) => {
            const dropdown = document.getElementById("eventDropdown");
            dropdown.innerHTML = "";
            dropdown.appendChild(createDefauiltOption("Select an Event", ""));

            events.forEach((event) => {
                const option = document.createElement("option");
                option.value = `${event.id}`;
                option.textContent = `${event.name}`;
                dropdown.appendChild(option);
            });
        })
        .catch((error) => console.error("Error:", error));

    window.addEventListener("beforeunload", () => {
        Array.from(document.getElementsByClassName("miniwindow")).forEach((el) => {
            savePosition(el);
        });

        ReplayManager.resetReplays();
    });
};

function createDefauiltOption(text, value) {
    const defaultOption = document.createElement("option");
    defaultOption.value = value;
    defaultOption.textContent = `---${text}---`;
    return defaultOption;
}
