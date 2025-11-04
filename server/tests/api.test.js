const request = require('supertest');
const fs = require('fs');
const path = require('path');

// Use a separate DB file for tests to avoid clobbering dev data
const TEST_DB = path.resolve(__dirname, '..', 'test.sqlite');
if (fs.existsSync(TEST_DB)) fs.unlinkSync(TEST_DB);

// copy server/db.js but set DB path to test.sqlite by using env var
process.env.TEST_DB = TEST_DB;

const { spawnSync } = require('child_process');

// require the app after setting up env
const app = require('../index');
const db = require('../db');

describe('API happy path', () => {
  test('create account, deposit, schedule and process withdrawal', async () => {
    // create account
    const create = await request(app).post('/api/accounts').send({ name: 'Alice' });
    expect(create.status).toBe(201);
    const account = create.body;

    // deposit 1000 cents
    const dep = await request(app).post(`/api/accounts/${account.id}/deposit`).send({ amount: 1000 });
    expect(dep.status).toBe(200);
    expect(dep.body.balance).toBe(1000);

    // schedule withdrawal now
    const scheduledAt = new Date().toISOString();
    const w = await request(app).post('/api/withdrawals').send({ accountId: account.id, amount: 500, scheduledAt });
    expect(w.status).toBe(201);

    // trigger processing
    const proc = await request(app).post('/api/withdrawals/process').send();
    expect(proc.status).toBe(200);
    expect(Array.isArray(proc.body.processed)).toBeTruthy();

    // final balance should be 500
    const final = db.prepare('SELECT * FROM accounts WHERE id = ?').get(account.id);
    expect(final.balance).toBe(500);
  }, 10000);
});
