function isPositiveInteger(n) {
  return Number.isInteger(n) && n > 0
}

function parseIso(s) {
  const d = new Date(s)
  return isNaN(d.getTime()) ? null : d
}

function validateDepositBody(body) {
  const amount = body && body.amount
  if (!isPositiveInteger(amount)) return { ok: false, error: 'amount must be a positive integer (cents)' }
  return { ok: true, value: { amount } }
}

function validateScheduleBody(body) {
  const accountId = Number(body && body.accountId)
  const amount = body && body.amount
  const scheduledAt = body && body.scheduledAt
  if (!isPositiveInteger(amount)) return { ok: false, error: 'amount must be a positive integer (cents)' }
  if (!Number.isInteger(accountId) || accountId <= 0) return { ok: false, error: 'accountId must be a positive integer' }
  const d = parseIso(scheduledAt)
  if (!d) return { ok: false, error: 'scheduledAt must be a valid ISO datetime string' }
  return { ok: true, value: { accountId, amount, scheduledAt: d.toISOString() } }
}

module.exports = { isPositiveInteger, parseIso, validateDepositBody, validateScheduleBody }
