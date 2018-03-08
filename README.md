# Mobile Web Specialist Certification Course
---

# Starting the Dev Server

We opted not to use the [development server provided by udacity]( https://github.com/udacity/mws-restaurant-stage-2), instead we have created our own much simpler dev server within this very repository. It uses [local-web-server](https://github.com/lwsjs/local-web-server/wiki) to serve the static HTML, JS, and CSS, as well as provide database access via a mocked REST API available at `/api/`. As such, we have obviated the need for a database URL and port in the client side JS, as all requests now share a common origin.

To run the dev server, install npm dependencies then run `npm start` (`sudo npm start` on mac 🍎 or linux 🐧, since we're running on the default ports). The page will be available at https://localhost.

## Windows Server Bug

I've found an issue which causes some lighthouse tests to fail specifically on Windows. While I'm working with the author of `local-web-server` to fix the issue, some lighthouse tests scores on windows may be affected. I've therefore uploaded a copy of the lighthouse test json that I got on my mac:

https://pastebin.com/b4SFgdA5

# HTTPS Certificates

The development server is set to serve over http2, which requires a secure connection. In order to make this work locally, you must trust [lws' certicates](https://github.com/lwsjs/local-web-server/wiki/How-to-get-the-%22green-padlock%22-using-the-built-in-certificate), or you can use your own [self-signed cert](https://github.com/lwsjs/local-web-server/wiki/How-to-get-the-%22green-padlock%22-with-a-new-self-signed-certificate).
To install the lws cert, even on windows, just follow the instructions in the link above. If you want to use a self-signed cert instead, just rebuild the docker image when you're done.

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
* Make use of functional techniques like function composition.
* Treat Promises like monads, even though they have a [divergent API](https://github.com/promises-aplus/promises-spec/issues/94).
* Try to keep impure code (code that involves side effects like querying the DOM or an external API, or writing changes to the DOM) separate from the pure code.

Having said that, we stop short of incorporating production-ready FP libraries like [Crocks](https://github.com/evilsoft/crocks) or functional templating engines like [lit-html](https://github.com/Polymer/lit-html) for the sake of simplicity. So in cases where FP-purism conflicts with the KISS principle, we opt for simplicity.

## Weird Parts of JavaScript

We have, in places, opted to use some lesser-known features of JavaScript to communicate our intent more clearly. There are many cases in main.js where some side effect is desired as part of an otherwise pure data flow. (see previous note). In these cases, we use the comma operator to run our side effects, returning the parameter afterward in order to maintain data flow. In these cases, parentheses help to emphasize that we are essentially performing the identity (`x => x`) with a brief, non-pure interlude.
