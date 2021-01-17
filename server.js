'use strict';
require('dotenv').config();

const logger = require('./includes/logger');

const express = require('express'),
      routes = express(),
      server = require('http').Server(routes);

routes.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});
routes.post('/login', (req, res) => {

});
routes.post('/register', (req, res) => {

});

server.listen(process.env.PORT, () => {
  logger.info('starting webserver on port ' + process.env.PORT);
});
