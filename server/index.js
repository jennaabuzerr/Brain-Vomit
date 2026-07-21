/* 
  This file handles the servers logic and functionality for Brain Vomit
  Overall it will handle all API requests and deal with the database interactions.
 */

// Import necessary packages
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./db');
const categorizeTask = require('./ai');

//create app object
const app = express();

//cors allows react app on port to make requests to the server
app.use(cors());
//express.json reads request like raw text dump brain dump will send 
//and converts them into javascript objects so route handlers can access them
app.use(express.json());

// Define routes
app.get('/', (req, res) => {
  res.send('Brain Vomit server is running');
});

//writing the route
//route used for sending/creating data
app.post('/api/tasks', (req, res) => {
  // Extract task data from request body
  const { raw_text, name, deadline, category, priority } = req.body;

  // Insert task data into the database
  const stmt = db.prepare(
    'INSERT INTO tasks (raw_text, name, deadline, category, priority, created_at) VALUES (?, ?, ?, ?, ?, ?)'
  );
  // run statement with date.toISOString() creating a timestamp for current date
  stmt.run(raw_text, name, deadline, category, priority, new Date().toISOString());

  res.send('Task saved');
});

// retrieve route
app.get('/api/tasks', (req, res) => {
  // Get all tasks from the database
  const stmt = db.prepare('SELECT * FROM tasks');
  // all() method retrieves all rows from the result set
  const tasks = stmt.all();
  // Send the tasks as a JSON response
  res.json(tasks);
});

app.post('/api/categorize', async (req, res) => {
  // Categorize the task using AI
  const { raw_text } = req.body;
  // Call the AI function
  const structuredTask = await categorizeTask(raw_text);

  // structuredTask.name, structuredTask.deadline, etc. to insert into the database
  // same INSERT pattern as /api/tasks route
  const stmt = db.prepare(
    'INSERT INTO tasks (raw_text, name, deadline, category, priority, created_at) VALUES (?, ?, ?, ?, ?, ?)'
  );
  // run statement with date.toISOString() creating a timestamp for current date
  stmt.run(raw_text, structuredTask.name, structuredTask.deadline, structuredTask.category, structuredTask.priority, new Date().toISOString());

  // display structuredTask
  res.json(structuredTask);
});

// start server
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

