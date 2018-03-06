const express = require('express');

const app = express();

const PORT = 80;

// set up a route to redirect http to https
app.get('*', (req, res) => res.redirect('https://' + req.headers.host + req.url))

console.log('node', process.version, 'listening on port', PORT)

// have it listen on 80
app.listen(PORT);
