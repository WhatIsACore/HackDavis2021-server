'use strict';
const logger = require('./logger');

const crypto = require('crypto');
const db = require('./redis-client');

async function getUserInfo(name) {
  const key = db.toUserKey(name);
  const results = await db.hgetall(key);
  return results;
}
module.exports.getUserInfo = getUserInfo;

// TODO: the way I built sessions is insecure and they dont expire, when we have time come back to this
function generateSessionToken() {
  const h = crypto.randomBytes(Math.ceil(3/2))
    .toString('hex')
    .slice(0, 3);
  const token = crypto.createHmac('sha512', h).digest('hex');
  return token;
}
async function isValidSession(req) {
  const name = req.body.name;
  const token = req.body.token;
  if (!name || !token)
    return false;
  const key = db.toUserKey(name);
  const result = await db.hget(key, 'session');
  return token === result;
}
module.exports.isValidSession = isValidSession;

async function login(req, res) {
  const name = req.body.name;
  const key = db.toUserKey(name);
  let password = req.body.password;

  // make sure user exists
  let user = await getUserInfo(name);
  if (!user) {
    res.json({action: 'error', message: 'your username or password is wrong'});
    return;
  }

  // hash password with stored salt
  let hash = crypto.createHmac('sha512', user.salt);
  hash.update(password);
  password = hash.digest('hex');

  // compare password hashes
  if (password !== user.hash) {
    res.json({action: 'error', message: 'your username or password is wrong'});
    return;
  }

  // create a new session
  const token = generateSessionToken();
  await db.hset(key, 'session', token);

  // good to go
  res.json({action: 'success', session: token});
}
module.exports.login = login;

async function register(req, res) {
  const name = req.body.name;
  const key = db.toUserKey(name);
  let password = req.body.password;

  // validate name
  if (name.length < 4 || name.length > 12) {
    res.json({action: 'error', message: 'name must be 4-12 chars'});
    return;
  }
  if (name != name.replace(/\W/g, '')) {
    res.json({action: 'error', message: 'name can only use numbers, letters, and _'});
    return;
  }

  // validate password
  if (password.length < 7 || password.length > 18) {
    res.json({action: 'error', message: 'password must be 7-18 chars'});
    return;
  }

  // check if user already exists
  let user = await getUserInfo(name);
  if (user) {
    res.json({action: 'error', message: 'that name is already used'});
    return;
  }

  // salt and hash the password
  const s = crypto.randomBytes(Math.ceil(3/2))
    .toString('hex')
    .slice(0, 3);
  let hash = crypto.createHmac('sha512', s);
  hash.update(password);
  password = hash.digest('hex');

  // create a new session
  const token = generateSessionToken();

  // register the user
  await db.hmset(key, db.toDBI({
    name: name,
    hash: password,
    salt: s,
    session: token
  }));
  res.json({action: 'success', session: token});
}
module.exports.register = register;
