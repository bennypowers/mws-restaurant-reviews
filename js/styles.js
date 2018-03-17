import { html } from '/node_modules/lit-html/lit-html.js';

/**
 * NOTE: Ordinarily we'd prefer to write css in css files, but since we're using
 * lit-element and rendering DOM according to the data, it's advantageous to use
 * css-in-js, or we should say inline-css-in-lit-templates. Hopefully soon, we
 * have shadow-piercing selectors and css modules as a standard feature of the
 * platform, which would let us import and use css dynamically and reach shadow
 * elements from the document. Until then, we settle for this.
 */

const styles = html`<style>

/* CSS Document */

.flex {
  display: flex;
}

.center {
  align-items: center;
}

#form-dialog {
  position: relative;
}

#form {
  transition: opacity 0.5s ease;
}

#spinner {
  position: absolute;
  left: calc(50% - 14px);
  top: calc(50% - 14px);
}

ul,
li {
  font-family: Arial, Helvetica, sans-serif;
  color: #333;
}

a {
  color: crimson;
  text-decoration: none;
}

a:hover,
a:focus {
  color: #3397db;
  text-decoration: none;
}

a img {
  border: none 0 #fff;
}

article,
aside,
canvas,
details,
figcaption,
figure,
footer,
header,
hgroup,
menu,
section {
  display: block;
}

#footer {
  background-color: #222;
  color: #ddd;
  font-size: 8pt;
  letter-spacing: 1px;
  padding: 25px;
  text-align: center;
  text-transform: uppercase;
}

#footer a {
  color: orange;
}

/* ====================== Map ====================== */

#map,
#map-container,
good-map {
  min-height: 400px;
  width: 100%;
  background-color: #ccc;
}

good-map {
  display: block;
}

/* ====================== Restaurant Filtering ====================== */

.filter-options {
  align-items: center;
  background-color: #3397db;
  display: flex;
  flex-wrap: wrap;
  max-width: 100%;
  padding: 10px;
}

.filter-options h2 {
  color: white;
  font-size: 2rem;
  font-weight: normal;
  line-height: 1;
  margin: 0 10px;
  width: 100%;
}

.filter-options select {
  background-color: white;
  border: 1px solid #fff;
  flex: 1 1 auto;
  font: 11pt Arial, sans-serif;
  height: 35px;
  letter-spacing: 0;
  margin: 10px;
  padding: 0 10px;
}

:host {
  --emoji-checkbox-width: 1.5em;
}

/* ====================== Restaurant Listing ====================== */

#restaurants-list {
  background-color: #f3f3f3;
  list-style: outside none none;
  margin: 0;
  padding: 30px 15px 60px;
  text-align: center;
}

#restaurants-list li {
  margin: 15px;
}

#restaurants-list li.no-restaurants {
  background: none;
  border: none;
  min-height: initial;
  padding: 20px;
  text-align: center;
  width: auto;
}


#restaurants-list p {
  font-size: 11pt;
  margin: 0;
}

#restaurant-name {
  color: crimson;
  font: 20px Arial, sans-serif;
  font-weight: 200;
  letter-spacing: 0;
  line-height: 1.1;
  margin: 15px 0 30px;
  text-transform: uppercase;
}

#restaurant-image {
  width: 100%;
  max-width: 100%;
}

#restaurant-address {
  font-size: 12pt;
  margin: 10px 0;
}

#restaurant-cuisine {
  background-color: #333;
  color: #ddd;
  font-size: 12pt;
  font-weight: 300;
  letter-spacing: 10px;
  margin: 0 0 20px;
  padding: 2px 0;
  text-align: center;
  text-transform: uppercase;
  width: 100%;
}

#restaurants-list,
#reviews-list {
  display: grid;
}

#reviews-container {
  padding: 30px 40px 80px;
}

#reviews-container h2 {
  color: crimson;
  font-size: 24pt;
  font-weight: 300;
  letter-spacing: -1px;
  padding-bottom: 1pt;
}

#reviews-list {
  margin: 0;
  padding: 0;
}

meter {
  align-items: center;
  display: inline-flex;
  margin-left: 4px;
}

meter::before {
  content: attr(value);
  display: inline-block;
  flex: 1 0 1em;
}

#restaurant-hours td {
  color: #666;
}

@media (min-width: 500px) {
  #restaurants-list {
    grid-template-columns: 49% 49%;
    grid-column-gap: 2%;
  }
}

@media (min-width: 630px) {
  #reviews-list {
    grid-template-columns: 49% 49%;
    grid-column-gap: 2%;
  }

}

@media (min-width: 960px) {
  #restaurants-list {
    grid-template-columns: 33% 33% 33%;
    grid-column-gap: 0.5%;
  }
}

</style>`;

export default styles;
