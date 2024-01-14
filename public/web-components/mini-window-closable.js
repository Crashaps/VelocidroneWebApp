

class ClosableMiniWindow extends MiniWindow {
    constructor() {
        super();
    }

    connectedCallback() {
        super.connectedCallback();

        this.closeButton = document.createElement('button');
        this.closeButton.classList.add('close-button');
        this.closeButton.innerHTML = 'X';

        this.closeButton.style.position = 'absolute';
        this.closeButton.style.top = '0';
        this.closeButton.style.right = '0';
        this.closeButton.style.width = '25px';
        this.closeButton.style.height = '25px';
        this.closeButton.style.padding = '0px';

        this.closeButton.style.backgroundColor ='red';
        this.closeButton.style.color = 'white';

        this.closeButton.style.cursor = 'pointer';

        this.appendChild(this.closeButton);

        this.closeButton.addEventListener('click', () => {
            this.remove();
        });
    }
}

customElements.define('mini-window-closable', ClosableMiniWindow);
