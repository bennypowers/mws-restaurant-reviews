const express = require('express');

const app = express();

const PORT = 8080;

// set up a route to redirect http to https
app.get('*', (req, res) => res.redirect('https://' + req.headers.host + req.url))

console.log('node', process.version, 'listening on port', PORT)

// have it listen on 8080
app.listen(PORT);
