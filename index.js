'use strict';

var auth = require('basic-auth');
var bodyParser = require('body-parser');
var express = require('express');

/*
 * Globals.
 */
var AUTH_USERNAME = process.env.AUTH_USERNAME;
var AUTH_PASSWORD = process.env.AUTH_PASSWORD;
var PORT = process.env.PORT || 3000;

var app = express();

/*
 * Middlewares.
 */
app.use(bodyParser.text({ limit: '100mb' }));

/*
 * Routes.
 */
app.post('/logs', function(req, res) {
  var user = auth(req);

  if (!user) {
    return res.status(401).json({ error: 'No credentials specified.' });
  } else if (!(user.name === AUTH_USERNAME && user.pass === AUTH_PASSWORD)) {
    return res.status(401).json({ error: 'Invalid credentials specified.' });
  }

  console.log(req.body);
  res.json({ hi: 'there' });
});

/*
 * Server.
 */
app.listen(PORT);
