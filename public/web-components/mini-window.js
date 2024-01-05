

class MiniWindow extends HTMLElement {
    constructor() {
        super();


    }

    connectedCallback() {
        let currentClass = this.getAttribute('class');
        this.setAttribute('class', `draggable resizable ${currentClass}`);

        this.innerHTML = `
        <style>
        :host {
          display: inline-block;
          position: relative;
        }

        #resizer {
            width: 10px;
            height: 10px;
            position: absolute;
            bottom: 0;
            right: 0;
            cursor: se-resize;
            background: white;
        }
      </style>
      ${this.innerHTML}
    `;

        this.resizer = document.createElement('div');
        this.resizer.setAttribute('class', 'resizer');
        this.resizer.setAttribute('id', 'resizer');
        this.appendChild(this.resizer);


        this.currentMouseX = 0;
        this.currentMouseY = 0;
        this.prevMouseDownX = 0,
            this.prevMouseDownY = 0;

        this.onmousedown = this.initMouseDown;

        this.restorePosition();
    }

    // Save and restore positions
    savePosition() {
        localStorage.setItem(this.id, JSON.stringify({
            left: this.style.left,
            top: this.style.top,
            width: this.style.width,
            height: this.style.height
        }));
    }

    restorePosition() {
        var position = JSON.parse(localStorage.getItem(this.id));
        if (position) {
            this.style.left = position.left;
            this.style.top = position.top;
            this.style.width = position.width == null ? 0 : position.width;
            this.style.height = position.height == null ? 0 : position.height;
        }
    }

    initMouseDown(e) {
        if (e.target.className == "resizer") {
            this.initResize(e);
        }
        else {
            e = e || window.event;
            e.preventDefault();
            this.prevMouseDownX = e.clientX;
            this.prevMouseDownY = e.clientY;

            this.style.zIndex = 1000;
            this.onmouseup = this.stopDragElement;
            this.onmousemove = this.elementDrag;
        }
    }

    elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        this.currentMouseX = this.prevMouseDownX - e.clientX;
        this.currentMouseY = this.prevMouseDownY - e.clientY;
        this.prevMouseDownX = e.clientX;
        this.prevMouseDownY = e.clientY;
        this.style.top = (this.offsetTop - this.currentMouseY) + "px";
        this.style.left = (this.offsetLeft - this.currentMouseX) + "px";
    }

    stopDragElement() {
        this.onmouseup = null;
        this.onmousemove = null;
        this.style.zIndex = 0;
        this.savePosition();
    }

    initResize(e) {
        this.addEventListener("mousemove", this.resize, false);
        this.addEventListener("mouseup", this.stopResize, false);
        this.style.zIndex = 1000;
        e.preventDefault();
    }

    resize(e) {
        this.style.width = (e.clientX - this.offsetLeft) + "px";
        this.style.height = (e.clientY - this.offsetTop) + "px";
    }

    stopResize(e) {
        this.removeEventListener("mousemove", this.resize, false);
        this.removeEventListener("mouseup", this.stopResize, false);
        this.style.zIndex = 0;
    }

}

customElements.define('mini-window', MiniWindow);