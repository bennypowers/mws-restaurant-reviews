import { LitElement, html } from '/node_modules/@polymer/lit-element/lit-element.js';
import '/node_modules/@polymer/paper-fab/paper-fab.js';
import '/node_modules/@polymer/paper-input/paper-input.js';
import '/node_modules/@polymer/paper-input/paper-textarea.js';
import '/node_modules/@polymer/paper-slider/paper-slider.js';
import { postReview } from './dbhelper.js';
import { customEvent } from './lib.js';

const styles = html`
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

</style>`;

class SubmitReview extends LitElement {
  static get properties() {
    return {
      restaurantId: String,
      opened: Boolean,
      spinning: Boolean,
    };
  }

  toggleOpened() {
    this.opened = !this.opened;
  }

  async submitReview() {
    const form = this.shadowRoot.querySelector('#form');
    const dialog = this.shadowRoot.querySelector('#dialog');
    const ironForm = this.shadowRoot.querySelector('#iron-form');
    const nameEl = this.shadowRoot.querySelector('#name-input');
    const ratingEl = this.shadowRoot.querySelector('#rating-input');
    const commentsEl = this.shadowRoot.querySelector('#comments-input');

    const name = nameEl.value;
    const rating = ratingEl.value;
    const comments = commentsEl.value;

    const resetForm = () => {
      [nameEl, commentsEl].forEach(l => l.value = null);
      ratingEl.value = 0;
      this.spinning = false;
      form.style.opacity = 1;
    };

    if (ironForm.validate()) {
      const restaurant_id = this.restaurantId;

      form.style.opacity = 0;
      this.spinning = true;

      const review = await postReview({comments, name, rating, restaurant_id});

      this.dispatchEvent(customEvent('review-submitted', review));

      resetForm();

      this.opened = false;
    }
  }

  render({opened, restaurantId, spinning}) {
    return html`${styles}
    <paper-fab id="form-fab" label="+" title="Add Review" on-click="${() => this.toggleOpened()}"></paper-fab>
    <dialog id="dialog" open="${opened}">
      <paper-spinner id="spinner" active="${spinning}"></paper-spinner>
      <iron-form id="iron-form">
        <form id="form" method="dialog">
          <input id="restaurant-id" hidden type="text" name="restaurant_id" value="${restaurantId}" />
          <h3>Add Your Review</h3>
          <div class="flex center">
            <label for="rating-input">Rating</label>
            <paper-slider id="rating-input" name="rating" value="0" min="1" max="5" pin required></paper-slider>
          </div>
          <paper-textarea id="comments-input" name="comments" label="Comments" error-message="Please enter your comments" required></paper-textarea>
          <paper-input id="name-input" name="name" label="Your Name" error-message="Please enter your name" required></paper-input>
          <footer class="flex">
            <paper-button id="submit-button" on-click="${() => this.submitReview()}">Submit</paper-button>
            <paper-button id="cancel-button" on-click="${() => this.toggleOpened()}">Cancel</paper-button>
          </footer>
        </form>
      </iron-form>
    </dialog>`;
  }
}

customElements.define('submit-review', SubmitReview);
