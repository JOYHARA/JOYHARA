

import { useEffect, useState } from 'react'
import { supabase } from './supabase.js'

export default function Shop() {
  const [desserts, setDesserts] = useState([])
  const [cart, setCart] = useState([])
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [orderNumber, setOrderNumber] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadDesserts() {
      if (!supabase) {
        setMessage('Connexion Supabase non configurée.')
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('desserts')
        .select('*')
        .eq('is_available', true)
        .order('created_at')

      if (error) {
        setMessage(error.message)
      } else {
        setDesserts(data || [])
      }

      setLoading(false)
    }

    loadDesserts()
  }, [])

  function add(item) {
    setCart(old => {
      const found = old.find(x => x.id === item.id)

      return found
        ? old.map(x =>
            x.id === item.id
              ? { ...x, quantity: x.quantity + 1 }
              : x
          )
        : [...old, { ...item, quantity: 1 }]
    })
  }

  function quantity(id, change) {
    setCart(old =>
      old
        .map(x =>
          x.id === id
            ? { ...x, quantity: x.quantity + change }
            : x
        )
        .filter(x => x.quantity > 0)
    )
  }

  const total = cart.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0
  )

  async function order(e) {
    e.preventDefault()
    setMessage('')
    setOrderNumber('')

    if (!name.trim() || !cart.length) {
      setMessage('Ajoutez un dessert et saisissez votre nom.')
      return
    }

    if (cart.some(item => Number(item.price) <= 0)) {
      setMessage('Les prix ne sont pas encore définis.')
      return
    }

    const items = cart.map(item => ({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      unit_price: Number(item.price)
    }))

    const { data, error } = await supabase.rpc('place_order', {
      p_items: items,
      p_total: total,
      p_customer_name: name.trim()
    })

    if (error) {
      setMessage(error.message)
      return
    }

    setOrderNumber(String(data).padStart(2, '0'))
    setCart([])
    setName('')
  }

  return (
    <main className="shop-page">
      <header className="shop-header">
        <p>MAISON DE DOUCEURS</p>
        <h1>JOYHARA ♥</h1>
        <p>La gourmandise a son adresse.</p>
      </header>

      <section className="collection">
        <h2>Nos créations</h2>

        {loading && <p>Chargement...</p>}

        {!loading && desserts.length === 0 && (
          <p>Aucun dessert disponible pour le moment.</p>
        )}

        <div className="product-grid">
          {desserts.map(item => (
            <article className="product-card" key={item.id}>
              {item.image_url && (
                <img src={item.image_url} alt={item.name} />
              )}

              <div className="product-info">
                <h3>{item.name}</h3>
                <p>{item.description}</p>
                <p>{item.composition}</p>

                <strong>
                  {Number(item.price) > 0
                    ? `${item.price} DH`
                    : 'Prix à définir'}
                </strong>

                <button
                  onClick={() => add(item)}
                  disabled={Number(item.price) <= 0}
                >
                  Ajouter +
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="collection">
        <h2>Mon panier</h2>

        {cart.map(item => (
          <div className="cart-item" key={item.id}>
            <span>{item.name}</span>
            <button onClick={() => quantity(item.id, -1)}>−</button>
            <span>{item.quantity}</span>
            <button onClick={() => quantity(item.id, 1)}>+</button>
          </div>
        ))}

        <h3>Total : {total.toFixed(2)} DH</h3>

        <form onSubmit={order} className="order-form">
          <label>Votre nom</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Votre nom"
            required
          />

          <button type="submit" disabled={!cart.length}>
            Confirmer ma commande
          </button>
        </form>

        {message && <p>{message}</p>}

        {orderNumber && (
          <div className="order-success">
            <h2>Commande confirmée !</h2>
            <strong>{orderNumber}</strong>
            <p>Présentez ce numéro au stand JOYHARA.</p>
          </div>
        )}
      </section>

      <footer>
        <h2>JOYHARA ♥</h2>
        <p>Une touche de gourmandise dans chaque création.</p>
      </footer>
    </main>
  )
}
