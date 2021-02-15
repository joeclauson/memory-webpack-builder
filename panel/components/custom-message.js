import { LitElement, html } from "lit-element";

export class CustomMessage extends LitElement {
  render() {
    return html`<label>Hello from the Panel</label>`;
  }
}

customElements.define("custom-message", CustomMessage);
