

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
            width: 25px;
            height: 25px;
            padding: 0px;
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
