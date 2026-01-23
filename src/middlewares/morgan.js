const pinoHttp = require('pino-http');
const { buildEcsLog } = require('../config/logger');

const httpLogger = pinoHttp({
  logger: buildEcsLog({ base: { component: 'http' } }),
  customLogLevel(res, err) {
    if (err || res.statusCode >= 500) {
      return 'error';
    }
    if (res.statusCode >= 400) {
      return 'warn';
    }
    return 'info';
  },
  customSuccessMessage(res) {
    return `${res.req.method} ${res.req.url} ${res.statusCode}`;
  },
  customErrorMessage(error, res) {
    const method = res && res.req ? res.req.method : 'HTTP';
    const url = res && res.req ? res.req.url : '';
    return `${method} ${url} failed`;
  },
});

module.exports = httpLogger;
