import React from 'react'

export default function WithdrawalsList({ items }) {
  return (
    <div className="card">
      <h3>Withdrawals</h3>
      {items.length === 0 && <div>No withdrawals yet</div>}
      <ul>
        {items.map(w => (
          <li key={w.id}>
            #{w.id} account:{w.account_id} amount:{(w.amount/100).toFixed(2)} scheduled:{w.scheduled_at} status:{w.status}
          </li>
        ))}
      </ul>
    </div>
  )
}
