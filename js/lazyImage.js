import { LitElement, html } from '/node_modules/@polymer/lit-element/lit-element.js';


const prop = p => o => o[p];

const map = f => xs => (xs || []).map(f);

const some = f => xs => (xs || []).some(f);

const compose = (...fns) => fns.reduce((f, g) => (...args) => f(g(...args)));

const styles = html`
<style>
:host {
  display: block;
  width: 100%;
}

img {
  display: block;
  width: 100%;
}

.fade {
  opacity: 0;
  transition: opacity 0.5s ease;
}

.intersecting {
  opacity: 1;
}

</style>`;

class LazyImage extends LitElement {

  static get properties() {
    return {
      alt: String,
      intersecting: Boolean,
      placeholder: String,
      src: String,
      fade: Boolean,
      threshold: Number,
    };
  }

  constructor() {
    super();
    this.intersecting = false;
  }

  connectedCallback() {
    super.connectedCallback();
    const setIntersecting = b => this.intersecting = b || this.intersecting;
    const cb = compose(setIntersecting, some(x => x), map(prop('isIntersecting')));
    this.threshold = this.threshold || 0;
    const {rootMargin, threshold} = this;
    const observer = new IntersectionObserver(cb, {rootMargin, threshold});
          observer.observe(this);
  }

  render({alt, intersecting, placeholder, src, fade}) {
    return html`${styles}
      <img alt$="${alt}"
          src$="${intersecting ? src : placeholder}"
          class$="${intersecting ? 'intersecting' : ''} ${fade ? 'fade' : ''}"/>`;
  }
}

customElements.define('lazy-image', LazyImage);
