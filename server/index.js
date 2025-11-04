require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { runMigrations } = require('./migrate');
const routes = require('./routes');
const scheduler = require('./scheduler');

const app = express();
app.use(cors());
app.use(express.json());

runMigrations();

app.use('/api', routes);

if (require.main === module) {
  const port = process.env.PORT || 4000;
  app.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
    // start scheduler after server is up
    scheduler.startScheduler();
  });
} else {
  // when required (e.g. tests), do not start listener or scheduler
  module.exports = app; // for testing
}
