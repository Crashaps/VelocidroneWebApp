
class MiniWindow extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        let currentClass = this.getAttribute('class');
        this.setAttribute('class', `miniwindow ${currentClass}`);
        this.innerHTML = `
        <style>
        .miniwindow{
            touch-action: none;
        }
        </style>
        ${this.innerHTML}`;

        this.restorePosition();
    }

    restorePosition() {
        var position = JSON.parse(localStorage.getItem(this.id));
        var x = position?.x || 50;
        var y = position?.y || 50;
        var width = position?.width || 200;
        var height = position?.height || 200;
        var zIndex = position?.zIndex || 0;

        this.style.left = 0 + 'px';
        this.style.top = 0 + 'px';
        this.style.transform = `translate3d(${x}px, ${y}px, 0px)`;
        this.style.width = width;
        this.style.height = height;
        this.style.zIndex = zIndex;

        this.setAttribute('data-x', x);
        this.setAttribute('data-y', y);

    }
}

customElements.define('mini-window', MiniWindow);