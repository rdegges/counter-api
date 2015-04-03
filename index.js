'use strict';

var auth = require('basic-auth');
var bodyParser = require('body-parser');
var express = require('express');
var logParser = require('glossy').Parse;

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
app.use(bodyParser.raw({ limit: '100mb', type: 'application/logplex-1' }));

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
  var frameId = req.headers['logplex-frame-id'];
  var drainToken = req.headers['logplex-drain-token'];

  if (messageCount > 1) {
    console.log('messageCount:', messageCount);

    var messages = req.body.toString().split('\n');
    messages.map(function(message) {
      logParser.parse(message.toString('utf8', 0), function(parsed) {
        console.log(parsed);
      });
    });
    //console.log(req.body.toString());
  }
  //console.log('frameId:', frameId);
  //console.log('drainToken:', drainToken);

  res.json({ hi: 'there' });
});

/*
 * Server.
 */
app.listen(PORT);
