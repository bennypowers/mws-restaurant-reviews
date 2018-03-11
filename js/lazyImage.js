import { LitElement, html } from '/node_modules/@polymer/lit-element/lit-element.js';

import { until } from '/node_modules/lit-html/lib/until.js';

const prop = p => o => o[p];

const map = f => xs => (xs || []).map(f);

const some = f => xs => (xs || []).some(f);

const compose = (...fns) => fns.reduce((f, g) => (...args) => f(g(...args)));

const placeholderTemplate = ({placeholder, altPlaceholder, fade}) =>
  html`<img src$="${placeholder}" alt$="${altPlaceholder}" class$="${fade ? 'fade' : ''}"/>`;

const loadedTemplate = ({intersecting, fade}) => ([src, alt]) =>
  html`<img src$="${src}" alt$="${alt}" class$="${intersecting ? 'intersecting' : ''} ${fade ? 'fade' : ''}"/>`;

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
  transition: opacity 5.5s ease;
}

.intersecting {
  opacity: 1;
}

</style>`;

class LazyImage extends LitElement {

  static get properties() {
    return {
      alt: String,
      altPlaceholder: String,
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
    const {rootMargin, threshold} = this;
    const observer = new IntersectionObserver(cb, {rootMargin, threshold});
          observer.observe(this);
  }

  render({alt, altPlaceholder, intersecting, placeholder, src, fade}) {
    const otherwise = placeholderTemplate({placeholder, altPlaceholder, fade});
    return html`${styles} ${
      intersecting ?
        html`${until(Promise.all([src, alt]).then(loadedTemplate({intersecting, fade})), otherwise)}`
      : otherwise
    }`;
  }
}

customElements.define('lazy-image', LazyImage);
