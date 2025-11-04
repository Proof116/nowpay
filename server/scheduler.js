const db = require('./db');
const cron = require('node-cron');

function processDueWithdrawals() {
  const nowIso = new Date().toISOString();
  const due = db.prepare("SELECT * FROM withdrawals WHERE status = 'scheduled' AND scheduled_at <= ?").all(nowIso);
  const results = [];
  const processStmt = db.prepare('UPDATE withdrawals SET status = ?, processed_at = ?, fail_reason = ? WHERE id = ?');
  const updateBalance = db.prepare('UPDATE accounts SET balance = balance - ? WHERE id = ? AND balance >= ?');
  const addTxn = db.prepare('INSERT INTO transactions (account_id, type, amount) VALUES (?, ?, ?)');

  for (const w of due) {
    // Try to deduct
    const info = updateBalance.run(w.amount, w.account_id, w.amount);
    if (info.changes === 1) {
      // success
      addTxn.run(w.account_id, 'withdrawal', w.amount);
      processStmt.run('processed', new Date().toISOString(), null, w.id);
      results.push({ id: w.id, status: 'processed' });
    } else {
      // insufficient funds
      processStmt.run('failed', new Date().toISOString(), 'insufficient_funds', w.id);
      results.push({ id: w.id, status: 'failed', reason: 'insufficient_funds' });
    }
  }

  return results;
}

function startScheduler() {
  // run every minute
  cron.schedule('* * * * *', () => {
    try {
      const res = processDueWithdrawals();
      if (res.length) console.log('Processed withdrawals:', res);
    } catch (err) {
      console.error('Error processing withdrawals', err);
    }
  });
}

module.exports = { startScheduler, processDueWithdrawals };
