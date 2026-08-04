import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Upload, FileText, CheckCircle2, ArrowRight, Sparkles, Shield, Database, SkipForward } from 'lucide-react';

interface UploadedDoc {
  id: string;
  title: string;
  size: string;
  qdrantPointId?: string;
  status: 'indexing' | 'indexed' | 'error';
}

export function OrgSetup() {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);

  // Step 1 State - Preserve user custom settings if already set in localStorage
  const [orgName, setOrgName] = useState(() => localStorage.getItem('org_name') || 'Transformation Retail Group');
  const [industry, setIndustry] = useState(() => localStorage.getItem('org_industry') || 'Retail & Commerce');
  const [strategy, setStrategy] = useState(() =>
    localStorage.getItem('org_strategy') ||
    'Become an AI-first regional retailer within 3 years — improve margin, reduce stockouts, and personalize customer experience while managing labor costs.'
  );

  // Step 2 State
  const [docTitle, setDocTitle] = useState('');
  const [docContent, setDocContent] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [docs, setDocs] = useState<UploadedDoc[]>([
    { id: '1', title: 'Transformation_IT_Security_Policy_2026.pdf', size: '2.4 MB', status: 'indexed', qdrantPointId: 'qd-vec-8812' },
    { id: '2', title: 'EU_AI_Act_Retail_Compliance_Matrix.md', size: '840 KB', status: 'indexed', qdrantPointId: 'qd-vec-4409' },
  ]);

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
      const res = await fetch('http://localhost:8000/ingest/upload_document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: docTitle,
          content: docContent,
          source_url: 'https://internal.transformation.retail/docs',
          entity_type: 'knowledge_base_doc',
        }),
      });

      const data = await res.json();
      setDocs(prev =>
        prev.map(d =>
          d.id === newDocId
            ? { ...d, status: 'indexed', qdrantPointId: data.point_id }
            : d
        )
      );
      setDocTitle('');
      setDocContent('');
    } catch {
      setDocs(prev =>
        prev.map(d => (d.id === newDocId ? { ...d, status: 'error' } : d))
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleSkipOrFinish = async () => {
    const finalOrg = orgName || 'Transformation Retail Group';
    const finalInd = industry || 'Retail & Commerce';
    localStorage.setItem('org_name', finalOrg);
    localStorage.setItem('org_industry', finalInd);
    localStorage.setItem('org_strategy', strategy);
    localStorage.setItem('setup_completed', 'true');

    try {
      await fetch('http://localhost:8000/organisations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: finalOrg,
          industry: finalInd,
          description: strategy,
        }),
      });
    } catch (e) {
      console.error('Failed to sync org to database:', e);
    }

    window.dispatchEvent(new Event('storage-update'));
    navigate('/dashboard');
  };

  return (
    <div style={{
      minHeight: '100vh', width: '100vw',
      backgroundColor: '#09090b', color: '#ececec',
      fontFamily: "'Inter', -apple-system, sans-serif",
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '40px 20px', boxSizing: 'border-box',
    }}>
      {/* Top Header Controls */}
      <div style={{
        width: '100%', maxWidth: 640,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 24,
      }}>
        {/* Stepper Indicator */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '6px 16px',
          backgroundColor: '#121215', border: '1px solid #27272a',
          borderRadius: 999,
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            fontSize: 12, fontWeight: 700,
            color: step === 1 ? '#0ea5e9' : '#22c55e',
          }}>
            <span style={{
              width: 20, height: 20, borderRadius: '50%',
              backgroundColor: step === 1 ? 'rgba(14,165,233,0.15)' : 'rgba(34,197,94,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11,
            }}>1</span>
            Organization
          </div>

          <span style={{ color: '#444', fontSize: 12 }}>→</span>

          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            fontSize: 12, fontWeight: 700,
            color: step === 2 ? '#0ea5e9' : '#71717a',
          }}>
            <span style={{
              width: 20, height: 20, borderRadius: '50%',
              backgroundColor: step === 2 ? 'rgba(14,165,233,0.15)' : '#1f1f23',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11,
            }}>2</span>
            Vector Ingestion
          </div>
        </div>

        {/* Skip for Now Button */}
        <button
          onClick={handleSkipOrFinish}
          style={{
            all: 'unset', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 6,
            fontSize: 13, fontWeight: 600, color: '#a1a1aa',
            padding: '6px 14px', borderRadius: 999,
            backgroundColor: '#121215', border: '1px solid #27272a',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.color = '#fff';
            e.currentTarget.style.borderColor = '#3f3f46';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.color = '#a1a1aa';
            e.currentTarget.style.borderColor = '#27272a';
          }}
        >
          <span>Skip for now</span>
          <SkipForward size={14} />
        </button>
      </div>

      {/* Main Container Card */}
      <div style={{
        width: '100%', maxWidth: 640,
        backgroundColor: '#121215', border: '1px solid #27272a',
        borderRadius: 20, padding: 36,
        boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
      }}>

        {/* STEP 1: ORGANIZATION PROFILE */}
        {step === 1 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <Building2 size={24} color="#0ea5e9" />
              <h2 style={{ fontSize: 22, fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
                Set up your Organization
              </h2>
            </div>
            <p style={{ fontSize: 14, color: '#888', margin: '0 0 28px', lineHeight: 1.5 }}>
              Configure your enterprise profile to synthesize your Digital Twin. You can also skip and update this in Profile settings anytime.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#aaa', marginBottom: 8 }}>
                  Organization Name
                </label>
                <input
                  type="text"
                  value={orgName}
                  onChange={e => setOrgName(e.target.value)}
                  placeholder="e.g. Meridian Retail Group"
                  style={{
                    width: '100%', padding: '12px 16px', borderRadius: 10,
                    backgroundColor: '#18181b', border: '1px solid #27272a',
                    color: '#fff', fontSize: 14, outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#aaa', marginBottom: 8 }}>
                  Industry Sector
                </label>
                <select
                  value={industry}
                  onChange={e => setIndustry(e.target.value)}
                  style={{
                    width: '100%', padding: '12px 16px', borderRadius: 10,
                    backgroundColor: '#18181b', border: '1px solid #27272a',
                    color: '#fff', fontSize: 14, outline: 'none',
                    boxSizing: 'border-box',
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
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#aaa', marginBottom: 8 }}>
                  Executive Strategy / Transformation Intent
                </label>
                <textarea
                  value={strategy}
                  onChange={e => setStrategy(e.target.value)}
                  rows={4}
                  placeholder="Describe your 2-3 year strategic AI transformation goal..."
                  style={{
                    width: '100%', padding: '12px 16px', borderRadius: 10,
                    backgroundColor: '#18181b', border: '1px solid #27272a',
                    color: '#fff', fontSize: 14, outline: 'none',
                    resize: 'none', fontFamily: 'inherit',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
                <button
                  onClick={handleSkipOrFinish}
                  style={{
                    all: 'unset', cursor: 'pointer',
                    padding: '14px 20px', borderRadius: 12,
                    backgroundColor: '#18181b', border: '1px solid #27272a',
                    color: '#aaa', fontWeight: 600, fontSize: 14,
                  }}
                >
                  Do this later
                </button>

                <button
                  onClick={() => setStep(2)}
                  disabled={!orgName.trim()}
                  style={{
                    all: 'unset', cursor: orgName.trim() ? 'pointer' : 'not-allowed', flex: 1,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    padding: '14px', borderRadius: 12,
                    backgroundColor: orgName.trim() ? '#0ea5e9' : '#222',
                    color: '#fff', fontWeight: 700, fontSize: 14,
                    transition: 'background 0.15s',
                  }}
                >
                  Continue to Document Ingestion
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: QDRANT DOCUMENT UPLOAD */}
        {step === 2 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Database size={24} color="#0ea5e9" />
                <h2 style={{ fontSize: 22, fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
                  Upload Domain Docs to Qdrant
                </h2>
              </div>
              <span style={{
                fontSize: 11, fontWeight: 700, color: '#22c55e',
                padding: '4px 10px', borderRadius: 999,
                backgroundColor: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)',
              }}>
                Qdrant Active
              </span>
            </div>
            <p style={{ fontSize: 14, color: '#888', margin: '0 0 24px', lineHeight: 1.5 }}>
              Upload policy docs or guidelines to index them into Qdrant vector store. You can skip and add docs later in Profile settings.
            </p>

            {/* Document Upload Form */}
            <form onSubmit={handleUploadDoc} style={{
              backgroundColor: '#18181b', border: '1px dashed #27272a',
              borderRadius: 14, padding: 20, marginBottom: 24,
              display: 'flex', flexDirection: 'column', gap: 14,
            }}>
              <div>
                <input
                  type="text"
                  value={docTitle}
                  onChange={e => setDocTitle(e.target.value)}
                  placeholder="Document Title (e.g. EU_AI_Act_Compliance_Checklist.pdf)"
                  style={{
                    width: '100%', padding: '10px 14px', borderRadius: 8,
                    backgroundColor: '#121215', border: '1px solid #27272a',
                    color: '#fff', fontSize: 13, outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
              <div>
                <textarea
                  value={docContent}
                  onChange={e => setDocContent(e.target.value)}
                  rows={3}
                  placeholder="Paste document text or regulatory guidelines content..."
                  style={{
                    width: '100%', padding: '10px 14px', borderRadius: 8,
                    backgroundColor: '#121215', border: '1px solid #27272a',
                    color: '#fff', fontSize: 13, outline: 'none',
                    resize: 'none', fontFamily: 'inherit',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={!docTitle.trim() || !docContent.trim() || isUploading}
                style={{
                  all: 'unset', cursor: docTitle.trim() && docContent.trim() && !isUploading ? 'pointer' : 'not-allowed',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  padding: '10px 16px', borderRadius: 8,
                  backgroundColor: docTitle.trim() && docContent.trim() ? '#0ea5e9' : '#27272a',
                  color: '#fff', fontWeight: 600, fontSize: 13,
                  alignSelf: 'flex-end', transition: 'background 0.15s',
                }}
              >
                <Upload size={14} />
                {isUploading ? 'Indexing to Qdrant...' : 'Index Document into Qdrant'}
              </button>
            </form>

            {/* Uploaded Documents List */}
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
                Indexed Vector Sources ({docs.length})
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {docs.map(doc => (
                  <div key={doc.id} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '12px 16px', borderRadius: 10,
                    backgroundColor: '#18181b', border: '1px solid #27272a',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <FileText size={16} color="#0ea5e9" />
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{doc.title}</div>
                        <div style={{ fontSize: 11, color: '#666' }}>{doc.size} • Collection: evidence_chunks</div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {doc.status === 'indexed' && (
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 4,
                          fontSize: 11, fontWeight: 700, color: '#22c55e',
                          padding: '3px 8px', borderRadius: 999,
                          backgroundColor: 'rgba(34,197,94,0.1)',
                        }}>
                          <CheckCircle2 size={12} /> Indexed
                        </span>
                      )}
                      {doc.status === 'indexing' && (
                        <span style={{ fontSize: 11, color: '#0ea5e9', fontWeight: 600 }}>Indexing...</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Finish Action */}
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => setStep(1)}
                style={{
                  all: 'unset', cursor: 'pointer',
                  padding: '12px 20px', borderRadius: 10,
                  backgroundColor: '#18181b', border: '1px solid #27272a',
                  color: '#aaa', fontWeight: 600, fontSize: 13,
                }}
              >
                Back
              </button>

              <button
                onClick={handleSkipOrFinish}
                style={{
                  all: 'unset', cursor: 'pointer', flex: 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  padding: '12px 20px', borderRadius: 10,
                  backgroundColor: '#0ea5e9', color: '#fff',
                  fontWeight: 700, fontSize: 14,
                }}
              >
                Launch Digital Twin Workspace
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
