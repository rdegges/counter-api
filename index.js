'use strict';

var express = require('express');

var app = express();

app.get('/', function(req, res) {
  res.json({ hi: 'there' });
});

app.listen(process.env.PORT || 3000);
