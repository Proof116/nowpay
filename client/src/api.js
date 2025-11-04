const BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000/api'

async function request(path, opts = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...opts,
  })
  const text = await res.text()
  try { return JSON.parse(text) } catch { return text }
}

export const createAccount = (name) => request('/accounts', { method: 'POST', body: JSON.stringify({ name }) })
export const deposit = (id, amount) => request(`/accounts/${id}/deposit`, { method: 'POST', body: JSON.stringify({ amount }) })
export const scheduleWithdrawal = (accountId, amount, scheduledAt) => request('/withdrawals', { method: 'POST', body: JSON.stringify({ accountId, amount, scheduledAt }) })
export const listWithdrawals = () => request('/withdrawals')
export const processWithdrawals = () => request('/withdrawals/process', { method: 'POST' })
export const getAccounts = () => request('/accounts')
export const getAccount = (id) => request(`/accounts/${id}`)
export const getTransactions = (id) => request(`/accounts/${id}/transactions`)

export default { createAccount, deposit, scheduleWithdrawal, listWithdrawals, processWithdrawals }
