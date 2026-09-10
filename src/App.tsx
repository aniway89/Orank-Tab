import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './App.css'

const API_KEY = import.meta.env.VITE_NASA_API_KEY

type Todo = {
  id: number
  text: string
  completed: boolean
}

type Shortcut = {
  id: number
  name: string
  url: string
}

type NasaItem = {
  date: string
  url: string
  title: string
  explanation: string
  media_type: string
  hdurl?: string
}

const truncate = (text: string, limit: number): string => {
  if (!text) return ''
  return text.length > limit
    ? text.slice(0, limit - 3) + '...'
    : text
}

const defaultShortcuts: Shortcut[] = [
  { id: 1, name: 'Google', url: 'https://www.google.com' },
  { id: 2, name: 'GitHub', url: 'https://github.com' },
  { id: 3, name: 'Stardance', url: 'https://stardance.hackclub.com' },
  { id: 4, name: 'ChatGPT', url: 'https://chatgpt.com' },
  { id: 5, name: 'Claude', url: 'https://claude.ai' },
  { id: 6, name: 'YouTube', url: 'https://youtube.com' },
  { id: 7, name: 'LeetCode', url: 'https://leetcode.com' },
  { id: 8, name: 'Discord', url: 'https://discord.com' }
]

function App() {
  const navigate = useNavigate()

  const [time, setTime] = useState<Date>(new Date())
  const [search, setSearch] = useState<string>('')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [news, setNews] = useState<NasaItem[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<boolean>(false)

  const [todos, setTodos] = useState<Todo[]>(() => {
    try {
      const savedTodos = localStorage.getItem('todos')
      return savedTodos ? JSON.parse(savedTodos) : []
    } catch {
      return []
    }
  })

  const [shortcuts, setShortcuts] = useState<Shortcut[]>(() => {
    try {
      const savedShortcuts = localStorage.getItem('shortcuts')
      return savedShortcuts
        ? JSON.parse(savedShortcuts)
        : defaultShortcuts
    } catch {
      return defaultShortcuts
    }
  })

  const [todoInput, setTodoInput] = useState<string>('')
  const [shortcutInput, setShortcutInput] = useState<string>('')
  const [showShortcutInput, setShowShortcutInput] =
    useState<boolean>(false)
  const [editingShortcuts, setEditingShortcuts] =
    useState<boolean>(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos))
  }, [todos])

  useEffect(() => {
    localStorage.setItem('shortcuts', JSON.stringify(shortcuts))
  }, [shortcuts])

  useEffect(() => {
    const fetchNews = async (): Promise<void> => {
      try {
        const today = new Date()
        const end = today.toISOString().split('T')[0]

        const startDate = new Date(today)
        startDate.setDate(today.getDate() - 7)

        const start = startDate.toISOString().split('T')[0]

        const response = await fetch(
          `https://api.nasa.gov/planetary/apod?api_key=${API_KEY}&start_date=${start}&end_date=${end}`
        )

        if (!response.ok) {
          throw new Error('NASA API error')
        }

        const data: NasaItem[] = await response.json()

        const filtered = data
          .filter((item: NasaItem) => item.media_type === 'image')
          .sort(
            (a: NasaItem, b: NasaItem) =>
              new Date(b.date).getTime() -
              new Date(a.date).getTime()
          )
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

  const formatDate = (): string => {
    return time.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short'
    })
  }

  const formatTime = (): string => {
    return time.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const handleSearch = (
    e: React.FormEvent<HTMLFormElement>
  ): void => {
    e.preventDefault()

    if (!search.trim()) return

    window.open(
      `https://www.google.com/search?q=${encodeURIComponent(
        search.trim()
      )}`,
      '_blank'
    )

    setSearch('')
    setSuggestions([])
  }

  const handleSearchChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ): Promise<void> => {
    const value = e.target.value
    setSearch(value)

    if (!value.trim()) {
      setSuggestions([])
      return
    }

    try {
      const response = await fetch(
        `https://suggestqueries.google.com/complete/search?client=firefox&q=${encodeURIComponent(
          value
        )}`
      )

      const data: [string, string[]] = await response.json()
      setSuggestions(data[1].slice(0, 6))
    } catch {
      setSuggestions([])
    }
  }

  const selectSuggestion = (suggestion: string): void => {
    setSearch(suggestion)
    setSuggestions([])
  }

  const addTodo = (
    e: React.FormEvent<HTMLFormElement>
  ): void => {
    e.preventDefault()

    if (!todoInput.trim()) return

    setTodos((prev: Todo[]) => [
      ...prev,
      {
        id: Date.now(),
        text: todoInput.trim(),
        completed: false
      }
    ])

    setTodoInput('')
  }

  const toggleTodo = (id: number): void => {
    setTodos((prev: Todo[]) =>
      prev.map((todo: Todo) =>
        todo.id === id
          ? { ...todo, completed: !todo.completed }
          : todo
      )
    )
  }

  const deleteTodo = (id: number): void => {
    setTodos((prev: Todo[]) =>
      prev.filter((todo: Todo) => todo.id !== id)
    )
  }

  const addShortcut = (
    e: React.FormEvent<HTMLFormElement>
  ): void => {
    e.preventDefault()

    if (!shortcutInput.trim()) return

    let url = shortcutInput.trim()

    if (!url.startsWith('http')) {
      url = `https://${url}`
    }

    try {
      const parsed = new URL(url)

      setShortcuts((prev: Shortcut[]) => [
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

  const deleteShortcut = (id: number): void => {
    setShortcuts((prev: Shortcut[]) =>
      prev.filter((shortcut: Shortcut) => shortcut.id !== id)
    )
  }

  const getFavicon = (url: string): string => {
    return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(
      url
    )}&sz=128`
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

        <form
          className="Searchbar flex ac"
          onSubmit={handleSearch}
        >
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
              {suggestions.map(
                (suggestion: string, index: number) => (
                  <div
                    className="suggestion"
                    key={index}
                    onMouseDown={() =>
                      selectSuggestion(suggestion)
                    }
                  >
                    <i className="bi bi-search"></i>
                    {suggestion}
                  </div>
                )
              )}
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

            {!loading &&
              !error &&
              news.map((item: NasaItem) => (
                <div
                  className="Nasa-news-card flex-col as"
                  key={item.date}
                >
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

                  <div
                    className="read-more"
                    onClick={() =>
                      navigate('/nasafound', {
                        state: { item }
                      })
                    }
                  >
                    Read more{' '}
                    <i className="bi bi-arrow-up-right"></i>
                  </div>
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
                onClick={() =>
                  setEditingShortcuts(!editingShortcuts)
                }
              >
                <i className="bi bi-pen"></i>
              </div>

              <div
                className="Add btn flex ac"
                onClick={() =>
                  setShowShortcutInput(!showShortcutInput)
                }
              >
                <i className="bi bi-plus-lg"></i>
              </div>
            </div>
          </div>

          {showShortcutInput && (
            <form
              className="shortcut-form"
              onSubmit={addShortcut}
            >
              <input
                type="text"
                placeholder="example.com"
                value={shortcutInput}
                onChange={(
                  e: React.ChangeEvent<HTMLInputElement>
                ) => setShortcutInput(e.target.value)}
                autoFocus
              />
            </form>
          )}

          <div className="shortcut-container flex warp">
            {shortcuts.map((shortcut: Shortcut) => (
              <div
                className="shortcut-wrapper"
                key={shortcut.id}
              >
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
                    onClick={() =>
                      deleteShortcut(shortcut.id)
                    }
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

          <form
            className="add-todo flex ac border-dd"
            onSubmit={addTodo}
          >
            <i className="bi bi-plus-lg"></i>

            <input
              type="text"
              className="Add-todo"
              placeholder="New task"
              value={todoInput}
              onChange={(
                e: React.ChangeEvent<HTMLInputElement>
              ) => setTodoInput(e.target.value)}
            />
          </form>

          <div className="todo-items">
            {todos.map((todo: Todo) => (
              <div
                className="todo-list flex ac cb"
                key={todo.id}
              >
                <input
                  type="checkbox"
                  className="checkbox"
                  checked={todo.completed}
                  onChange={() => toggleTodo(todo.id)}
                />

                <div
                  className={`taskti ${
                    todo.completed ? 'completed' : ''
                  }`}
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