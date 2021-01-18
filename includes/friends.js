'use strict';
const logger = require('./logger');

const db = require('./redis-client');
const auth = require('./auth');

async function addFriend(req, res) {
  const name = req.body.name;
  const valid = await auth.isValidSession(req);
  if (!valid) {
    res.json({action: 'error', message: 'session is invalid'});
    return;
  }
}
