

class SideBarWindow extends MiniWindow {
    constructor() {
        super();
    }

    connectedCallback() {
        super.connectedCallback();

        this.innerHTML = `
        ${this.innerHTML}
      <h2>Components</h2>
      <ul id="component-list">
        <li>Button</li>
        <li>Input</li>
        <li>Textarea</li>
      </ul>
      <button id="add-component">Add Component</button>
      <button onclick="toggleRaceChart()">Toggle Race Chart</button>
    `;  

    const addComponentButton = this.querySelector('#add-component');
    addComponentButton.addEventListener('click', () => {
      const component = this.querySelector('#component-list').children[0].textContent;
      const element = document.createElement(component);
      this.append(element);
    });

    fetch('/components')
      .then((res) => res.text())
      .then((components) => {
        const componentList = this.querySelector('#component-list');
        componentList.innerHTML = components;
      });
    }
}

customElements.define('side-bar-window', SideBarWindow);