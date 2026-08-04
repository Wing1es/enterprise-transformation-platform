import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';
import { API_URL } from '../config';


export function Signup() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const res = await fetch(`${API_URL}/api/v1/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.detail || 'Signup failed');
      }
      
      // Clear old session cache for brand new account
      localStorage.removeItem('ti_saved_sessions');
      localStorage.removeItem('ti_active_messages');
      localStorage.removeItem('ti_active_session_id');
      localStorage.removeItem('setup_completed');

      localStorage.setItem('auth_token', data.access_token);
      if (data.user?.name) localStorage.setItem('user_name', data.user.name);
      if (data.user?.email) localStorage.setItem('user_email', data.user.email);

      navigate('/setup');
    } catch (err: any) {
      alert(err.message);
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
            Start your journey.
          </h1>
          <p style={{ fontSize: '1.25rem', color: '#4b5563', lineHeight: 1.6 }}>
            Join the platform that is redefining enterprise strategy execution. Set up your organization and map your value chain today.
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
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#111827', letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>Create an account</h2>
            <p style={{ color: '#6b7280', fontSize: '1rem' }}>Enter your details to get started.</p>
          </div>

          <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: '#374151' }}>Full Name</label>
              <input 
                type="text" 
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ 
                  width: '100%', padding: '0.875rem 1rem', borderRadius: '0.5rem', border: '1px solid #d1d5db', 
                  backgroundColor: '#ffffff', color: '#111827', outline: 'none', fontSize: '1rem',
                  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', transition: 'border-color 0.2s ease'
                }} 
                placeholder="Jane Doe" 
                onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: '#374151' }}>Work Email</label>
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
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: '#374151' }}>Password</label>
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
                placeholder="Create a strong password" 
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
              {isLoading ? 'Creating account...' : <>Create Account <ArrowRight size={18} /></>}
            </button>
          </form>

          <div style={{ marginTop: '2.5rem', textAlign: 'center', fontSize: '0.875rem', color: '#6b7280' }}>
            Already have an account? <span style={{ color: 'var(--accent)', fontWeight: 600, cursor: 'pointer' }} onClick={() => navigate('/login')}>Sign in</span>
          </div>
        </div>
      </div>
    </div>
  );
}
