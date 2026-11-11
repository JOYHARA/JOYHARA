

import { useEffect, useState } from 'react';
import { supabase } from './supabase.js';

export default function Shop() {
  const [desserts, setDesserts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadDesserts() {
      const { data, error } = await supabase
        .from('desserts')
        .select('*')
        .eq('is_available', true)
        .order('created_at', { ascending: true });

      if (error) {
        setError(error.message);
      } else {
        setDesserts(data || []);
      }

      setLoading(false);
    }

    loadDesserts();
  }, []);

  if (loading) return <p>Chargement des desserts...</p>;

  if (error) return <p>Erreur : {error}</p>;

  return (
    <main style={{
      background: '#fffaf4',
      minHeight: '100vh',
      padding: '30px 16px',
      color: '#542b25'
    }}>
      <h1 style={{ textAlign: 'center', color: '#9d2929' }}>
        JOYHARA
      </h1>

      <h2 style={{ textAlign: 'center' }}>
        NOS DESSERTS
      </h2>

      {desserts.length === 0 ? (
        <p style={{ textAlign: 'center' }}>
          Aucun dessert disponible pour le moment.
        </p>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
          gap: '20px',
          maxWidth: '1000px',
          margin: '30px auto'
        }}>
          {desserts.map((dessert) => (
            <article key={dessert.id} style={{
              background: 'white',
              borderRadius: '15px',
              padding: '15px',
              boxShadow: '0 3px 15px #00000012'
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

              <h3>{dessert.name?.toUpperCase()}</h3>
              <p>{dessert.description}</p>
              <p>{dessert.composition}</p>
              <strong>{dessert.price} DH</strong>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
