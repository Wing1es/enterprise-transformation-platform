import { useEffect, useState } from 'react';
import { ShieldAlert, CheckCircle, XCircle } from 'lucide-react';

export function HitlModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const handleTrigger = (e: any) => {
      setData(e.detail);
      setIsOpen(true);
    };
    window.addEventListener('hitl-trigger', handleTrigger);
    return () => window.removeEventListener('hitl-trigger', handleTrigger);
  }, []);

  const handleDecision = async (approved: boolean) => {
    setIsSubmitting(true);
    try {
      await fetch('http://localhost:8000/api/v1/agent/hitl_response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          session_id: data.session_id, 
          approved,
          feedback: approved ? 'Approved by user' : 'Rejected by user'
        })
      });
      
      // Dispatch resolution event so Sidebar and GraphView update immediately
      window.dispatchEvent(new CustomEvent('hitl-resolved', {
        detail: {
          approved,
          session_id: data.session_id,
          message: approved 
            ? '✅ Governance Approved: Opportunity signed off for deployment.' 
            : '❌ Governance Rejected: Opportunity halted due to governance risk.'
        }
      }));
      
      setIsOpen(false);
      setData(null);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !data) return null;
  const { governance_details } = data;

  return (
    <div className="hitl-modal-overlay">
      <div className="hitl-modal">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
          <ShieldAlert size={22} color="var(--red)" />
          <div>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Governance Sign-off
            </h2>
            <span className="hitl-risk-badge" style={{ marginTop: '4px' }}>
              High Risk
            </span>
          </div>
        </div>

        <div style={{
          marginBottom: '1.5rem',
          backgroundColor: 'var(--bg-elevated)',
          padding: '1rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border)'
        }}>
          <div className="panel-section-title">Message</div>
          <p style={{ fontWeight: 600, marginBottom: '1rem', fontSize: '0.875rem' }}>
            {data.message || 'Governance sign-off required'}
          </p>
          <div className="panel-section-title">Finding</div>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
            {governance_details?.priority_rationale || 'No specific finding.'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button className="btn btn-danger" onClick={() => handleDecision(false)} disabled={isSubmitting}>
            <XCircle size={16} /> Reject
          </button>
          <button className="btn btn-success" onClick={() => handleDecision(true)} disabled={isSubmitting}>
            <CheckCircle size={16} /> Approve
          </button>
        </div>
      </div>
    </div>
  );
}
