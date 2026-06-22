const express = require('express');
const taskRoutes = require('./routes/taskRoutes');
const packageInfo = require('../package.json');

const app = express();
var lintFailureDemo = 'intentional lint failure';

app.use(express.json());

app.get('/health', (request, response) => {
  response.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    version: packageInfo.version,
  });
});

app.use('/api/tasks', taskRoutes);

app.use((request, response) => {
  response.status(404).json({ message: 'Route not found' });
});

app.use((error, request, response, next) => {
  if (response.headersSent) {
    next(error);
    return;
  }

  response.status(error.status || 500).json({
    message: error.message || 'Internal server error',
  });
});

module.exports = app;
