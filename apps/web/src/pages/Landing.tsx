import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, Network, Play, ShieldAlert, Cpu } from 'lucide-react';

export function Landing() {
  const navigate = useNavigate();

  return (
    <div className="landing-page" style={{ height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#ffffff', position: 'relative', zIndex: 1, overflowY: 'auto', overflowX: 'hidden', fontFamily: 'Inter, sans-serif' }}>
      
      {/* Inline styles for premium animations and bento grids */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
        }
        .delay-100 { animation-delay: 100ms; }
        .delay-200 { animation-delay: 200ms; }
        .delay-300 { animation-delay: 300ms; }
        
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
          100% { transform: translateY(0px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .text-gradient {
          background: linear-gradient(135deg, var(--accent) 0%, #8b5cf6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .bento-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          grid-template-rows: repeat(2, 1fr);
          gap: 1.5rem;
          max-width: 1100px;
          margin: 0 auto;
          width: 100%;
        }

        .bento-card {
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(0, 0, 0, 0.06);
          border-radius: 24px;
          padding: 2.5rem;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.03);
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          position: relative;
          overflow: hidden;
          text-align: left;
        }

        .bento-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.06);
        }

        .bento-large { grid-column: span 2; grid-row: span 2; }
        .bento-tall { grid-row: span 2; }
      `}</style>

      {/* Landing Navbar */}
      <nav style={{ padding: '1.5rem 3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'transparent', position: 'relative', zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 800, fontSize: '1.25rem', color: '#111827' }}>
          <Sparkles color="var(--accent)" />
          Transformation Intelligence
        </div>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <span style={{ fontWeight: 600, color: '#4b5563', cursor: 'pointer', fontSize: '0.9375rem' }} onClick={() => navigate('/login')}>Sign In</span>
          <button 
            style={{ backgroundColor: '#111827', color: 'white', padding: '0.625rem 1.25rem', borderRadius: '9999px', fontWeight: 600, fontSize: '0.9375rem', border: 'none', cursor: 'pointer', transition: 'background 0.2s' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#374151'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#111827'}
            onClick={() => navigate('/signup')}
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', paddingBottom: '6rem', position: 'relative' }}>
        
        {/* Background Gradients for Hero */}
        <div style={{ position: 'absolute', top: '-10%', left: '50%', transform: 'translateX(-50%)', width: '100%', height: '800px', background: 'radial-gradient(ellipse at top, rgba(59,130,246,0.08) 0%, rgba(255,255,255,0) 70%)', pointerEvents: 'none' }}></div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', maxWidth: '1000px', margin: '0 auto', width: '100%', padding: '6rem 2rem 4rem 2rem', position: 'relative', zIndex: 10 }}>
          
          <div style={{ flex: 1, maxWidth: '800px', display: 'flex', flexDirection: 'column', alignItems: 'center' }} className="animate-fade-in-up">
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '9999px', backgroundColor: 'rgba(59,130,246,0.1)', color: 'var(--accent)', fontWeight: 600, fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--accent)', display: 'inline-block' }}></span>
              Enterprise AI Operating System
            </div>
            
            <h1 style={{ fontSize: '4.5rem', fontWeight: 900, lineHeight: 1.05, letterSpacing: '-0.04em', color: '#111827', marginBottom: '1.5rem' }}>
              Design the future of your <span className="text-gradient">enterprise.</span>
            </h1>
            
            <p style={{ fontSize: '1.25rem', color: '#4b5563', lineHeight: 1.6, marginBottom: '2.5rem', maxWidth: '650px' }}>
              Upload your high-level strategy and watch as multi-agent AI automatically maps your value chain, pinpoints high-ROI automation, and governs execution.
            </p>
            
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <button 
                onClick={() => navigate('/signup')}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--accent)', color: 'white', padding: '1.25rem 2.5rem', borderRadius: '9999px', fontSize: '1.125rem', fontWeight: 600, border: 'none', cursor: 'pointer', boxShadow: '0 10px 25px rgba(59,130,246,0.3)' }}
              >
                Start Transforming <ArrowRight size={20} />
              </button>
              <button 
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'transparent', color: '#111827', padding: '1.25rem 2.5rem', borderRadius: '9999px', fontSize: '1.125rem', fontWeight: 600, border: '1px solid #e5e7eb', cursor: 'pointer' }}
              >
                <Play size={20} /> Watch Demo
              </button>
            </div>
          </div>
        </div>

        {/* Bento Grid Features Section */}
        <div style={{ padding: '4rem 2rem', position: 'relative', zIndex: 10 }}>
          <div className="bento-grid animate-fade-in-up delay-200">
            
            {/* Large Card: Graph Extraction */}
            <div className="bento-card bento-large" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ flex: 1 }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'rgba(139,92,246,0.1)', color: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                  <Network size={24} />
                </div>
                <h3 style={{ fontSize: '2rem', fontWeight: 800, color: '#111827', marginBottom: '1rem', letterSpacing: '-0.02em' }}>
                  Dynamic Multi-Agent Graph Synthesis
                </h3>
                <p style={{ fontSize: '1.125rem', color: '#4b5563', lineHeight: 1.6, maxWidth: '80%' }}>
                  Our AI agents continuously traverse your strategy, breaking it down into Value Chain Stages, Processes, Activities, and Roles—forming a live, interactive knowledge graph of your entire organization.
                </p>
              </div>
              
              {/* Decorative Mockup */}
              <div style={{ height: '200px', marginTop: '2rem', borderRadius: '16px', background: 'linear-gradient(to top right, #f8fafc, #f1f5f9)', border: '1px solid #e2e8f0', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: '20px', left: '20px', right: '20px', bottom: '-20px', backgroundColor: 'white', borderRadius: '8px 8px 0 0', boxShadow: '0 -4px 12px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
                   {/* Mock graph nodes */}
                   <div style={{ display: 'flex', justifyContent: 'center', marginTop: '40px', gap: '40px' }}>
                     <div style={{ width: '80px', height: '40px', backgroundColor: '#e0e7ff', borderRadius: '6px', border: '1px solid #c7d2fe' }}></div>
                     <div style={{ width: '80px', height: '40px', backgroundColor: '#dcfce7', borderRadius: '6px', border: '1px solid #bbf7d0' }}></div>
                     <div style={{ width: '80px', height: '40px', backgroundColor: '#fef3c7', borderRadius: '6px', border: '1px solid #fde68a' }}></div>
                   </div>
                   {/* Connecting lines mocked */}
                   <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
                     <path d="M 120 60 L 220 60" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4 4" fill="none" />
                     <path d="M 260 60 L 360 60" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4 4" fill="none" />
                   </svg>
                </div>
              </div>
            </div>

            {/* Small Card 1: AI Opportunities */}
            <div className="bento-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'rgba(245,158,11,0.1)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                <Cpu size={24} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827', marginBottom: '0.75rem' }}>
                AI Opportunity Spotting
              </h3>
              <p style={{ fontSize: '1rem', color: '#4b5563', lineHeight: 1.5 }}>
                Automatically identify manual workflows and inject AI solutions with immediate ROI calculations.
              </p>
            </div>

            {/* Small Card 2: Governance */}
            <div className="bento-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'rgba(239,68,68,0.1)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                <ShieldAlert size={24} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827', marginBottom: '0.75rem' }}>
                Human-in-the-Loop
              </h3>
              <p style={{ fontSize: '1rem', color: '#4b5563', lineHeight: 1.5 }}>
                Execution pauses automatically for sign-off when high-risk compliance or policy changes are detected.
              </p>
            </div>

          </div>
        </div>

      </main>
    </div>
  );
}
