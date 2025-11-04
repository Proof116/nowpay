import React, { useState } from 'react'

export default function DepositForm({ account, api, onUpdated }) {
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e) {
    e.preventDefault()
    const cents = Math.round(Number(amount) * 100)
    if (!Number.isFinite(cents) || cents <= 0) return alert('Enter a positive amount')
    setLoading(true)
    try {
      const updated = await api.deposit(account.id, cents)
      onUpdated && onUpdated(updated)
      setAmount('')
    } finally { setLoading(false) }
  }

  return (
    <div className="card">
      <h3>Deposit into {account.name}</h3>
      <form onSubmit={submit} className="row">
        <div className="col">
          <label>Amount (USD)</label>
          <input value={amount} onChange={e => setAmount(e.target.value)} placeholder="1.00" />
        </div>
        <div>
          <button disabled={loading || !amount} type="submit">Deposit</button>
        </div>
      </form>
    </div>
  )
}
