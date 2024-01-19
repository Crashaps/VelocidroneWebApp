
interact('.miniwindow')
    .draggable({
        inertia: false,
        modifiers: [
            
        ],
        autoScroll: false,
        listeners: {
            start: dragStartListener,
            move: dragMoveListener,
            end: (event) => { normalizeZIndexes(); savePosition(event.target); }
        }
    })
    .resizable({
        edges: { left: true, right: true, bottom: true, top: true },
        listeners: {
            start: dragStartListener,
            move(event) {
                event.preventDefault();
                let x = (parseFloat(event.target.getAttribute('data-x')) || 0) + ((event.deltaRect.left) ? event.deltaRect.left : 0);
                let y = (parseFloat(event.target.getAttribute('data-y')) || 0) + ((event.deltaRect.top) ? event.deltaRect.top : 0);

                Object.assign(event.target.style, {
                    width: `${event.rect.width}px`,
                    height: `${event.rect.height}px`,
                    transform: `translate3d(${x}px, ${y}px, 0px)`
                });

                event.target.setAttribute('data-x', x);
                event.target.setAttribute('data-y', y);
            },
            end: (event) => { normalizeZIndexes(); savePosition(event.target); }
        },
        inertia: false
    })
    .gesturable({
        onstart: (event) => {
            // Initialize scale factor when the gesture starts
            const scale = parseFloat(this.getAttribute('data-scale')) || 1;
            this.setAttribute('data-scale', scale);
        },
        onmove: (event) => {
            // Scaling the element
            const initialScale = parseFloat(this.getAttribute('data-scale')) || 1;
            const scale = initialScale * event.scale;

            // Apply the scale transformation
            const x = parseFloat(this.getAttribute('data-x')) || 0;
            const y = parseFloat(this.getAttribute('data-y')) || 0;
            this.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;

            // Update the scale for next movement
            this.setAttribute('data-scale', scale);
        }
    })
    .on('down', dragStartListener);

function dragMoveListener(event) {
    var target = event.target;

    var x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
    var y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

    target.style.transform = `translate3d(${x}px, ${y}px, 0px)`;

    target.setAttribute('data-x', x);
    target.setAttribute('data-y', y);
}

function savePosition(element) {
    const x = element.getAttribute('data-x') || '0';
    const y = element.getAttribute('data-y') || '0';
    localStorage.setItem(element.id, JSON.stringify({
        x: x,
        y: y,
        width: element.style.width,
        height: element.style.height,
        zIndex: parseInt(window.getComputedStyle(element).zIndex, 10) || 0
    }));
}

function dragStartListener(event) {
    if (event.target.matches('select, select *')) {
        event.interactable.stop();
        return;
    }

    const allWindows = document.querySelectorAll('.miniwindow');
    const zIndexes = Array.from(allWindows).map(el => parseInt(window.getComputedStyle(el).zIndex, 10) || 0);
    const currentMaxZIndex = zIndexes.length > 0 ? Math.max(...zIndexes) : 0;
    let miniwindow = getParentMiniWindow(event.target);
    miniwindow.style.zIndex = currentMaxZIndex + 1;
}

function getParentMiniWindow(element) {
    let parentElement = element;
    while (parentElement && parentElement.classList.contains('miniwindow') == false) {
        parentElement = parentElement.parentElement;
    }

    return parentElement;
}

function normalizeZIndexes() {
    const allWindows = document.querySelectorAll('.miniwindow');
    const sortedWindows = Array.from(allWindows).sort((a, b) => {
        return (parseInt(window.getComputedStyle(a).zIndex, 10) || 0) - (parseInt(window.getComputedStyle(b).zIndex, 10) || 0);
    });

    sortedWindows.forEach((el, index) => {
        el.style.zIndex = index + 1;
    });
}

window.dragMoveListener = dragMoveListener
