const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morganMiddleware = require('./middlewares/morgan');
const { logger } = require('./config/logger');

const app = express();

app.use(helmet());
app.use(cors());
app.use(morganMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', service: 'omnicore-product' });
});

app.use((err, req, res, next) => {
  logger.error(
    {
      err,
      status: err.status || 500,
      method: req.method,
      path: req.originalUrl,
      ip: req.ip,
    },
    'Unhandled application error'
  );

  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      status: err.status || 500,
    },
  });
});

module.exports = app;
