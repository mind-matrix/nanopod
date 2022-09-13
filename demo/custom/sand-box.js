customElements.define('x-pod', class extends HTMLElement {
    constructor() {
        super();
        let root = this.attachShadow({ mode: "closed" });
        let slot = document.createElement("slot");
        root.appendChild(slot);
    }
})