'use strict';

const winston = require('winston');

const logger = winston.createLogger();

// console output
logger.add(new winston.transports.Console({
  format: winston.format.simple()
}));

// file output
if(!process.env.NOLOG){
  logger.add(
    new winston.transports.File({filename: '../logs/server.log'})
  );
}

module.exports = logger;
