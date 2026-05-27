import { HashRouter } from 'react-router-dom'
import { Navigation } from './components/Navigation/Navigation.jsx'
import Router from './router/Router.jsx'
import './App.css'

function App() {
  return (
    <HashRouter>
      <div className="app-shell">
        <Navigation />
        <main className="app-main">
          <Router />
        </main>
      </div>
    </HashRouter>
  )
}

export default App
