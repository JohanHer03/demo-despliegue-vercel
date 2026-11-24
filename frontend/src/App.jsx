import { useEffect, useState } from 'react'

// Rutas RELATIVAS: en local las atiende el proxy de Vite, en Vercel los rewrites.
const API = '/api/tareas'

export default function App() {
  const [tareas, setTareas] = useState([])
  const [titulo, setTitulo] = useState('')
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  async function pedir(url, opciones) {
    const res = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      ...opciones,
    })
    if (!res.ok) throw new Error(`Error ${res.status}`)
    return res.status === 204 ? null : res.json()
  }

  async function cargar() {
    try {
      setError('')
      setTareas(await pedir(API))
    } catch {
      setError('No se pudo conectar con la API. Intenta de nuevo en unos segundos.')
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargar()
  }, [])

  async function agregar(e) {
    e.preventDefault()
    const texto = titulo.trim()
    if (!texto) return
    try {
      const nueva = await pedir(API, { method: 'POST', body: JSON.stringify({ titulo: texto }) })
      setTareas([...tareas, nueva])
      setTitulo('')
      setError('')
    } catch {
      setError('No se pudo agregar la tarea.')
    }
  }

  async function alternar(tarea) {
    try {
      const actualizada = await pedir(`${API}/${tarea.id}`, {
        method: 'PUT',
        body: JSON.stringify({ titulo: tarea.titulo, completada: !tarea.completada }),
      })
      setTareas(tareas.map((t) => (t.id === tarea.id ? actualizada : t)))
      setError('')
    } catch {
      setError('No se pudo actualizar la tarea.')
    }
  }

  async function borrar(id) {
    try {
      await pedir(`${API}/${id}`, { method: 'DELETE' })
      setTareas(tareas.filter((t) => t.id !== id))
      setError('')
    } catch {
      setError('No se pudo borrar la tarea.')
    }
  }

  return (
    <main className="contenedor">
      <h1>Mis tareas</h1>
      <p className="subtitulo">React → Spring Boot → Supabase · desplegado en Vercel</p>

      <form className="formulario" onSubmit={agregar}>
        <input
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder="¿Qué hay que hacer?"
          aria-label="Nueva tarea"
        />
        <button type="submit">Agregar</button>
      </form>

      {error && <p className="error">{error}</p>}

      {cargando ? (
        <p className="info">Cargando…</p>
      ) : tareas.length === 0 && !error ? (
        <p className="info">No hay tareas todavía.</p>
      ) : (
        <ul className="lista">
          {tareas.map((t) => (
            <li key={t.id}>
              <label className={t.completada ? 'hecha' : ''}>
                <input type="checkbox" checked={t.completada} onChange={() => alternar(t)} />
                {t.titulo}
              </label>
              <button className="borrar" onClick={() => borrar(t.id)}>
                Borrar
              </button>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
