const express = require('express');
const router = express.Router();
const db = require('./db');
const { validateDepositBody, validateScheduleBody } = require('./validation');

// Helper: return account
function getAccount(id) {
  return db.prepare('SELECT * FROM accounts WHERE id = ?').get(id);
}

// Create account
router.post('/accounts', (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'name required' });
    const stmt = db.prepare('INSERT INTO accounts (name, balance) VALUES (?, 0)');
    const info = stmt.run(name);
    const account = getAccount(info.lastInsertRowid);
    res.status(201).json(account);
  } catch (err) {
    console.error('create account error', err);
    res.status(500).json({ error: 'internal' });
  }
});

// Deposit
router.post('/accounts/:id/deposit', (req, res) => {
  try {
    const id = Number(req.params.id);
    const v = validateDepositBody(req.body);
    if (!v.ok) return res.status(400).json({ error: v.error });
    const { amount } = v.value;
    const account = getAccount(id);
    if (!account) return res.status(404).json({ error: 'account not found' });

    const update = db.prepare('UPDATE accounts SET balance = balance + ? WHERE id = ?');
    update.run(amount, id);
    db.prepare('INSERT INTO transactions (account_id, type, amount) VALUES (?, ?, ?)').run(id, 'deposit', amount);
    const updated = getAccount(id);
    res.json(updated);
  } catch (err) {
    console.error('deposit error', err);
    res.status(500).json({ error: 'internal' });
  }
});

// Schedule withdrawal
router.post('/withdrawals', (req, res) => {
  try {
    const v = validateScheduleBody(req.body);
    if (!v.ok) return res.status(400).json({ error: v.error });
    const { accountId, amount, scheduledAt } = v.value;
    const account = getAccount(accountId);
    if (!account) return res.status(404).json({ error: 'account not found' });

    const stmt = db.prepare('INSERT INTO withdrawals (account_id, amount, scheduled_at, status) VALUES (?, ?, ?, ?)');
    const info = stmt.run(accountId, amount, scheduledAt, 'scheduled');
    const w = db.prepare('SELECT * FROM withdrawals WHERE id = ?').get(info.lastInsertRowid);
    res.status(201).json(w);
  } catch (err) {
    console.error('schedule withdrawal error', err);
    res.status(500).json({ error: 'internal' });
  }
});

// List withdrawals
router.get('/withdrawals', (req, res) => {
  const rows = db.prepare('SELECT * FROM withdrawals ORDER BY id DESC').all();
  res.json(rows);
});

// Manual process trigger
router.post('/withdrawals/process', (req, res) => {
  const result = require('./scheduler').processDueWithdrawals();
  res.json({ processed: result });
});

module.exports = router;

// List accounts
router.get('/accounts', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM accounts ORDER BY id DESC').all();
    res.json(rows);
  } catch (err) {
    console.error('list accounts error', err);
    res.status(500).json({ error: 'internal' });
  }
});

// Get account by id (with recent transactions)
router.get('/accounts/:id', (req, res) => {
  try {
    const id = Number(req.params.id);
    const account = getAccount(id);
    if (!account) return res.status(404).json({ error: 'account not found' });
    const tx = db.prepare('SELECT * FROM transactions WHERE account_id = ? ORDER BY id DESC LIMIT 50').all(id);
    res.json({ account, transactions: tx });
  } catch (err) {
    console.error('get account error', err);
    res.status(500).json({ error: 'internal' });
  }
});

// List transactions for an account
router.get('/accounts/:id/transactions', (req, res) => {
  try {
    const id = Number(req.params.id);
    const account = getAccount(id);
    if (!account) return res.status(404).json({ error: 'account not found' });
    const tx = db.prepare('SELECT * FROM transactions WHERE account_id = ? ORDER BY id DESC').all(id);
    res.json(tx);
  } catch (err) {
    console.error('list transactions error', err);
    res.status(500).json({ error: 'internal' });
  }
});

