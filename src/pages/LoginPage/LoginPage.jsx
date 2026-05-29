import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google'
import { useAuthStore } from '../../store/useAuthStore.js'
import './LoginPage.css'

export function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const navigate = useNavigate()
  const location = useLocation()
  const signInWithGoogle = useAuthStore((state) => state.signInWithGoogle)
  const setReturnPath = useAuthStore((state) => state.setReturnPath)
  const returnPath = useAuthStore((state) => state.returnPath)

  const handleGoogleSuccess = async (credentialResponse) => {
    const credential = credentialResponse?.credential

    if (!credential) {
      setErrorMessage('No se recibió la credencial de Google.')
      return
    }

    setLoading(true)
    setErrorMessage('')

    try {
      await signInWithGoogle(credential)
      
      // Redirigir a la página anterior o al home
      const redirectTo = returnPath || location.state?.from?.pathname || '/'
      setReturnPath(null) // Limpiar el returnPath después de usarlo
      navigate(redirectTo, { replace: true })
    } catch (error) {
      setErrorMessage(error.message || 'No se pudo iniciar sesión con Google.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="auth-layout">
      <div className="auth-card">
        <div className="auth-form">
          <div className="auth-form-header">
            <h2>Bienvenido</h2>

            <p>
              Inicia sesión con Google para continuar explorando nuestro catálogo hecho a mano.
            </p>
          </div>

          <div className="button-google">
            <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => setErrorMessage('Google no pudo completar el inicio de sesión.')} theme="outline" size="large" shape="pill" width={320} />
          </div>

          {loading ? <p className="auth-feedback">Conectando con Google...</p> : null}
          {errorMessage ? <p className="auth-feedback auth-feedback--error">{errorMessage}</p> : null}

          <p className="terms">
            Al continuar aceptas nuestros términos y condiciones.
          </p>
        </div>

        <div className="auth-visual">
          <div className="brand-badge">
            <span>Bolsos CAP</span>
          </div>

          <div className="visual-copy">
            <p className="eyebrow">Hecho a mano • Crochet artesanal</p>

            <p className="visual-description"> <br></br>
              Descubre piezas únicas hechas cuidadosamente
              para acompañarte todos los días.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
