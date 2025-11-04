import React, { useEffect, useState } from 'react'
import api from './api'
import AccountForm from './components/AccountForm'
import DepositForm from './components/DepositForm'
import WithdrawForm from './components/WithdrawForm'
import WithdrawalsList from './components/WithdrawalsList'

import Logo from './assets/logo.svg'
import Hero from './assets/hero.svg'

export default function App(){
  const [accounts, setAccounts] = useState([])
  const [selected, setSelected] = useState(null)
  const [withdrawals, setWithdrawals] = useState([])
  const [transactions, setTransactions] = useState([])

  useEffect(()=>{ init(); const i = setInterval(refreshAll, 30000); return ()=>clearInterval(i) }, [])

  async function init(){
    await fetchAccounts()
    await fetchWithdrawals()
  }

  async function fetchAccounts(){
    const a = await api.getAccounts()
    const list = Array.isArray(a)? a : []
    setAccounts(list)
    if (!selected && list.length) setSelected(list[0])
    // update selected's latest info if present
    if (selected) {
      const fresh = list.find(x => x.id === selected.id)
      if (fresh) setSelected(fresh)
    }
  }

  async function fetchWithdrawals(){
    const w = await api.listWithdrawals()
    setWithdrawals(Array.isArray(w)? w : [])
  }

  async function fetchTransactions(accountId){
    const t = await api.getTransactions(accountId)
    setTransactions(Array.isArray(t)? t : [])
  }

  async function refreshAll(){
    await fetchAccounts()
    await fetchWithdrawals()
    if (selected) await fetchTransactions(selected.id)
  }

  function onAccountCreated(acc){
    // refresh list from server
    fetchAccounts()
    setSelected(acc)
  }

  async function onAccountUpdated(){
    await fetchAccounts()
    if (selected) await fetchTransactions(selected.id)
  }

  async function onSelectAccount(acc){
    setSelected(acc)
    await fetchTransactions(acc.id)
  }

  return (
    <div>
      <header style={{display:'flex',alignItems:'center',gap:12}}>
        <img src={Logo} alt="logo" style={{width:48,height:48}} />
        <h1 style={{margin:0}}>Automatic Withdrawal — Demo</h1>
      </header>

      <div style={{marginTop:12}}>
        <img src={Hero} alt="illustration" style={{width:'100%',maxWidth:900,borderRadius:10,boxShadow:'0 4px 14px rgba(15,23,42,0.08)'}} />
      </div>

      <div className="card">
        <AccountForm onCreated={onAccountCreated} api={api} />
      </div>

      <div className="card">
        <h3>Accounts</h3>
        {accounts.length === 0 && <div>No accounts yet</div>}
        <ul>
          {accounts.map(a => (
            <li key={a.id} style={{marginBottom:6}}>
              <button onClick={()=>onSelectAccount(a)} style={{marginRight:8}}>Select</button>
              #{a.id} {a.name} — balance: ${(a.balance/100).toFixed(2)}
            </li>
          ))}
        </ul>
      </div>

      {selected && (
        <div>
          <div className="card">
            <h3>Selected: {selected.name} (#{selected.id}) — balance ${(selected.balance/100).toFixed(2)}</h3>
            <DepositForm account={selected} api={api} onUpdated={onAccountUpdated} />
            <WithdrawForm account={selected} api={api} onScheduled={fetchWithdrawals} />
          </div>

          <div className="card">
            <h3>Recent transactions</h3>
            {transactions.length === 0 && <div>No transactions</div>}
            <ul>
              {transactions.map(t => (
                <li key={t.id}>#{t.id} {t.type} {(t.amount/100).toFixed(2)} at {t.created_at}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div style={{marginTop:12}}>
        <button onClick={async ()=>{ await api.processWithdrawals(); refreshAll(); }}>Process withdrawals (manual)</button>
      </div>

      <WithdrawalsList items={withdrawals} />
    </div>
  )
}
