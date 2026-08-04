import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';

export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      const isSetupDone = localStorage.getItem('setup_completed') === 'true' || !!localStorage.getItem('org_name');
      if (isSetupDone) {
        navigate('/dashboard', { replace: true });
      } else {
        navigate('/setup', { replace: true });
      }
    }
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const res = await fetch('http://localhost:8000/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.detail || 'Login failed');
      }
      
      const prevUser = localStorage.getItem('user_email');
      const newUser = data.user?.email || email;
      if (prevUser && prevUser.toLowerCase() !== newUser.toLowerCase()) {
        localStorage.removeItem('ti_saved_sessions');
        localStorage.removeItem('ti_active_messages');
        localStorage.removeItem('ti_active_session_id');
      }

      localStorage.setItem('auth_token', data.access_token);
      if (data.user?.name) localStorage.setItem('user_name', data.user.name);
      if (data.user?.email) localStorage.setItem('user_email', data.user.email);

      const isSetupDone = localStorage.getItem('setup_completed') === 'true' || !!localStorage.getItem('org_name');
      if (isSetupDone) {
        navigate('/dashboard');
      } else {
        navigate('/setup');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ height: '100vh', display: 'flex', backgroundColor: '#ffffff', position: 'relative', zIndex: 1, fontFamily: 'Inter, sans-serif' }}>
      
      {/* Left side: Premium Branding with subtle animated gradient and grain */}
      <div style={{ 
        flex: 1, 
        position: 'relative', 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center', 
        padding: '4rem', 
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #f0f7ff 0%, #ffffff 50%, #fef3f2 100%)' 
      }}>
        {/* Decorative background elements */}
        <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '50%', height: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.1) 0%, rgba(255,255,255,0) 70%)', filter: 'blur(40px)', borderRadius: '50%' }}></div>
        <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '50%', height: '50%', background: 'radial-gradient(circle, rgba(239,68,68,0.1) 0%, rgba(255,255,255,0) 70%)', filter: 'blur(40px)', borderRadius: '50%' }}></div>

        <div style={{ position: 'relative', zIndex: 10, maxWidth: '500px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 800, fontSize: '1.5rem', marginBottom: '2rem', color: '#0f172a' }}>
            <Sparkles color="var(--accent)" size={32} />
            Transformation Intelligence
          </div>
          <h1 style={{ fontSize: '3.5rem', fontWeight: 900, lineHeight: 1.1, letterSpacing: '-0.03em', color: '#111827', marginBottom: '1.5rem' }}>
            Turn strategy into reality.
          </h1>
          <p style={{ fontSize: '1.25rem', color: '#4b5563', lineHeight: 1.6 }}>
            The enterprise transformation engine that maps value chains, highlights AI opportunities, and governs execution—all in one place.
          </p>
        </div>
      </div>

      {/* Right side: Sleek Form */}
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        padding: '2rem',
        backgroundColor: '#ffffff'
      }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>
          <div style={{ marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#111827', letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>Welcome back</h2>
            <p style={{ color: '#6b7280', fontSize: '1rem' }}>Enter your details to access your dashboard.</p>
          </div>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: '#374151' }}>Email address</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ 
                  width: '100%', padding: '0.875rem 1rem', borderRadius: '0.5rem', border: '1px solid #d1d5db', 
                  backgroundColor: '#ffffff', color: '#111827', outline: 'none', fontSize: '1rem',
                  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', transition: 'border-color 0.2s ease'
                }} 
                placeholder="name@company.com" 
                onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
              />
            </div>
            
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.5rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>Password</label>
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--accent)', cursor: 'pointer' }}>Forgot password?</span>
              </div>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ 
                  width: '100%', padding: '0.875rem 1rem', borderRadius: '0.5rem', border: '1px solid #d1d5db', 
                  backgroundColor: '#ffffff', color: '#111827', outline: 'none', fontSize: '1rem',
                  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', transition: 'border-color 0.2s ease'
                }} 
                placeholder="••••••••" 
                onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
              />
            </div>

            <button 
              type="submit" 
              style={{ 
                width: '100%', padding: '0.875rem', marginTop: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem',
                backgroundColor: '#111827', color: '#ffffff', borderRadius: '0.5rem', fontWeight: 600, fontSize: '1rem', border: 'none', cursor: 'pointer',
                transition: 'background-color 0.2s ease', opacity: isLoading ? 0.7 : 1
              }}
              disabled={isLoading}
              onMouseEnter={(e) => { if(!isLoading) e.currentTarget.style.backgroundColor = '#374151' }}
              onMouseLeave={(e) => { if(!isLoading) e.currentTarget.style.backgroundColor = '#111827' }}
            >
              {isLoading ? 'Authenticating...' : <>Sign In <ArrowRight size={18} /></>}
            </button>
            {error && (
              <div style={{ padding: '0.75rem', backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: '0.5rem', fontSize: '0.875rem', textAlign: 'center' }}>
                {error}
              </div>
            )}
          </form>

          <div style={{ marginTop: '2.5rem', textAlign: 'center', fontSize: '0.875rem', color: '#6b7280' }}>
            Don't have an account? <span style={{ color: 'var(--accent)', fontWeight: 600, cursor: 'pointer' }} onClick={() => navigate('/signup')}>Sign up</span>
          </div>
        </div>
      </div>
    </div>
  );
}
