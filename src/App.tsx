import { useEffect, useState } from 'react'
import './App.css';
import SS from './assets/hero.png'
import favicon from './assets/react.svg'

const API_KEY = import.meta.env.VITE_NASA_API_KEY

const truncate = (text, limit) => {
  if (!text) return ''
  return text.length > limit ? text.slice(0, limit - 3) + '...' : text
}

function App() {
  const [time, setTime] = useState(new Date())
  const [search, setSearch] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const [todos, setTodos] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('todos')) || []
    } catch {
      return []
    }
  })

  const [shortcuts, setShortcuts] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('shortcuts')) || []
    } catch {
      return []
    }
  })

  const [todoInput, setTodoInput] = useState('')
  const [shortcutInput, setShortcutInput] = useState('')
  const [showShortcutInput, setShowShortcutInput] = useState(false)
  const [editingShortcuts, setEditingShortcuts] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos))
  }, [todos])

  useEffect(() => {
    localStorage.setItem('shortcuts', JSON.stringify(shortcuts))
  }, [shortcuts])

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const today = new Date()
        const end = today.toISOString().split('T')[0]
        const startDate = new Date(today)
        startDate.setDate(today.getDate() - 7)
        const start = startDate.toISOString().split('T')[0]

        const response = await fetch(
          `https://api.nasa.gov/planetary/apod?api_key=${API_KEY}&start_date=${start}&end_date=${end}`
        )

        if (!response.ok) throw new Error('NASA API error')

        const data = await response.json()
        const filtered = data
          .filter(item => item.media_type === 'image')
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 2)

        setNews(filtered)
      } catch {
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    fetchNews()
  }, [])

  const formatDate = () => {
    return time.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short'
    })
  }

  const formatTime = () => {
    return time.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const handleSearch = (e) => {
    e.preventDefault()

    if (!search.trim()) return

    window.open(
      `https://www.google.com/search?q=${encodeURIComponent(search.trim())}`,
      '_blank'
    )

    setSearch('')
    setSuggestions([])
  }

  const handleSearchChange = async (e) => {
    const value = e.target.value
    setSearch(value)

    if (!value.trim()) {
      setSuggestions([])
      return
    }

    try {
      const response = await fetch(
        `https://suggestqueries.google.com/complete/search?client=firefox&q=${encodeURIComponent(value)}`
      )

      const data = await response.json()
      setSuggestions(data[1].slice(0, 6))
    } catch {
      setSuggestions([])
    }
  }

  const selectSuggestion = (suggestion) => {
    setSearch(suggestion)
    setSuggestions([])
  }

  const addTodo = (e) => {
    e.preventDefault()

    if (!todoInput.trim()) return

    setTodos(prev => [
      ...prev,
      {
        id: Date.now(),
        text: todoInput.trim(),
        completed: false
      }
    ])

    setTodoInput('')
  }

  const toggleTodo = (id) => {
    setTodos(prev =>
      prev.map(todo =>
        todo.id === id
          ? { ...todo, completed: !todo.completed }
          : todo
      )
    )
  }

  const deleteTodo = (id) => {
    setTodos(prev => prev.filter(todo => todo.id !== id))
  }

  const addShortcut = (e) => {
    e.preventDefault()

    if (!shortcutInput.trim()) return

    let url = shortcutInput.trim()

    if (!url.startsWith('http')) {
      url = `https://${url}`
    }

    try {
      const parsed = new URL(url)

      setShortcuts(prev => [
        ...prev,
        {
          id: Date.now(),
          name: parsed.hostname.replace('www.', ''),
          url: parsed.href
        }
      ])

      setShortcutInput('')
      setShowShortcutInput(false)
    } catch {
      return
    }
  }

  const deleteShortcut = (id) => {
    setShortcuts(prev => prev.filter(shortcut => shortcut.id !== id))
  }

  const getFavicon = (url) => {
    return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(url)}&sz=128`
  }

  return (
    <div className="container flex">
      <div className="browser-contaier flex-col ac">
        <div className="time-and-date flex-col as">
          <div className="date">{formatDate()}</div>
          <div className="Time flex ac">
            {formatTime()}
          </div>
        </div>

        <form className="Searchbar flex ac" onSubmit={handleSearch}>
          <div className="icon">
            <i className="bi bi-search"></i>
          </div>

          <input
            type="search"
            placeholder="Search"
            className="Searchabr"
            value={search}
            onChange={handleSearchChange}
          />

          {suggestions.length > 0 && (
            <div className="suggestions">
              {suggestions.map((suggestion, index) => (
                <div
                  className="suggestion"
                  key={index}
                  onMouseDown={() => selectSuggestion(suggestion)}
                >
                  <i className="bi bi-search"></i>
                  {suggestion}
                </div>
              ))}
            </div>
          )}
        </form>

        <div className="news flex-col as">
          <h2 className="title">
            Today's NASA Founds
          </h2>

          <div className="flex as w-100">
            {loading && (
              <div className="news-loading">
                Loading NASA discoveries...
              </div>
            )}

            {error && (
              <div className="news-loading">
                NASA discoveries are unavailable right now.
              </div>
            )}

            {!loading && !error && news.map((item, index) => (
              <div className="Nasa-news-card flex-col as" key={item.date}>
                <img
                  src={item.url}
                  alt={item.title}
                  className="nasa-news-img"
                />

                <div className="news-title">
                  {truncate(item.title, 80)}
                </div>

                <div className="news-context">
                  {truncate(item.explanation, 200)}
                </div>

                <a
                  href={item.hdurl || item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="read-more"
                >
                  Read more <i className="bi bi-arrow-up-right"></i>
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="functionable-bar flex-col ac">
        <div className="shortcuttab">
          <div className="flex ac bb js">
            Shortcut

            <div className="flex ac g-10">
              <div
                className="EDIT btn flex ac"
                onClick={() => setEditingShortcuts(!editingShortcuts)}
              >
                <i className="bi bi-pen"></i>
              </div>

              <div
                className="Add btn flex ac"
                onClick={() => setShowShortcutInput(!showShortcutInput)}
              >
                <i className="bi bi-plus-lg"></i>
              </div>
            </div>
          </div>

          {showShortcutInput && (
            <form className="shortcut-form" onSubmit={addShortcut}>
              <input
                type="text"
                placeholder="example.com"
                value={shortcutInput}
                onChange={(e) => setShortcutInput(e.target.value)}
                autoFocus
              />
            </form>
          )}

          <div className="shortcut-container flex warp">
            {shortcuts.map(shortcut => (
              <div className="shortcut-wrapper" key={shortcut.id}>
                <a
                  href={shortcut.url}
                  target="_blank"
                  rel="noreferrer"
                  className="shortcut"
                  title={shortcut.name}
                >
                  <img
                    src={getFavicon(shortcut.url)}
                    alt={shortcut.name}
                    className="shortcut-img"
                  />
                </a>

                {editingShortcuts && (
                  <div
                    className="shortcut-delete"
                    onClick={() => deleteShortcut(shortcut.id)}
                  >
                    <i className="bi bi-x"></i>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="to-do-contaier">
          <div className="flex ac bb pb-10">
            Todo list
          </div>

          <form className="add-todo flex ac border-dd" onSubmit={addTodo}>
            <i className="bi bi-plus-lg"></i>

            <input
              type="text"
              className="Add-todo"
              placeholder="New task"
              value={todoInput}
              onChange={(e) => setTodoInput(e.target.value)}
            />
          </form>

          <div className="todo-items">
            {todos.map(todo => (
              <div className="todo-list flex ac cb" key={todo.id}>
                <input
                  type="checkbox"
                  className="checkbox"
                  checked={todo.completed}
                  onChange={() => toggleTodo(todo.id)}
                />

                <div
                  className={`taskti ${todo.completed ? 'completed' : ''}`}
                  onClick={() => toggleTodo(todo.id)}
                >
                  {todo.text}
                </div>

                <div
                  className="delete"
                  onClick={() => deleteTodo(todo.id)}
                >
                  <i className="bi bi-x"></i>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App