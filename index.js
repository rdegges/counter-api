'use strict';

var auth = require('basic-auth');
var bodyParser = require('body-parser');
var express = require('express');
var memjs = require('memjs');

/*
 * Globals.
 */
var AUTH_USERNAME = process.env.AUTH_USERNAME;
var AUTH_PASSWORD = process.env.AUTH_PASSWORD;
var PORT = process.env.PORT || 3000;

var app = express();
var cache = memjs.Client.create();

/*
 * Middlewares.
 */
app.use(bodyParser.raw({ limit: '100mb', type: 'application/logplex-1' }));

/*
 * Helpers.
 */
function isValidMessage(message) {
  return (message.indexOf('host heroku router') !== -1);
}

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

  var messageCount = req.headers['logplex-msg-count'];
  var drainToken = req.headers['logplex-drain-token'];

  var body = req.body.toString();

  if (messageCount > 1) {
    var messages = body.split('\n');

    messages.map(function(message) {
      if (isValidMessage(message)) {
        cache.increment(drainToken, 1);
        console.log('Found valid message:', message);
      }
    });
  } else {
    if (isValidMessage(body)) {
      console.log('Found valid message:', body);
      cache.increment(drainToken, 1);
    }
  }
  //console.log('frameId:', frameId);
  //console.log('drainToken:', drainToken);

  res.json({ hi: 'there' });
});

/*
 * Server.
 */
app.listen(PORT);
