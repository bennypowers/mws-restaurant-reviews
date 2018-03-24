export const OnlineMixin = superclass => class Mixin extends superclass {
  static get properties() {
    return {
      online: Boolean,
    };
  }

  constructor() {
    super();
    window.addEventListener('online', () => this.online = true);
    window.addEventListener('offline', () => this.online = false);
    this.online = navigator.onLine;
  }
};

export default OnlineMixin;
