

class CloasableMiniWindow extends MiniWindow {
    constructor() {
        super();
    }

    connectedCallback() {
        super.connectedCallback();

        this.innerHTML = `
        <style>
        .close-button {
            position: absolute;
            top: 0;
            right: 0;
            padding: 8px;
            background-color: red;
            color: white;
            cursor: pointer;
        }
        </style>
        ${this.innerHTML}
        <button class="close-button">X</button>
        `
        const closeButton = this.querySelector('.close-button');
        closeButton.addEventListener('click', () => {
            this.remove();
        });
    }
}

customElements.define('mini-window-closable', CloasableMiniWindow);
