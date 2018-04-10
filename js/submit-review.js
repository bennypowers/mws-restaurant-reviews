import { LitElement, html } from '../node_modules/@polymer/lit-element/lit-element.js';
import { postReview } from './db/postReview.js';
import { customEvent, trace } from './lib.js';

const nullifyValue = l => l.value = null;

const resetForm = component => review => (
  [component.nameInput, component.commentsInput]
    .forEach(nullifyValue),
  component.ratingInput.value = 0,
  component.spinning = false,
  review
);

const dispatchReviewSubmitted = component => review => (
  component.dispatchEvent(customEvent('review-submitted', review)),
  review
);

const closeDialog = component => reason => (
  component.dialog.close(reason),
  reason
);

class SubmitReview extends LitElement {
  static get properties() {
    return {
      restaurantId: String,
      opened: Boolean,
      spinning: Boolean,
    };
  }

  connectedCallback() {
    super.connectedCallback();
    this.dialog = this.shadowRoot.querySelector('dialog');
    this.ironForm = this.shadowRoot.querySelector('#iron-form');
    this.nameInput = this.shadowRoot.querySelector('#name-input');
    this.ratingInput = this.shadowRoot.querySelector('#rating-input');
    this.commentsInput = this.shadowRoot.querySelector('#comments-input');

    this.dialog.addEventListener('close', () => this.opened = false);
  }

  toggleOpened(reason) {
    Promise.all([
      import('../node_modules/@polymer/iron-form/iron-form.js'),
      import('../node_modules/@polymer/paper-input/paper-input.js'),
      import('../node_modules/@polymer/paper-input/paper-textarea.js'),
      import('../node_modules/@polymer/paper-slider/paper-slider.js'),
    ]).then(() =>
      this.dialog.open
        ? this.dialog.close(reason)
        : this.dialog.showModal()
    );
  }

  submitReview() {
    const name = this.nameInput.value;
    const rating = this.ratingInput.value;
    const comments = this.commentsInput.value;

    const restaurant_id = this.restaurantId;

    return !this.ironForm.validate() ? null : (
      this.spinning = true,
      postReview({ comments, name, rating, restaurant_id })
        .then(dispatchReviewSubmitted(this))
        .then(resetForm(this))
        .then(closeDialog(this))
        .catch(trace('postReview'))
    );
  }

  render({ opened, restaurantId, spinning }) {
    return html`
    <style>

    :host {
      position: fixed;
      bottom: 1em;
      right: 1em;
    }

    dialog {
      position: fixed;
      top: calc(50% - 150px);
    }

    #form.loading {
      opacity: 0;
    }

    #spinner {
      position: absolute;
      left: calc(50% - 14px);
      top: calc(50% - 14px);
    }

    #form {
      opacity: 1;
      transition: opacity 0.5s ease;
    }

    #offline-warning {
      background-color: var(--paper-yellow-100);
      color: var(--paper-brown-700);
      border-radius: 4px;
      padding: 8px;
    }

    </style>
    <dialog id="dialog" open="${ opened }">
      <div id="offline-warning" hidden?="${ navigator.onLine }">
        <span>You appear to be offline.</span>
        <span>Your review will be posted when you come back online.</span>
      </div>
      <paper-spinner id="spinner" active="${ spinning }"></paper-spinner>
      <iron-form id="iron-form">
        <form id="form" method="dialog" class="${ spinning ? 'loading' : '' }">
          <input id="restaurant-id" hidden type="text" name="restaurant_id" value="${ restaurantId }" />

          <h3>Add Your Review</h3>

          <paper-textarea id="comments-input"
              name="comments"
              label="Comments"
              error-message="Please enter your comments"
              required
          ></paper-textarea>

          <paper-input id="name-input"
              name="name"
              label="Your Name"
              error-message="Please enter your name"
              required
          ></paper-input>

          <div class="flex center">
            <label for="rating-input">Rating</label>
            <paper-slider id="rating-input"
                name="rating"
                value="3" min="1" max="5"
                pin required
            ></paper-slider>
          </div>

          <footer class="flex">
            <paper-button id="submit-button"
                on-click="${ () => this.submitReview() }">Submit</paper-button>
            <paper-button id="cancel-button"
                on-click="${ () => this.toggleOpened() }">Cancel</paper-button>
          </footer>
        </form>
      </iron-form>
    </dialog>`;
  }
}

customElements.define('submit-review', SubmitReview);
