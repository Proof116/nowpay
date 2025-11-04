import React, { useState } from 'react'

export default function WithdrawForm({ account, api, onScheduled }) {
  const [amount, setAmount] = useState('')
  const [datetime, setDatetime] = useState(new Date().toISOString().slice(0,16))
  const [loading, setLoading] = useState(false)

  async function submit(e) {
    e.preventDefault()
    const cents = Math.round(Number(amount) * 100)
    if (!Number.isFinite(cents) || cents <= 0) return alert('Enter a positive amount')
    setLoading(true)
    try {
      // convert local datetime-local value to ISO
      const iso = new Date(datetime).toISOString()
      const w = await api.scheduleWithdrawal(account.id, cents, iso)
      onScheduled && onScheduled(w)
      setAmount('')
    } finally { setLoading(false) }
  }

  return (
    <div className="card">
      <h3>Schedule withdrawal for {account.name}</h3>
      <form onSubmit={submit}>
        <label>Amount (USD)</label>
        <input value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.50" />
        <label>When</label>
        <input type="datetime-local" value={datetime} onChange={e => setDatetime(e.target.value)} />
        <button disabled={loading || !amount} type="submit">Schedule</button>
      </form>
    </div>
  )
}
