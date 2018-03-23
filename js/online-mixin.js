export const OnlineMixin = superclass => class Mixin extends superclass {
  static get properties() {
    return {
      online: Boolean,
    };
  };

  constructor() {
    super();
    window.addEventListener('online', event => this.online = true);
    window.addEventListener('offline', event => this.online = false);
    this.online = navigator.onLine;
  }
}

export default OnlineMixin;
