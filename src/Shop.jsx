
import { useEffect, useState } from 'react';
import { supabase } from './supabase.js';

export default function Shop() {
  const [desserts, setDesserts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [customerName, setCustomerName] = useState('');
  const [showCheckout, setShowCheckout] = useState(false);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');
  const [orderNumber, setOrderNumber] = useState('');

  useEffect(() => {
    async function loadDesserts() {
      const { data, error } = await supabase
        .from('desserts')
        .select('*');

      if (error) {
        setMessage('Erreur : ' + error.message);
      } else {
        setDesserts(data || []);
      }

      setLoading(false);
    }

    loadDesserts();
  }, []);

  function addToCart(dessert) {
    setCart(previous => {
      const found = previous.find(item => item.id === dessert.id);

      if (found) {
        return previous.map(item =>
          item.id === dessert.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...previous, { ...dessert, quantity: 1 }];
    });
  }

  function changeQuantity(id, amount) {
    setCart(previous =>
      previous
        .map(item =>
          item.id === id
            ? { ...item, quantity: item.quantity + amount }
            : item
        )
        .filter(item => item.quantity > 0)
    );
  }

  const total = cart.reduce(
    (sum, item) => sum + Number(item.price || 0) * item.quantity,
    0
  );

  const itemCount = cart.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  async function placeOrder() {
    if (!customerName.trim()) {
      setMessage('Veuillez saisir votre nom.');
      return;
    }

    if (cart.length === 0) {
      setMessage('Votre panier est vide.');
      return;
    }

    setSending(true);
    setMessage('');

    const number = String(Math.floor(Math.random() * 90) + 10);

    const orderItems = cart.map(item => ({
      id: item.id,
      name: item.name,
      price: Number(item.price),
      quantity: item.quantity
    }));

    const { error } = await supabase
      .from('orders')
      .insert([{
        order_number: number,
        customer_name: customerName.trim(),
        total: total,
        items: orderItems,
        status: 'pending'
      }]);

    setSending(false);

    if (error) {
      setMessage('Erreur de commande : ' + error.message);
      return;
    }

    setOrderNumber(number);
    setCart([]);
    setCustomerName('');
    setShowCheckout(false);
  }

  if (loading) {
    return <p style={{ textAlign: 'center', padding: 50 }}>Chargement...</p>;
  }

  return (
    <div style={{
      background: '#fffaf4',
      minHeight: '100vh',
      padding: '25px 15px 120px',
      color: '#542b25',
      fontFamily: 'Arial, sans-serif'
    }}>

      <header style={{ textAlign: 'center', marginBottom: 35 }}>
        <h1 style={{
          color: '#9d2929',
          fontSize: 38,
          letterSpacing: 4
        }}>JOYHARA</h1>

        <p>Une douceur, une émotion.</p>

        <h2>NOS DESSERTS</h2>
      </header>

      {message && (
        <p style={{
          textAlign: 'center',
          color: '#9d2929',
          fontWeight: 'bold'
        }}>{message}</p>
      )}

      {orderNumber && (
        <div style={{
          background: '#f3e5d5',
          padding: 25,
          borderRadius: 15,
          textAlign: 'center',
          margin: '20px auto',
          maxWidth: 400
        }}>
          <h2>Commande confirmée !</h2>
          <p>Votre numéro de commande :</p>
          <strong style={{ fontSize: 35, color: '#9d2929' }}>
            {orderNumber}
          </strong>
          <p>Merci d'avoir choisi JOYHARA !</p>
          <button onClick={() => setOrderNumber('')}>
            Continuer
          </button>
        </div>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
        gap: 20,
        maxWidth: 1000,
        margin: 'auto'
      }}>
        {desserts.map(dessert => (
          <article key={dessert.id} style={{
            background: 'white',
            borderRadius: 16,
            padding: 15,
            boxShadow: '0 3px 15px #00000012'
          }}>
            {dessert.image_url && (
              <img
                src={dessert.image_url}
                alt={dessert.name}
                style={{
                  width: '100%',
                  height: 190,
                  objectFit: 'cover',
                  borderRadius: 12
                }}
              />
            )}

            <h3>{dessert.name?.toUpperCase()}</h3>
            <p>{dessert.description}</p>
            <p>{dessert.composition}</p>

            <strong style={{ color: '#9d2929', fontSize: 19 }}>
              {dessert.price} DH
            </strong>

            <button
              onClick={() => addToCart(dessert)}
              style={{
                display: 'block',
                width: '100%',
                marginTop: 15,
                padding: 13,
                background: '#9d2929',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                cursor: 'pointer'
              }}
            >
              + Ajouter au panier
            </button>
          </article>
        ))}
      </div>

      {cart.length > 0 && (
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: '#542b25',
          color: 'white',
          padding: 15,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 10,
          zIndex: 10
        }}>
          <div>
            <strong>Mon panier ({itemCount})</strong>
            <p style={{ margin: '5px 0' }}>{total.toFixed(2)} DH</p>
          </div>

          <button
            onClick={() => setShowCheckout(true)}
            style={{
              background: '#e8c99c',
              color: '#542b25',
              padding: '13px 20px',
              border: 'none',
              borderRadius: 8,
              fontWeight: 'bold'
            }}
          >
            Commander
          </button>
        </div>
      )}

      {showCheckout && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: '#0009',
          zIndex: 20,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 15
        }}>
          <div style={{
            background: '#fffaf4',
            padding: 25,
            borderRadius: 15,
            width: '100%',
            maxWidth: 430,
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <h2 style={{ color: '#9d2929' }}>Votre commande</h2>

            {cart.map(item => (
              <div key={item.id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 8,
                margin: '15px 0'
              }}>
                <span>{item.name}</span>

                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={() => changeQuantity(item.id, -1)}>
                    -
                  </button>
                  <strong>{item.quantity}</strong>
                  <button onClick={() => changeQuantity(item.id, 1)}>
                    +
                  </button>
                </div>
              </div>
            ))}

            <h3>Total : {total.toFixed(2)} DH</h3>

            <label>Votre nom</label>
            <input
              value={customerName}
              onChange={e => setCustomerName(e.target.value)}
              placeholder="Entrez votre nom"
              style={{
                display: 'block',
                width: '100%',
                padding: 12,
                margin: '10px 0 20px',
                boxSizing: 'border-box',
                border: '1px solid #d5bda9',
                borderRadius: 8
              }}
            />

            <button
              onClick={placeOrder}
              disabled={sending}
              style={{
                width: '100%',
                padding: 14,
                background: '#9d2929',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                fontWeight: 'bold'
              }}
            >
              {sending ? 'Envoi...' : 'Confirmer ma commande'}
            </button>

            <button
              onClick={() => setShowCheckout(false)}
              style={{
                width: '100%',
                padding: 12,
                marginTop: 10,
                background: '#eee0d2',
                border: 'none',
                borderRadius: 8
              }}
            >
              Retour à la boutique
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
