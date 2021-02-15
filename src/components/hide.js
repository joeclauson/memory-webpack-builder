import { store } from 'hydra';
import { LitElement, html } from "lit-element";

export class Hide extends LitElement {
  hide() {
    store.hide = true;
  }

  render() {
    return html`<button @click="${this.hide}">Hide</button>`;
  }
}

customElements.define("hide-button", Hide);
