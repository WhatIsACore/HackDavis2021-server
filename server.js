'use strict';

require('dotenv').config();

const logger = require('./includes/logger');
const auth = require('./includes/auth');
const express = require('express'),
      routes = express(),
      server = require('http').Server(routes);

routes.use(express.json());

routes.get('/', (req, res) => {
  res.sendFile(__dirname + '/test.html'); // http server test
});
routes.get('/userinfo', async (req, res) => {
  let data = await auth.getUserInfo(req.body.name)
  res.json({
    name: data.name,
    salt: data.salt
  });
})
routes.post('/login', auth.login);
routes.post('/register', auth.register);
routes.post('/addFriend', auth.addFriend);

server.listen(process.env.PORT, () => {
  logger.info('starting webserver on port ' + process.env.PORT);
});
