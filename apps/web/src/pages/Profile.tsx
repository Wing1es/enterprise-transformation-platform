import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { API_URL } from '../config';
import {
  User, Building2, Database, Upload, FileText, CheckCircle2,
  ArrowLeft, Save, Sparkles, Shield, Key, LogOut, ChevronRight, HardDrive, Settings
} from 'lucide-react';

interface UploadedDoc {
  id: string;
  title: string;
  size: string;
  status: 'indexed' | 'indexing';
}

export function Profile() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const tabQuery = searchParams.get('tab');
  const initialTab = (tabQuery === 'vector' || tabQuery === 'qdrant' || tabQuery === 'index')
    ? 'vector'
    : (tabQuery === 'org' ? 'org' : (tabQuery === 'security' ? 'security' : 'profile'));

  const [activeTab, setActiveTab] = useState<'profile' | 'org' | 'vector' | 'security'>(initialTab);

  // Sync tab if query parameter changes
  useEffect(() => {
    if (tabQuery === 'vector' || tabQuery === 'qdrant' || tabQuery === 'index') {
      setActiveTab('vector');
    } else if (tabQuery === 'org') {
      setActiveTab('org');
    } else if (tabQuery === 'security') {
      setActiveTab('security');
    }
  }, [tabQuery]);

  // User Profile State
  const [userName, setUserName] = useState(() => localStorage.getItem('user_name') || 'Executive Admin');
  const [userEmail, setUserEmail] = useState(() => localStorage.getItem('user_email') || 'admin@transformationretail.com');
  const [role, setRole] = useState(() => localStorage.getItem('user_role') || 'Chief Transformation Officer');

  // Org State
  const [orgName, setOrgName] = useState(() => localStorage.getItem('org_name') || 'Transformation Retail Group');
  const [industry, setIndustry] = useState(() => localStorage.getItem('org_industry') || 'Retail & Commerce');
  const [strategy, setStrategy] = useState(() =>
    localStorage.getItem('org_strategy') ||
    'Become an AI-first regional retailer within 3 years — improve margin, reduce stockouts, and personalize customer experience while managing labor costs.'
  );

  // Vector Doc State
  const [docTitle, setDocTitle] = useState('');
  const [docContent, setDocContent] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');

  const [docs, setDocs] = useState<UploadedDoc[]>([
    { id: '1', title: 'Transformation_IT_Security_Policy_2026.pdf', size: '2.4 MB', status: 'indexed' },
    { id: '2', title: 'EU_AI_Act_Retail_Compliance_Matrix.md', size: '840 KB', status: 'indexed' },
    { id: '3', title: 'Supply_Chain_Logistics_SOP_2026.txt', size: '1.1 MB', status: 'indexed' },
  ]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('org_name', orgName);
    localStorage.setItem('org_industry', industry);
    localStorage.setItem('org_strategy', strategy);
    localStorage.setItem('user_name', userName);
    localStorage.setItem('user_email', userEmail);
    localStorage.setItem('user_role', role);
    localStorage.setItem('setup_completed', 'true');

    try {
      await fetch(`${API_URL}/organisations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: orgName,
          industry: industry,
          description: strategy,
        }),
      });
    } catch (err) {
      console.error('Failed to persist org to database:', err);
    }

    // Notify all open pages/listeners of the update
    window.dispatchEvent(new Event('storage-update'));

    setSavedMsg('Profile and Organization details saved successfully!');
    setTimeout(() => setSavedMsg(''), 4000);
  };

  const handleUploadDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle.trim() || !docContent.trim() || isUploading) return;

    setIsUploading(true);
    const newDocId = `doc-${Date.now()}`;
    const newDoc: UploadedDoc = {
      id: newDocId,
      title: docTitle,
      size: `${(docContent.length / 1024).toFixed(1)} KB`,
      status: 'indexing',
    };

    setDocs(prev => [newDoc, ...prev]);

    try {
      await fetch(`${API_URL}/ingest/upload_document`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: docTitle,
          content: docContent,
          source_url: 'https://internal.enterprise.docs',
          entity_type: 'knowledge_base_doc',
        }),
      });

      setDocs(prev =>
        prev.map(d => (d.id === newDocId ? { ...d, status: 'indexed' } : d))
      );
      setDocTitle('');
      setDocContent('');
      setSavedMsg(`Successfully indexed '${docTitle}' into Qdrant Vector Store!`);
      setTimeout(() => setSavedMsg(''), 4000);
    } catch {
      /* skip */
    } finally {
      setIsUploading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    navigate('/login');
  };

  const navItems = [
    { id: 'profile', label: 'User Profile', icon: User, desc: 'Personal details & role' },
    { id: 'org', label: 'Organization & Strategy', icon: Building2, desc: 'Enterprise profile & intent' },
    { id: 'vector', label: 'Qdrant Knowledge Vault', icon: Database, desc: 'Vector document uploads & RAG' },
    { id: 'security', label: 'API & JWT Security', icon: Key, desc: 'Bearer token & session' },
  ] as const;

  return (
    <div style={{
      height: '100vh', width: '100vw',
      backgroundColor: '#000000', color: '#ffffff',
      fontFamily: "'Inter', -apple-system, sans-serif",
      display: 'flex', overflow: 'hidden',
    }}>
      {/* ─── LEFT SIDEBAR (ChatGPT Settings Style) ──────────────── */}
      <aside style={{
        width: 270, backgroundColor: '#09090b',
        borderRight: '1px solid #1f1f1f',
        display: 'flex', flexDirection: 'column',
        justifyContent: 'space-between', padding: '20px 16px',
        boxSizing: 'border-box', flexShrink: 0, zIndex: 60,
      }}>
        <div>
          {/* Back to Workspace button */}
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              all: 'unset', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 8,
              fontSize: 13, fontWeight: 600, color: '#a0a0a0',
              padding: '8px 12px', borderRadius: 10,
              backgroundColor: '#121212', border: '1px solid #1f1f1f',
              marginBottom: 24, width: '100%', boxSizing: 'border-box',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = '#fff';
              e.currentTarget.style.borderColor = '#333333';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = '#a0a0a0';
              e.currentTarget.style.borderColor = '#1f1f1f';
            }}
          >
            <ArrowLeft size={15} /> Back to Chat Workspace
          </button>

          {/* Section Header */}
          <div style={{
            fontSize: 11, fontWeight: 800, color: '#666666',
            textTransform: 'uppercase', letterSpacing: '0.08em',
            padding: '0 8px', marginBottom: 12,
          }}>
            Settings & Profile
          </div>

          {/* Sidebar Nav Items */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {navItems.map(item => {
              const IconComponent = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  style={{
                    all: 'unset', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 12px', borderRadius: 10,
                    backgroundColor: isActive ? '#1f1f1f' : 'transparent',
                    border: `1px solid ${isActive ? '#333333' : 'transparent'}`,
                    color: isActive ? '#ffffff' : '#a0a0a0',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = '#121212';
                      e.currentTarget.style.color = '#fff';
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = '#a0a0a0';
                    }
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <IconComponent size={16} color={isActive ? '#0ea5e9' : '#888888'} />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: isActive ? '#fff' : '#d4d4d8' }}>
                        {item.label}
                      </div>
                    </div>
                  </div>
                  <ChevronRight size={14} color={isActive ? '#0ea5e9' : '#444444'} />
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Card at bottom of left sidebar */}
        <div style={{
          padding: '12px 14px', borderRadius: 12,
          backgroundColor: '#121212', border: '1px solid #1f1f1f',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              backgroundColor: 'rgba(14,165,233,0.2)', color: '#0ea5e9',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 800, fontSize: 13,
            }}>
              EA
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {userName}
              </div>
              <div style={{ fontSize: 11, color: '#666666', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {orgName}
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            title="Log out"
            style={{
              all: 'unset', cursor: 'pointer',
              color: '#666666', padding: 4, borderRadius: 6,
              transition: 'color 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = '#ef4444')}
            onMouseLeave={e => (e.currentTarget.style.color = '#666666')}
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* ─── RIGHT CONTENT AREA (ChatGPT Settings Style) ─── */}
      <main style={{
        flex: 1, height: '100vh', overflowY: 'auto',
        padding: '36px 48px', boxSizing: 'border-box',
      }}>
        <div style={{ maxWidth: 740, margin: '0 auto' }}>

          {/* Toast Notification Banner */}
          {savedMsg && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '12px 18px', borderRadius: 12,
              backgroundColor: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)',
              color: '#22c55e', fontSize: 13, fontWeight: 600, marginBottom: 24,
            }}>
              <CheckCircle2 size={16} /> {savedMsg}
            </div>
          )}

          {/* TAB 1: USER PROFILE */}
          {activeTab === 'profile' && (
            <div>
              <h2 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 6px', letterSpacing: '-0.02em' }}>
                User Profile
              </h2>
              <p style={{ fontSize: 14, color: '#a0a0a0', margin: '0 0 28px' }}>
                Manage your user credentials, email address, and executive title.
              </p>

              <form onSubmit={handleSaveProfile} style={{
                backgroundColor: '#121212', border: '1px solid #1f1f1f',
                borderRadius: 16, padding: 28, display: 'flex', flexDirection: 'column', gap: 20,
              }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#a0a0a0', marginBottom: 8 }}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={userName}
                    onChange={e => setUserName(e.target.value)}
                    style={{
                      width: '100%', padding: '12px 16px', borderRadius: 10,
                      backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a',
                      color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#a0a0a0', marginBottom: 8 }}>
                    Work Email Address
                  </label>
                  <input
                    type="email"
                    value={userEmail}
                    onChange={e => setUserEmail(e.target.value)}
                    style={{
                      width: '100%', padding: '12px 16px', borderRadius: 10,
                      backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a',
                      color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#a0a0a0', marginBottom: 8 }}>
                    Executive Title / Role
                  </label>
                  <input
                    type="text"
                    value={role}
                    onChange={e => setRole(e.target.value)}
                    style={{
                      width: '100%', padding: '12px 16px', borderRadius: 10,
                      backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a',
                      color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box',
                    }}
                  />
                </div>

                <button
                  type="submit"
                  style={{
                    all: 'unset', cursor: 'pointer',
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    marginTop: 8, padding: '12px 22px', borderRadius: 10,
                    backgroundColor: '#0ea5e9', color: '#fff',
                    fontWeight: 700, fontSize: 14, alignSelf: 'flex-start',
                  }}
                >
                  <Save size={15} /> Save User Profile
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: ORGANIZATION & STRATEGY */}
          {activeTab === 'org' && (
            <div>
              <h2 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 6px', letterSpacing: '-0.02em' }}>
                Organization Profile & Intent
              </h2>
              <p style={{ fontSize: 14, color: '#a0a0a0', margin: '0 0 28px' }}>
                Configure your organization name ({orgName}) and strategic transformation statement.
              </p>

              <form onSubmit={handleSaveProfile} style={{
                backgroundColor: '#121212', border: '1px solid #1f1f1f',
                borderRadius: 16, padding: 28, display: 'flex', flexDirection: 'column', gap: 20,
              }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#a0a0a0', marginBottom: 8 }}>
                    Organization Name
                  </label>
                  <input
                    type="text"
                    value={orgName}
                    onChange={e => setOrgName(e.target.value)}
                    style={{
                      width: '100%', padding: '12px 16px', borderRadius: 10,
                      backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a',
                      color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#a0a0a0', marginBottom: 8 }}>
                    Industry Sector
                  </label>
                  <select
                    value={industry}
                    onChange={e => setIndustry(e.target.value)}
                    style={{
                      width: '100%', padding: '12px 16px', borderRadius: 10,
                      backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a',
                      color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box',
                    }}
                  >
                    <option value="Retail & Commerce">Retail & Commerce</option>
                    <option value="Banking & Financial Services">Banking & Financial Services</option>
                    <option value="Healthcare & Life Sciences">Healthcare & Life Sciences</option>
                    <option value="Supply Chain & Logistics">Supply Chain & Logistics</option>
                    <option value="High-Tech Manufacturing">High-Tech Manufacturing</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#a0a0a0', marginBottom: 8 }}>
                    Active Transformation Intent / Strategy Statement
                  </label>
                  <textarea
                    value={strategy}
                    onChange={e => setStrategy(e.target.value)}
                    rows={4}
                    style={{
                      width: '100%', padding: '12px 16px', borderRadius: 10,
                      backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a',
                      color: '#fff', fontSize: 14, outline: 'none', resize: 'none',
                      fontFamily: 'inherit', boxSizing: 'border-box',
                    }}
                  />
                </div>

                <button
                  type="submit"
                  style={{
                    all: 'unset', cursor: 'pointer',
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    marginTop: 8, padding: '12px 22px', borderRadius: 10,
                    backgroundColor: '#0ea5e9', color: '#fff',
                    fontWeight: 700, fontSize: 14, alignSelf: 'flex-start',
                  }}
                >
                  <Save size={15} /> Save Organization Details
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: QDRANT KNOWLEDGE VAULT */}
          {activeTab === 'vector' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <h2 style={{ fontSize: 24, fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
                  Qdrant Vector Knowledge Base
                </h2>
                <span style={{
                  fontSize: 11, fontWeight: 700, color: '#22c55e',
                  padding: '4px 12px', borderRadius: 999,
                  backgroundColor: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)',
                }}>
                  Qdrant Engine Active
                </span>
              </div>
              <p style={{ fontSize: 14, color: '#a0a0a0', margin: '0 0 28px' }}>
                Upload policy documents, guidelines, or SOP text to generate embeddings in Qdrant collection <code style={{ color: '#0ea5e9' }}>evidence_chunks</code>.
              </p>

              {/* Upload Form */}
              <form onSubmit={handleUploadDoc} style={{
                backgroundColor: '#121212', border: '1px dashed #2a2a2a',
                borderRadius: 16, padding: 24, marginBottom: 28,
                display: 'flex', flexDirection: 'column', gap: 14,
              }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>
                  Index Document into Qdrant Vector Store
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#a0a0a0', marginBottom: 6 }}>
                    Document Title / Reference Name
                  </label>
                  <input
                    type="text"
                    value={docTitle}
                    onChange={e => setDocTitle(e.target.value)}
                    placeholder="e.g. Meridian_Supply_Chain_SOP_2026.pdf"
                    style={{
                      width: '100%', padding: '10px 14px', borderRadius: 8,
                      backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a',
                      color: '#fff', fontSize: 13, outline: 'none', boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#a0a0a0', marginBottom: 6 }}>
                    Document Text Content
                  </label>
                  <textarea
                    value={docContent}
                    onChange={e => setDocContent(e.target.value)}
                    placeholder="Paste enterprise policy text, regulatory mandates, or guidelines here..."
                    rows={4}
                    style={{
                      width: '100%', padding: '10px 14px', borderRadius: 8,
                      backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a',
                      color: '#fff', fontSize: 13, outline: 'none', resize: 'none',
                      fontFamily: 'inherit', boxSizing: 'border-box',
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isUploading || !docTitle.trim() || !docContent.trim()}
                  style={{
                    all: 'unset', cursor: isUploading || !docTitle.trim() || !docContent.trim() ? 'not-allowed' : 'pointer',
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    padding: '10px 20px', borderRadius: 8,
                    backgroundColor: isUploading ? '#333' : '#0ea5e9', color: '#fff',
                    fontWeight: 700, fontSize: 13, alignSelf: 'flex-start',
                  }}
                >
                  <Upload size={14} /> {isUploading ? 'Generating Embeddings & Indexing…' : 'Upload to Qdrant Vector Store'}
                </button>
              </form>

              {/* Indexed Documents Table */}
              <div style={{
                backgroundColor: '#121212', border: '1px solid #1f1f1f',
                borderRadius: 16, padding: 20,
              }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 16 }}>
                  Indexed Vector Documents ({docs.length})
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {docs.map(doc => (
                    <div key={doc.id} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '12px 16px', borderRadius: 10,
                      backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <FileText size={18} color="#0ea5e9" />
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{doc.title}</div>
                          <div style={{ fontSize: 11, color: '#666666' }}>Size: {doc.size}</div>
                        </div>
                      </div>

                      <span style={{
                        fontSize: 11, fontWeight: 700,
                        color: doc.status === 'indexed' ? '#22c55e' : '#f59e0b',
                        padding: '3px 10px', borderRadius: 999,
                        backgroundColor: doc.status === 'indexed' ? 'rgba(34,197,94,0.1)' : 'rgba(245,158,11,0.1)',
                      }}>
                        {doc.status === 'indexed' ? 'Indexed in Qdrant' : 'Indexing…'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: API & SECURITY */}
          {activeTab === 'security' && (
            <div>
              <h2 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 6px', letterSpacing: '-0.02em' }}>
                API & JWT Security Credentials
              </h2>
              <p style={{ fontSize: 14, color: '#a0a0a0', margin: '0 0 28px' }}>
                FastAPI JWT authentication tokens and session keys.
              </p>

              <div style={{
                backgroundColor: '#121212', border: '1px solid #1f1f1f',
                borderRadius: 16, padding: 24, display: 'flex', flexDirection: 'column', gap: 20,
              }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#a0a0a0', marginBottom: 6 }}>
                    Active Bearer Token (JWT HMAC-SHA256)
                  </label>
                  <div style={{
                    padding: '12px 14px', borderRadius: 8,
                    backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a',
                    fontSize: 12, fontFamily: "'SF Mono', monospace", color: '#0ea5e9',
                    wordBreak: 'break-all',
                  }}>
                    {localStorage.getItem('auth_token') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbkBtZXJpZGlhbi5jb20iLCJleHAiOjE3Nzk4MDAwMDB9.mockSignatureHash'}
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#a0a0a0', marginBottom: 6 }}>
                    FastAPI Endpoint Prefix
                  </label>
                  <div style={{
                    padding: '12px 14px', borderRadius: 8,
                    backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a',
                    fontSize: 13, fontFamily: "'SF Mono', monospace", color: '#22c55e',
                  }}>
                    http://localhost:8000/api/v1/auth
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
