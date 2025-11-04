const request = require('supertest');
const fs = require('fs');
const path = require('path');

const TEST_DB = path.resolve(__dirname, '..', 'test_error.sqlite');
if (fs.existsSync(TEST_DB)) fs.unlinkSync(TEST_DB);
process.env.TEST_DB = TEST_DB;

const app = require('../index');
const db = require('../db');

beforeAll(() => {
  // migrate DB
  require('../migrate').runMigrations();
});

test('deposit validation rejects bad amount', async () => {
  const c = await request(app).post('/api/accounts').send({ name: 'Bob' });
  expect(c.status).toBe(201);
  const res = await request(app).post(`/api/accounts/${c.body.id}/deposit`).send({ amount: -10 });
  expect(res.status).toBe(400);
  expect(res.body.error).toMatch(/amount/);
});

test('withdrawal fails when insufficient funds', async () => {
  // create account with zero balance
  const c = await request(app).post('/api/accounts').send({ name: 'Carol' });
  expect(c.status).toBe(201);
  const scheduledAt = new Date().toISOString();
  const w = await request(app).post('/api/withdrawals').send({ accountId: c.body.id, amount: 100, scheduledAt });
  expect(w.status).toBe(201);
  const proc = await request(app).post('/api/withdrawals/process').send();
  expect(proc.status).toBe(200);
  // check withdrawal status
  const row = db.prepare('SELECT * FROM withdrawals WHERE id = ?').get(w.body.id);
  expect(row.status).toBe('failed');
  expect(row.fail_reason).toBe('insufficient_funds');
});
