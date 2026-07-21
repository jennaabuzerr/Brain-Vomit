//import better-sqlite3
const database = require("better-sqlite3");

//open database file
const db = new database('brainvomit.db');

//create a table
db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    raw_text TEXT,
    name TEXT,
    deadline TEXT,
    category TEXT,
    priority TEXT,
    created_at TEXT
  )
`);

module.exports = db;