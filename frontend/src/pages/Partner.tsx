import { Link } from 'react-router-dom'

export default function Partner() {
  const TEAL = '#0F766E'
  const GOLD = '#FFB81C'
  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ background: TEAL, color: 'white', padding: '1.5rem 2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <span style={{ fontSize: '1.5rem' }}>📍</span>
        <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>CivicJM</span>
        <span style={{ opacity: 0.6, margin: '0 0.5rem' }}>|</span>
        <span style={{ opacity: 0.85 }}>Government Partnership</span>
      </div>

      <div style={{ maxWidth: 860, margin: '3rem auto', padding: '0 1.5rem' }}>
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: TEAL, fontWeight: 600, fontSize: '0.9rem', marginBottom: '1.5rem' }}>← Back</Link>

        <div style={{ background: `linear-gradient(135deg, ${TEAL} 0%, #075753 100%)`, color: 'white', borderRadius: 16, padding: '3rem', marginBottom: '2rem', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,184,28,0.2)', border: '1px solid rgba(255,184,28,0.4)', borderRadius: 999, padding: '0.4rem 1rem', marginBottom: '1.25rem', fontSize: '0.85rem', color: GOLD, fontWeight: 600 }}>
            🇯🇲 Partnership Proposal — NWA, KSAC & All 14 Parish Councils
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1rem' }}>Partner with CivicJM</h1>
          <p style={{ opacity: 0.9, fontSize: '1.05rem', lineHeight: 1.7, maxWidth: 600, margin: '0 auto' }}>
            CivicJM is a live community reporting platform that routes citizen complaints directly to the responsible Jamaican government agency — road damage, garbage, water outages, streetlights, illegal dumping, and more.
          </p>
        </div>

        <div style={{ background: 'white', borderRadius: 12, padding: '2rem', marginBottom: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: TEAL, marginBottom: '1.25rem' }}>What CivicJM Offers</h2>
          {[
            ['Citizen Issue Reporting', 'Citizens report problems with GPS tagging, photos, and category selection — directly from their phone.'],
            ['Auto-Routing to Agencies', 'Issues automatically routed to the right agency: NWA (roads), KSAC (Kingston), Parish Councils (rural areas), NWC (water).'],
            ['SMS Notifications via Twilio', 'Agency staff receive instant SMS notifications. Citizens get updates when their issue is acknowledged or resolved.'],
            ['Public Map View', 'Open map showing all reported issues — transparency builds trust between citizens and government.'],
            ['Agency Dashboard', 'Each agency gets a dedicated dashboard with their assigned issues, status tracking, and resolution metrics.'],
            ['WhatsApp Sharing', 'Citizens can share reports via WhatsApp — increasing community engagement.'],
            ['Resolution Tracking', 'Every issue has a lifecycle: Reported → Acknowledged → In Progress → Resolved.'],
            ['Audit & Performance Reports', 'Track response times, resolution rates, and parish-level performance — for transparency and accountability.'],
          ].map(([title, desc]) => (
            <div key={title} style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ color: TEAL, fontSize: '1.2rem', flexShrink: 0 }}>✓</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{title}</div>
                <div style={{ color: '#64748b', fontSize: '0.88rem', marginTop: 2 }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ background: 'white', borderRadius: 12, padding: '2rem', marginBottom: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: TEAL, marginBottom: '1.25rem' }}>Pilot Programme — 3 Phases</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr style={{ background: TEAL }}>
              {['Phase','Timeline','Scope','Cost'].map(h => <th key={h} style={{ padding: '0.75rem 1rem', color: 'white', fontSize: '0.85rem', fontWeight: 600, textAlign: 'left' }}>{h}</th>)}
            </tr></thead>
            <tbody>
              {[
                ['Pilot', 'Month 1–2', '1 Parish Council or NWA region', 'FREE (30-day trial)'],
                ['Expand', 'Month 3–6', '6 Parish Councils + NWA + KSAC', 'J$50,000–J$200,000/agency/month'],
                ['National', 'Month 7–12', 'All 14 Parish Councils + NWA + KSAC + NWC', 'Bulk rate negotiable'],
              ].map(([phase, time, scope, cost], i) => (
                <tr key={phase} style={{ background: i % 2 === 0 ? '#ccfbf1' : 'white' }}>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 600, fontSize: '0.88rem' }}>{phase}</td>
                  <td style={{ padding: '0.75rem 1rem', fontSize: '0.88rem' }}>{time}</td>
                  <td style={{ padding: '0.75rem 1rem', fontSize: '0.88rem' }}>{scope}</td>
                  <td style={{ padding: '0.75rem 1rem', fontSize: '0.88rem', fontWeight: 600, color: TEAL }}>{cost}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ background: '#ccfbf1', borderRadius: 12, padding: '2rem', marginBottom: '1.5rem', border: `1px solid ${TEAL}` }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: TEAL, marginBottom: '1rem' }}>Try the Live Platform</h2>
          <p style={{ fontSize: '0.88rem', color: '#475569', marginBottom: '1rem' }}>The platform is live with auto-routing to all 16 agencies (14 parish councils + NWA + KSAC) configured.</p>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Link to="/map" style={{ background: TEAL, color: 'white', padding: '0.6rem 1.5rem', borderRadius: 8, fontWeight: 600, fontSize: '0.9rem' }}>Public Map (no login)</Link>
            <Link to="/login" style={{ background: GOLD, color: '#1a202c', padding: '0.6rem 1.5rem', borderRadius: 8, fontWeight: 600, fontSize: '0.9rem' }}>Sign In</Link>
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: 12, padding: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: TEAL, marginBottom: '0.5rem' }}>Get in Touch</h2>
          <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '1rem' }}>
            <a href="mailto:saqlain@schooltrackjm.com" style={{ color: TEAL, fontWeight: 600 }}>✉ saqlain@schooltrackjm.com</a>
            <a href="tel:+18768751969" style={{ color: TEAL, fontWeight: 600 }}>📞 +1 (876) 875-1969 / +1 (876) 234-5464</a>
          </div>
          <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#f8fafc', borderRadius: 8, fontSize: '0.82rem', color: '#94a3b8' }}>
            Saqlain Senior | Founder, CivicJM | Black River, St. Elizabeth, Jamaica 🇯🇲
          </div>
        </div>
      </div>
    </div>
  )
}
