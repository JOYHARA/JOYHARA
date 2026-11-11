

import { useEffect, useState } from 'react'
import { supabase } from './supabase.js'

export default function Shop() {
  const [desserts, setDesserts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadDesserts() {
      setLoading(true)
      setError('')

      const { data, error } = await supabase
        .from('desserts')
        .select('*')
        .eq('available', true)

      if (error) {
        console.error('Erreur Supabase:', error)
        setError(error.message)
      } else {
        setDesserts(data || [])
      }

      setLoading(false)
    }

    loadDesserts()
  }, [])

  return (
    <main style={{
      maxWidth: '1100px',
      margin: 'auto',
      padding: '30px 18px',
      color: '#49352d',
      fontFamily: 'Georgia, serif'
    }}>
      <h1 style={{ textAlign: 'center' }}>JOYHARA</h1>
      <p style={{ textAlign: 'center' }}>
        La douceur à chaque bouchée
      </p>

      <h2 style={{ textAlign: 'center', marginTop: '45px' }}>
        Nos créations
      </h2>

      {loading && <p style={{ textAlign: 'center' }}>Chargement...</p>}

      {error && (
        <p style={{ color: 'red', textAlign: 'center' }}>
          Erreur : {error}
        </p>
      )}

      {!loading && !error && desserts.length === 0 && (
        <p style={{ textAlign: 'center' }}>
          Aucun dessert disponible pour le moment.
        </p>
      )}

      <section style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '22px',
        marginTop: '30px'
      }}>
        {desserts.map((dessert) => (
          <article key={dessert.id} style={{
            border: '1px solid #eadbc9',
            borderRadius: '14px',
            padding: '18px',
            background: '#fffaf4'
          }}>
            {dessert.image_url && (
              <img
                src={dessert.image_url}
                alt={dessert.name}
                style={{
                  width: '100%',
                  height: '190px',
                  objectFit: 'cover',
                  borderRadius: '10px'
                }}
              />
            )}

            <h3>{dessert.name}</h3>
            <p>{dessert.description}</p>
            <p>{dessert.composition}</p>
            <strong>
              {dessert.price != null ? `${dessert.price} DH` : ''}
            </strong>
          </article>
        ))}
      </section>
    </main>
  )
}
