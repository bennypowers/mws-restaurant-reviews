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

input[type="checkbox"] {
  visibility: hidden;
  position: relative;
  cursor: pointer;
}

input[type="checkbox"]:before {
  content: '😐'
  position: absolute;
  visibility: visible;
}

input[type="checkbox"]:checked:before {
  content: '😍'
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
  background-color: #fff;
  border: 2px solid #ccc;
  font-family: Arial, sans-serif;
  margin: 15px;
  min-height: 380px;
  padding: 0 30px 25px;
  text-align: left;
  width: calc(100% - 60px - 30px);
}

#restaurants-list li.no-restaurants {
  background: none;
  border: none;
  min-height: initial;
  padding: 20px;
  text-align: center;
  width: auto;
}

#restaurants-list .restaurant-image {
  background-color: #ccc;
  display: block;
  left: -30px;
  margin: 0;
  max-width: calc(100% + 60px);
  min-width: calc(100% + 60px);
  position: relative;
}

#restaurants-list li h1 {
  color: crimson;
  font: 14px 200 Arial, sans-serif;
  letter-spacing: 0;
  line-height: 1.3;
  margin: 20px 0 10px;
  text-transform: uppercase;
}

#restaurants-list p {
  font-size: 11pt;
  margin: 0;
}

#restaurants-list li a {
  background-color: crimson;
  border-bottom: 3px solid #eee;
  color: #fff;
  display: inline-block;
  font-size: 10pt;
  margin: 15px 0 0;
  padding: 8px 30px 10px;
  text-align: center;
  text-decoration: none;
  text-transform: uppercase;
}

#restaurant-name {
  color: crimson;
  font-family: 20pt 200 Arial, sans-serif;
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

#reviews-list article {
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

#reviews-list article header {
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

#reviews-list article h1 {
  font-size: 18px;
  margin: 0;
}

#reviews-list article time {
  color: #eee;
  margin: 0;
}

#reviews-list article span {
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
