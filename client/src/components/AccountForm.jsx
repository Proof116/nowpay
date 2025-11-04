import React, { useState } from 'react'

export default function AccountForm({ onCreated, api }) {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      const acc = await api.createAccount(name)
      setName('')
      onCreated && onCreated(acc)
    } finally { setLoading(false) }
  }

  return (
    <div className="card">
      <h3>Create account</h3>
      <form onSubmit={submit}>
        <label>Name</label>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Alice" />
        <button disabled={loading || !name} type="submit">Create</button>
      </form>
    </div>
  )
}
