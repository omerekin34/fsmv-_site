import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { LogIn } from 'lucide-react'
import { supabase } from '../../lib/supabase.js'
import { useSession } from '../useSession.js'
import '../../styles/admin.css'

export default function Giris() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)
  const navigate = useNavigate()
  const { session, loading } = useSession()

  if (!loading && session) return <Navigate to="/yonetim" replace />

  const submit = async e => {
    e.preventDefault()
    setError('')
    setSending(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setSending(false)
    if (error) return setError('Giriş başarısız: e-posta veya şifre hatalı.')
    navigate('/yonetim')
  }

  return (
    <div className="adm-login">
      <form className="adm-login-card adm-glass" onSubmit={submit}>
        <span className="adm-brand-title">FSMVÜ Hukuk</span>
        <h1>Yönetim Girişi</h1>
        <p className="adm-login-hint">Devam etmek için yönetici hesabınızla giriş yapın.</p>
        <label className="adm-field">
          <span>E-posta</span>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required autoFocus />
        </label>
        <label className="adm-field">
          <span>Şifre</span>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        </label>
        {error && <p className="adm-error">{error}</p>}
        <button className="adm-btn adm-btn-gold" type="submit" disabled={sending}>
          <LogIn size={17} />
          <span>{sending ? 'Giriş yapılıyor…' : 'Giriş Yap'}</span>
        </button>
      </form>
    </div>
  )
}
