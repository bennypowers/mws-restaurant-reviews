import { html } from '/node_modules/lit-html/lit-html.js';

const restaurantStyles = html`<style>

/* ====================== Restaurant Details ====================== */

header {
  position: relative;
  top: 0;
  width: 100%;
  z-index: 1000;
}

#map-container {
  position: relative;
  max-height: 50vh;
  /* height: 87%; */
  /* position: fixed; */
  /* right: 0; */
  /* top: 80px; */
  /* width: 50%; */
}

#footer {
  bottom: 0;
  position: absolute;
  width: calc(100% - 50px);
  /* large screens */
  /* width: 50%; */
}

#form-fab {
  background-color: crimson;
  position: fixed;
  bottom: 1em;
  right: 1em;
  z-index: 2000;
}

#restaurant-container {
  display: grid;
  max-width: 100%;
}

#restaurant-container,
#reviews-container {
  border-bottom: 1px solid #d9d9d9;
  border-top: 1px solid #fff;
}

#restaurant-container {
  padding: 30px 0;
}

#reviews-container {
  padding: 30px 40px;
}

#restaurant-container h1 {
  padding: 0 40px;
  width: 100%;
  flex: 1 0 auto;
}

#restaurant-details-container,
#restaurant-image-container {
  padding: 0 40px;
  margin: 0;
}

meter {
  min-width: 6.5em;
  visibility: hidden;
}

meter:after {
  position: absolute;
  visibility: visible;
}

meter[value="1"]:after {
  content: '⭐☆☆☆☆';
}

meter[value="2"]:after {
  content: '⭐⭐☆☆☆';
}

meter[value="3"]:after {
  content: '⭐⭐⭐☆☆';
}

meter[value="4"]:after {
  content: '⭐⭐⭐⭐☆';
}

meter[value="5"]:after {
  content: '⭐⭐⭐⭐⭐';
}

@media screen and (min-width: 500px) {
  #maincontent {
    display: flex;
    flex-wrap: wrap;
  }

  #restaurant-container,
  #reviews-container,
  #map-container {
    flex: 1 1 auto;
    max-width: 50%;
    height: auto !important;
  }

  #restaurant-container {
    order: 0;
  }

  #map-container {
    order: 1;
  }

  #reviews-container {
    order: 2;
    max-width: 100%;
  }
}

@media (min-width: 630px) {
  #restaurant-container h1 {
    grid-column-end: span 2;
  }

  #restaurant-container {
    display: flex;
    flex-flow: row wrap;
  }
}

@media (min-width: 960px) {
  #restaurant-container {
    display: grid;
    grid-column-gap: 2%;
    grid-template-columns: repeat(2, 1fr);
  }

  #restaurant-details-container,
  #restaurant-image-container {
    padding: 0;
  }

  #restaurant-details-container {
    padding-right: 40px;
  }

  #restaurant-image-container {
    padding-left: 40px;
  }

  #reviews-list {
    grid-template-columns: 33% 33% 33%;
    grid-column-gap: 0.5%;
  }
}
</style>`;

export default restaurantStyles;
