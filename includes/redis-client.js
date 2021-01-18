'use strict';

const logger = require('./logger');

const redis = require('redis');
const client = redis.createClient(process.env.REDISPORT, process.env.REDISHOST);
client.on('error', err => logger.error('ERR:REDIS:', err));
module.exports.client = client;

// turn redis commands into promises
const {promisify} = require('util');
const commands = ['hget', 'hset', 'hgetall', 'hmset'];
for (let c of commands)
  module.exports[c] = promisify(client[c].bind(client));

// utlity
module.exports.toUserKey = (name) => `_user-${name.toLowerCase()}`;
module.exports.toDBI = (obj) => {  // turn an object into an array for insertion into redis
  let arr = [];
  for (key of Object.keys(obj))
    arr.push(key, obj[key]);
  return arr;
}
