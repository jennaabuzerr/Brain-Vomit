/*
  This file handles the server's logic and functionality for Brain Vomit.
  It handles all API requests and deals with the database interactions.
 */

// ============================================================
// Imports & Setup
// ============================================================
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./db');
const categorizeTask = require('./ai');

const app = express();

app.use(cors());
app.use(express.json());

// ============================================================
// Health Check
// ============================================================
app.get('/', (req, res) => {
  res.send('Brain Vomit server is running');
});

// ============================================================
// Create Task — saves a task with already-known fields
// ============================================================
app.post('/api/tasks', (req, res) => {
  const { raw_text, name, deadline, category, priority } = req.body;

  const stmt = db.prepare(
    'INSERT INTO tasks (raw_text, name, deadline, category, priority, created_at) VALUES (?, ?, ?, ?, ?, ?)'
  );
  stmt.run(raw_text, name, deadline, category, priority, new Date().toISOString());

  res.send('Task saved');
});

// ============================================================
// Read Tasks — returns every saved task
// ============================================================
app.get('/api/tasks', (req, res) => {
  const stmt = db.prepare('SELECT * FROM tasks');
  const tasks = stmt.all();
  res.json(tasks);
});

// ============================================================
// Categorize + Create — sends raw text to the AI, saves the
// structured result it returns
// ============================================================
app.post('/api/categorize', async (req, res) => {
  const { raw_text } = req.body;
  const structuredTask = await categorizeTask(raw_text);

  const stmt = db.prepare(
    'INSERT INTO tasks (raw_text, name, deadline, category, priority, created_at) VALUES (?, ?, ?, ?, ?, ?)'
  );
  stmt.run(raw_text, structuredTask.name, structuredTask.deadline, structuredTask.category, structuredTask.priority, new Date().toISOString());

  res.json(structuredTask);
});

// ============================================================
// Delete Task — removes one task by id
// ============================================================
app.delete('/api/tasks/:id', (req, res) => {
  const { id } = req.params;

  const stmt = db.prepare('DELETE FROM tasks WHERE id = ?');
  stmt.run(id);

  res.send('Task deleted');
});

// ============================================================
// Update Task — edits an existing task's fields
// ============================================================
app.put('/api/tasks/:id', (req, res) => {
  const { id } = req.params;
  const { name, deadline, category, priority } = req.body;

  const stmt = db.prepare(
    'UPDATE tasks SET name = ?, category = ?, priority = ?, deadline = ? WHERE id = ?'
  );
  stmt.run(name, category, priority, deadline, id);

  res.send('Task Updated');
});

// ============================================================
// Start Server
// ============================================================
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});