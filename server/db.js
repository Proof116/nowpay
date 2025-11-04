const Database = require('better-sqlite3');

const file = process.env.TEST_DB || process.env.DATABASE || './data.sqlite';
const db = new Database(file);

module.exports = db;
