# Mobile Web Specialist Certification Course
---

# Starting the Dev Server

We opted not to use the [development server provided by udacity]( https://github.com/udacity/mws-restaurant-stage-2), instead we have created our own much simpler dev server within this very repository. It uses [local-web-server](https://github.com/lwsjs/local-web-server/wiki) to serve the static HTML, JS, and CSS, as well as provide database access via a mocked REST API available at `/api/`. As such, we have obviated the need for a database URL and port in the client side JS, as all requests now share a common origin.

To run the dev server, first install dependencies by running
```
npm install
```
then start the server by running
```
npm start
```
If you're using mac 🍎 or linux 🐧, run the server as root with `sudo npm start` , since we're running on the default ports.

The page will be available at https://localhost.

## Server Routes

The server serves restaurant data from the `/api` path.
* To fetch all restaurants, GET `/api/restaurants`.
* For a specific restaurant, GET `/api/restaurants/{id}` e.g. `https://localhost/api/restaurants/3`.
* To change a restaurant's `is_favorite` state, PUT `/api/restaurants/{id}/?is_favorite={state}` e.g. `https://localhost/api/restaurants/3/?is_favorite=true`
* To fetch all reviews, GET `/api/reviews`
* To fetch a specific review by review ID, GET `/api/reviews/{id}` e.g. `https://localhost/api/reviews/33`
* To fetch a specific review by restaurant ID, GET `/api/reviews/?restaurant_id={id}` e.g. `https://localhost/api/reviews?restaurant_id=3`
* To post a new review, POST `/api/reviews` with a JSON review body e.g.
  ```js
  fetch('https://localhost/api/reviews', {
    'credentials' :'omit',
    'headers' :{
      'content-type': 'application/json'
    },
    'body' :'{"comments":"Review Body","name":"Reviewer Name","rating":3,"restaurant_id":3}',
    'method': 'POST',
    'mode': 'cors'
  });
  ```

The dev server serves a single-page-application at `/`. Any request for a file (with `.` in the filename) or to `/api` will return that request's response. All other requests will redirect to index.html.

Because the dev server does not modify data.json, if the user posts a review or changes the `is_favorite` state of a restaurant, that change will only be held in memory by the server. In order to verify that the change has indeed been made after an offline request sync, open an incognito tab and browse to `https://localhost/api/reviews/?restaurant_id=3` or whichever id. You can also just clear the cache and hard refresh to get the same result and see the posted review in the page.

## HTTPS Certificates

The development server is set to serve over http2, which requires a secure connection. In order to make this work locally, you must trust [lws' certicates](https://github.com/lwsjs/local-web-server/wiki/How-to-get-the-%22green-padlock%22-using-the-built-in-certificate), or you can use your own [self-signed cert](https://github.com/lwsjs/local-web-server/wiki/How-to-get-the-%22green-padlock%22-with-a-new-self-signed-certificate).
To install the lws cert, even on windows, just follow the instructions in the link above. If you want to use a self-signed cert instead, just rebuild the docker image when you're done.

# Offline Requests

We have implemented offline request caching using the Background Sync API. Unfortunately, the only way to test this functionality is to actually disconnect the test machine from the internet. Clicking the `offline` checkbox in Chrome dev tools will not suffice.

See [workbox documentation](https://developers.google.com/web/tools/workbox/modules/workbox-background-sync#testing_workbox_background_sync) for more information.

# Opinions

Throughout this project, we have attempted to express a small number of reasoned opinions about The Right Way™ to do web development:

## Standards
> Whenever possible, prefer standards over bespoke implementations.

When making AJAX requests, prefer native browser APIs over libraries such as `$.ajax()`. Furthermore, prefer recently adopted standards to legacy APIs: use `fetch()` instead of `new XMLHttpRequest()`.

## Browser Support
> Support Evergreen Browsers Only

As long as IE11 support is not a stated requirement, we ignore it, preferring to focus on supporting evergreen browsers instead.

## Polyfills
> Use polyfills to bring browsers up to spec.

Even among evergreen browsers, ES2015 and API support is not uniform, therefore, we use polyfills to bring browsers up to speed.

# Style
> Prefer a functional style over imperative or object oriented

* Whenever possible, prefer to write small. pure transformations.
* Prefer a point-free style so as to make borrowing the functor interface of `Array#map` or `Promise#then` more declarative.
* Prefer to pass generalized curried functions first class over writing case-specific lambdas.
* When one-offs are needed, name them.
* Make use of functional techniques like function composition.
* Treat Promises like monads, even though they have a [divergent API](https://github.com/promises-aplus/promises-spec/issues/94).
* Try to keep impure code (code that involves side effects like querying the DOM or an external API, or writing changes to the DOM) separate from the pure code.

Having said that, we stop short of incorporating production-ready FP libraries like [Crocks](https://github.com/evilsoft/crocks) for the sake of simplicity. So in cases where FP-purism conflicts with the KISS principle, we opt for simplicity.

We have, however, linked to our own miniature FP helper library [`power-functions`](https://www.npmjs.com/package/@power-elements/power-functions).

## Weird Parts of JavaScript

We have, in places, opted to use some lesser-known features of JavaScript to communicate our intent more clearly. There are some cases in the code where some side effect is desired as part of an otherwise pure data flow. (see previous note). In these cases, we use the comma operator to run our side effects, returning the parameter afterward in order to maintain data flow. In these cases, parentheses help to emphasize that we are essentially performing the identity (`x => x`) with a brief, non-pure interlude.

# Contribution
If you would like to make a contribution, please open an issue with your bug or feature request. Include a reproduction or stack trace as relevant. Please refer to the open issue in pull requests.
