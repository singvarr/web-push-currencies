const bunyan = require('bunyan');

const logger = bunyan.createLogger({ name: 'Server' });

module.exports = logger;
