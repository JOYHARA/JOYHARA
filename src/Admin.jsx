
import { useEffect, useState } from 'react'
import { supabase } from './supabase'

export default function Admin() {
  const [session, setSession] = useState(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [orders, setOrders] = useState([])
  const [desserts, setDesserts] = useState([])
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [authorized, setAuthorized] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
    })

    const { data } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession)
        setAuthorized(false)
      }
    )

    return () => data.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (session) checkAdmin()
  }, [session])

  async function login(e) {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    setLoading(false)

    if (error) setMessage(error.message)
  }

  async function checkAdmin() {
    setLoading(true)

    const { data, error } = await supabase.rpc('is_admin')

    if (error || !data) {
      setAuthorized(false)
      setMessage('Ce compte ne possède pas les droits administrateur.')
      setLoading(false)
      return
    }

    setAuthorized(true)
    await loadDashboard()
  }

  async function loadDashboard() {
    const [ordersResult, dessertsResult] = await Promise.all([
      supabase.from('orders').select('*').order('created_at', { ascending: false }),
      supabase.from('desserts').select('*').order('created_at')
    ])

    if (ordersResult.error) setMessage(ordersResult.error.message)
    else setOrders(ordersResult.data || [])

    if (dessertsResult.error) setMessage(dessertsResult.error.message)
    else setDesserts(dessertsResult.data || [])

    setLoading(false)
  }

  async function logout() {
    await supabase.auth.signOut()
    setOrders([])
    setDesserts([])
    setAuthorized(false)
  }

  async function updateStatus(id, status) {
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id)

    if (error) setMessage(error.message)
    else await loadDashboard()
  }

  async function updateDessert(id, field, value) {
    const { error } = await supabase
      .from('desserts')
      .update({ [field]: value })
      .eq('id', id)

    if (error) setMessage(error.message)
    else await loadDashboard()
  }

  if (!session) {
    return (
      <main className="admin-page">
        <div className="admin-login">
          <p className="tag">ESPACE PRIVÉ</p>
          <h1>JOYHARA ♥</h1>
          <h2>Administration</h2>

          <form onSubmit={login}>
            <label>Adresse e-mail</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Ton e-mail"
            />

            <label>Mot de passe</label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Ton mot de passe"
            />

            <button disabled={loading}>
              {loading ? 'Connexion...' : 'SE CONNECTER'}
            </button>
          </form>

          {message && <p className="admin-message">{message}</p>}
        </div>
      </main>
    )
  }

  if (loading) {
    return <main className="admin-page"><h2>Chargement...</h2></main>
  }

  if (!authorized) {
    return (
      <main className="admin-page">
        <h1>JOYHARA</h1>
        <p>{message}</p>
        <button onClick={logout}>Déconnexion</button>
      </main>
    )
  }

  return (
    <main className="admin-page">
      <header className="admin-header">
        <div>
          <p className="tag">ESPACE ADMINISTRATEUR</p>
          <h1>JOYHARA ♥</h1>
          <p>Ton tableau de bord</p>
        </div>
        <button onClick={logout}>Déconnexion</button>
      </header>

      {message && <p className="admin-message">{message}</p>}

      <section className="admin-stats">
        <article>
          <span>Commandes</span>
          <strong>{orders.length}</strong>
        </article>
        <article>
          <span>En attente</span>
          <strong>{orders.filter(o => o.status === 'pending').length}</strong>
        </article>
        <article>
          <span>Desserts</span>
          <strong>{desserts.length}</strong>
        </article>
      </section>

      <section className="admin-section">
        <div className="admin-title">
          <h2>Les commandes</h2>
          <button onClick={loadDashboard}>Actualiser</button>
        </div>

        {orders.length === 0 && <p>Aucune commande pour le moment.</p>}

        {orders.map(order => (
          <article className="admin-order" key={order.id}>
            <div>
              <strong>
                Commande n° {String(order.order_number ?? '—').padStart(2, '0')}
              </strong>
              <p>Client : {order.customer_name}</p>
              <p>Total : {order.total} DH</p>
              <p>
                {Array.isArray(order.items)
                  ? order.items.map(item => `${item.name} × ${item.quantity}`).join(', ')
                  : 'Détails indisponibles'}
              </p>
            </div>

            <select
              value={order.status || 'pending'}
              onChange={e => updateStatus(order.id, e.target.value)}
            >
              <option value="pending">En attente</option>
              <option value="preparing">En préparation</option>
              <option value="ready">Prête</option>
              <option value="completed">Récupérée</option>
            </select>
          </article>
        ))}
      </section>

      <section className="admin-section">
        <h2>Gestion des desserts</h2>

        {desserts.map(dessert => (
          <article className="admin-dessert" key={dessert.id}>
            <h3>{dessert.name}</h3>

            <label>Prix (DH)</label>
            <input
              type="number"
              min="0"
              step="0.5"
              defaultValue={dessert.price}
              onBlur={e => {
                const value = Number(e.target.value)
                if (value !== Number(dessert.price)) {
                  updateDessert(dessert.id, 'price', value)
                }
              }}
            />

            <label>Composition</label>
            <textarea
              defaultValue={dessert.composition || ''}
              onBlur={e => {
                if (e.target.value !== (dessert.composition || '')) {
                  updateDessert(dessert.id, 'composition', e.target.value)
                }
              }}
            />

            <label>Photo — lien de l'image</label>
            <input
              type="url"
              defaultValue={dessert.image_url || ''}
              placeholder="https://..."
              onBlur={e => {
                if (e.target.value !== (dessert.image_url || '')) {
                  updateDessert(dessert.id, 'image_url', e.target.value)
                }
              }}
            />

            <label>
              <input
                type="checkbox"
                checked={dessert.is_available !== false}
                onChange={e =>
                  updateDessert(dessert.id, 'is_available', e.target.checked)
                }
              />
              Disponible à la vente
            </label>
          </article>
        ))}
      </section>
    </main>
  )
}
