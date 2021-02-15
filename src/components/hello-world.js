import { LitElement, html } from "lit-element";

export class HelloWorld extends LitElement {
  render() {
    return html`<label>Hello World</label>`;
  }
}

customElements.define("hello-world", HelloWorld);
