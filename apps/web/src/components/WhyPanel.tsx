import { ExternalLink, Database, Cpu } from 'lucide-react';

export function WhyPanel() {
  return (
    <div className="why-panel-content">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '0.875rem', fontWeight: 700 }}>Details</h3>
        <span className="node-type-badge opportunity" style={{ fontSize: '0.625rem' }}>opportunity</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div>
          <div className="panel-section-title">Rationale</div>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Predictive assortment reduces stockouts and overstock by aligning inventory with localized demand patterns.
            Directly addresses Meridian's strategy to improve margins and reduce stockouts.
          </p>
        </div>

        <div>
          <div className="panel-section-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Database size={12} /> Source Evidence
          </div>
          <div className="evidence-card">
            <span className="evidence-source">DuckDuckGo Research via MCP</span>
            "Leading regional retailers achieved a 15% reduction in stockouts by implementing ML-driven assortment planning…"
          </div>
        </div>

        <div>
          <div className="panel-section-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Cpu size={12} /> LangSmith Trace
          </div>
          <a
            href="#"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.75rem',
              color: 'var(--accent)',
              textDecoration: 'none',
              fontFamily: 'var(--mono)'
            }}
          >
            View execution trace <ExternalLink size={12} />
          </a>
        </div>
      </div>
    </div>
  );
}
