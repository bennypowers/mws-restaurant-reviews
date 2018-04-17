import '../node_modules/@power-elements/emoji-rating/emoji-rating.js';
import { LitElement, html } from '../node_modules/@polymer/lit-element/lit-element.js';

import formatDistance from '../node_modules/date-fns/esm/formatDistance/index.js';

import { nameToId } from './lib.js';

class ReviewCard extends LitElement {

  static get properties() {
    return {
      comments: String,
      createdAt: Number,
      updatedAt: Number,
      name: String,
      rating: Number,
    };
  }

  render({comments, createdAt, updatedAt, name, rating}) {
    const id = nameToId(name);
    const date = updatedAt || createdAt || null;

    return html`
    <style>
    :host {
      display: block;
      width: 100%;
    }

    article {
      background-color: #fff;
      border-radius: 20px 0;
      border: 2px solid #f3f3f3;
      display: block;
      list-style-type: none;
      margin: 0 0 30px;
      overflow: hidden;
      padding: 0 20px 20px;
      position: relative;
    }

    header {
      align-items: center;
      background: #444;
      color: white;
      display: flex;
      justify-content: space-between;
      left: -20px;
      margin-bottom: 20px;
      padding: 10px 20px;
      position: relative;
      width: 100%;
      z-index: 0;
    }

    h1 {
      font-size: 18px;
      margin: 0;
    }

    time {
      color: #eee;
      margin: 0;
    }

    span {
      align-items: center;
      background-color: crimson;
      border-radius: 4px;
      color: white;
      display: inline-flex;
      font-weight: bold;
      margin-bottom: 20px;
      padding: 8px;
      text-transform: uppercase;
    }

    </style>

    <!-- NOTE: We opt to use h1 in restaurant and review listings, since h1 is
           allowed and prefered by the outline algorithm. However, since
           UAs don't implement outline, we assist users by using the
           aria-labelledby attribute to explicitly link h1s to their sections. -->
    <article aria-labelledBy="${id}">
      <header>
        <h1 id="${id}" tab-index="0">${name}</h1>
        <time>${date ? formatDistance(date, Date.now(), {addSuffix: true}) : ''}</time>
      </header>
      <span>Rating: <emoji-rating
          min="0" max="5"
          low="2" high="4"
          optimum="5" value="${rating}"></emoji-rating></span>
      <p>${comments}</p>
    </article>
    `;
  }
}

customElements.define('review-card', ReviewCard);
