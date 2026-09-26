import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import app from '../server.js';
import { pool } from '../config/database.js';

let server;
const PORT = 5099;
const BASE_URL = `http://localhost:${PORT}`;

before(async () => {
  process.env.NODE_ENV = 'test';
  await new Promise((resolve) => {
    server = app.listen(PORT, resolve);
  });
});

after(async () => {
  if (server) {
    server.close();
  }
  await pool.end();
  setTimeout(() => process.exit(0), 100);
});

test('GET /api/items returns list of all seeded items', async () => {
  const res = await fetch(`${BASE_URL}/api/items`, { headers: { Connection: 'close' } });
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.ok(Array.isArray(data));
  assert.equal(data.length, 10);
  assert.equal(data[0].id, 1);
  assert.ok(data[0].title);
});

test('GET /api/items?q=quantum filters items by keyword', async () => {
  const res = await fetch(`${BASE_URL}/api/items?q=quantum`, { headers: { Connection: 'close' } });
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.ok(Array.isArray(data));
  assert.equal(data.length, 1);
  assert.equal(data[0].title, 'Quantum Computing');
});

test('GET /api/items?q=Energy filters items in category or description', async () => {
  const res = await fetch(`${BASE_URL}/api/items?q=Energy`, { headers: { Connection: 'close' } });
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.ok(Array.isArray(data));
  assert.ok(data.length >= 2);
});

test('GET /api/items/:id returns item detail by ID', async () => {
  const res = await fetch(`${BASE_URL}/api/items/1`, { headers: { Connection: 'close' } });
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.id, 1);
  assert.equal(data.title, 'Artificial Intelligence & Generative LLMs');
});

test('GET /api/items/:id returns 404 for invalid ID', async () => {
  const res = await fetch(`${BASE_URL}/api/items/9999`, { headers: { Connection: 'close' } });
  assert.equal(res.status, 404);
  const data = await res.json();
  assert.ok(data.error);
});
