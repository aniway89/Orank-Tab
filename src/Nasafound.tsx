import { useLocation, useNavigate } from 'react-router-dom'
import './App.css'

function Nasafound() {
  const location = useLocation()
  const navigate = useNavigate()
  const item = location.state?.item

  if (!item) {
    return (
      <div className="nasa-page">
        <button className="back-btn" onClick={() => navigate('/')}>
          <i className="bi bi-arrow-left"></i> Back
        </button>

        <div className="nasa-empty">
          <h1>NASA Found</h1>
          <p>No discovery was selected.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="nasa-page">
      <button className="back-btn" onClick={() => navigate('/')}>
        <i className="bi bi-arrow-left"></i> Back
      </button>

      <div className="nasa-detail">
        <div className="nasa-detail-header">
          <div className="nasa-label">NASA / ASTRONOMY PICTURE OF THE DAY</div>
          <h1>{item.title}</h1>
          <div className="nasa-date">{item.date}</div>
        </div>

        <img
          src={item.hdurl || item.url}
          alt={item.title}
          className="nasa-detail-img"
        />

        <div className="nasa-detail-content">
          <h2>About this discovery</h2>
          <p>{item.explanation}</p>

          <div className="nasa-meta">
            <div>
              <span>Published</span>
              <strong>{item.date}</strong>
            </div>

            <div>
              <span>Source</span>
              <strong>NASA APOD</strong>
            </div>
          </div>

          <a
            href={item.hdurl || item.url}
            target="_blank"
            rel="noreferrer"
            className="nasa-original"
          >
            View original image <i className="bi bi-arrow-up-right"></i>
          </a>
        </div>
      </div>
    </div>
  )
}

export default Nasafound