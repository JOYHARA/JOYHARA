

import { useState } from 'react'
import Shop from './Shop.jsx'
import Admin from './Admin.jsx'
import './App.css'

export default function App() {
  const [page, setPage] = useState('shop')

  return (
    <div className="app">
      <nav className="site-switch">
        <button onClick={() => setPage('shop')}>
          Boutique
        </button>

        <button onClick={() => setPage('admin')}>
          Administration
        </button>
      </nav>

      {page === 'shop' ? <Shop /> : <Admin />}
    </div>
  )
}
