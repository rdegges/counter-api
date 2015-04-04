'use strict';

var async = require('async');
var auth = require('basic-auth');
var bodyParser = require('body-parser');
var express = require('express');
var memjs = require('memjs');
var Sequelize = require('sequelize');

/*
 * Settings.
 */
var AUTH_USERNAME = process.env.AUTH_USERNAME;
var AUTH_PASSWORD = process.env.AUTH_PASSWORD;
var HEROKU_ADDON_USERNAME = process.env.HEROKU_ADDON_USERNAME;
var HEROKU_ADDON_PASSWORD = process.env.HEROKU_ADDON_PASSWORD;
var DATABASE_URL = process.env.DATABASE_URL;
var PORT = process.env.PORT || 3000;

/*
 * Globals.
 */
var app = express();
var cache = memjs.Client.create();
var sequelize = new Sequelize(DATABASE_URL);

/*
 * Models.
 */

/*
 * Middlewares.
 */
app.use(bodyParser.json());
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

  var drainToken = req.headers['logplex-drain-token'];
  var body = req.body.toString();
  var messages = body.split('\n');
  var totalRequests = 0;

  async.each(messages, function(message, cb) {
    if (isValidMessage(message)) {
      totalRequests++;
    }
    cb();
  }, function(err) {
    if (err) throw err;
    cache.increment(drainToken, totalRequests);
  });

  //console.log('frameId:', frameId);
  //console.log('drainToken:', drainToken);

  res.json({ hi: 'there' });
});

app.post('/heroku/resources', function(req, res) {
  var creds = auth(req);

  if (!creds) {
    return res.status(401).json({ error: 'No credentials specified.' });
  } else if (!(creds.name === HEROKU_ADDON_USERNAME && creds.pass === HEROKU_ADDON_PASSWORD)) {
    return res.status(401).json({ error: 'Invalid credentials specified.' });
  }

  var herokuId = req.body.heroku_id;
  var plan = req.body.plan;
  var callbackUrl = req.body.callback_url;
  var logplex_token = req.body.logplex_token;
  var region = req.body.region;
  var options = req.body.options;

  res.json({ id: 12345 });
});

app.delete('/heroku/resources/:id', function(req, res) {
  var creds = auth(req);

  if (!creds) {
    return res.status(401).json({ error: 'No credentials specified.' });
  } else if (!(creds.name === HEROKU_ADDON_USERNAME && creds.pass === HEROKU_ADDON_PASSWORD)) {
    return res.status(401).json({ error: 'Invalid credentials specified.' });
  }

  res.json();
});

app.put('/heroku/resources/:id', function(req, res) {
  var creds = auth(req);

  if (!creds) {
    return res.status(401).json({ error: 'No credentials specified.' });
  } else if (!(creds.name === HEROKU_ADDON_USERNAME && creds.pass === HEROKU_ADDON_PASSWORD)) {
    return res.status(401).json({ error: 'Invalid credentials specified.' });
  }

  var plan = req.body.plan;
  res.json({ message: 'Your plan has been changed to: ' + plan + '!' });
});

/*
 * Cron-style tasks.
 */
setInterval(function() {
  cache.get('d.74ac7d4c-02b5-4729-8326-4b7dfcffc9b5', function(err, value, key) {
    if (err) throw err;
    console.log('key:', key.toString());
    console.log('value:', value.toString());
  });
}, 60000);

/*
 * Server.
 */
app.listen(PORT);
