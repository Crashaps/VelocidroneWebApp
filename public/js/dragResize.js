
interact('.miniwindow')
    .draggable({
        inertia: false,
        modifiers: [

        ],
        autoScroll: false,
        listeners: {
            move: dragMoveListener,
            end: savePosition
        }
    })
    .resizable({
        edges: { left: true, right: true, bottom: true, top: true },
        listeners: {
            move(event) {
                let { x, y } = event.target.dataset;

                x = parseFloat(x) || 0;
                y = parseFloat(y) || 0;

                Object.assign(event.target.style, {
                    width: `${event.rect.width}px`,
                    height: `${event.rect.height}px`,
                    transform: `translate(${x}px, ${y}px)`
                });
            },
            end: savePosition
        },
        inertia: false
    });

function dragMoveListener(event) {
    var target = event.target;

    var x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
    var y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

    target.style.transform = `translate3d(${x}px, ${y}px, 0px)`;

    // Update the dataset with the new position
    target.setAttribute('data-x', x);
    target.setAttribute('data-y', y);
}

function savePosition(event) {
    const x = event.target.getAttribute('data-x') || '0';
    const y = event.target.getAttribute('data-y') || '0';
    localStorage.setItem(event.target.id, JSON.stringify({
        x: x,
        y: y,
        width: event.target.style.width,
        height: event.target.style.height
    }));
}

window.dragMoveListener = dragMoveListener
