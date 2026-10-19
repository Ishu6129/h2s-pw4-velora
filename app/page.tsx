/* ═══════════════════════════════════════════════════════════════
   Velora — Landing Page
   Premium hero with lime-spark × graphite × dragonfruit design.
   ═══════════════════════════════════════════════════════════════ */

export default function HomePage() {
  return (
    <div className="page-wrapper">
      {/* Hero Section */}
      <section className="hero" aria-label="Welcome to Velora">
        <div className="hero-content">
          <div className="hero-eyebrow">
            <span aria-hidden="true">⚡</span>
            AI-Powered Event Planning
          </div>

          <h1 className="hero-title">
            Plan Events That
            <br />
            <span className="gradient-text">Leave a Mark</span>
          </h1>

          <p className="hero-subtitle">
            Velora crafts unforgettable weddings, birthdays, and community events with
            AI-generated budgets, timelines, vendor checklists, and personalized ideas
            — in seconds, not weeks.
          </p>

          <div className="hero-actions">
            <a href="/planner" className="btn btn-primary btn-lg" aria-label="Start planning your event">
              ⚡ Start Planning
            </a>
            <a href="/chat" className="btn btn-accent btn-lg" aria-label="Chat with Velora AI assistant">
              💬 Chat with Velora
            </a>
          </div>

          {/* Trust indicators */}
          <div
            className="animate-fade-up delay-5"
            style={{
              display: 'flex',
              gap: 'var(--space-2xl)',
              justifyContent: 'center',
              marginTop: 'var(--space-3xl)',
              flexWrap: 'wrap',
            }}
          >
            {[
              { value: '3', label: 'Event Types' },
              { value: '2', label: 'AI Models' },
              { value: '∞', label: 'Possibilities' },
            ].map((stat) => (
              <div key={stat.label} style={{ textAlign: 'center' }}>
                <div style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.8rem',
                  fontWeight: 900,
                  background: 'var(--gradient-mesh)',
                  backgroundSize: '200% 200%',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section" aria-label="Features" style={{ position: 'relative' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-3xl)' }}>
            <div className="badge badge-accent" style={{ marginBottom: 'var(--space-md)' }}>
              ✦ Features
            </div>
            <h2 className="animate-fade-up">
              Everything You Need,{' '}
              <span style={{ color: 'var(--lime)' }}>Nothing You Don&apos;t</span>
            </h2>
            <p className="animate-fade-up delay-1" style={{ maxWidth: '550px', margin: 'var(--space-md) auto 0' }}>
              From intimate dinners to grand celebrations — Velora&apos;s AI tailors every detail to your vision.
            </p>
          </div>

          <div className="features-grid">
            <div className="card feature-card animate-fade-up delay-1">
              <div className="feature-icon feature-icon-gold" aria-hidden="true">💰</div>
              <h3 className="feature-title">Smart Budget Engine</h3>
              <p className="feature-desc">
                AI-optimized budget breakdowns across vendor categories with priority rankings and cost-saving suggestions.
              </p>
            </div>

            <div className="card feature-card animate-fade-up delay-2">
              <div className="feature-icon feature-icon-purple" aria-hidden="true">📅</div>
              <h3 className="feature-title">Dynamic Timelines</h3>
              <p className="feature-desc">
                Milestone planning from booking to the big day. Never miss a deadline with AI-scheduled checkpoints.
              </p>
            </div>

            <div className="card feature-card animate-fade-up delay-3">
              <div className="feature-icon feature-icon-rose" aria-hidden="true">🏪</div>
              <h3 className="feature-title">Vendor Intelligence</h3>
              <p className="feature-desc">
                Curated vendor checklists with cost estimates, priority tiers, and booking deadline recommendations.
              </p>
            </div>

            <div className="card feature-card animate-fade-up delay-4">
              <div className="feature-icon feature-icon-gold" aria-hidden="true">💡</div>
              <h3 className="feature-title">Creative Ideas</h3>
              <p className="feature-desc">
                Unique, personalized suggestions from DIY touches to luxury additions — all within your budget.
              </p>
            </div>

            <div className="card feature-card animate-fade-up delay-5">
              <div className="feature-icon feature-icon-purple" aria-hidden="true">⚡</div>
              <h3 className="feature-title">Streaming AI Chat</h3>
              <p className="feature-desc">
                Real-time conversation with Velora AI. Refine plans, ask questions, and get instant expert advice.
              </p>
            </div>

            <div className="card feature-card animate-fade-up delay-5">
              <div className="feature-icon feature-icon-rose" aria-hidden="true">🧠</div>
              <h3 className="feature-title">Smart Model Routing</h3>
              <p className="feature-desc">
                Complex queries route to GPT-OSS 120B. Quick questions use 20B for instant answers. Zero wasted tokens.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Event Types Section */}
      <section
        className="section"
        style={{
          background: 'linear-gradient(180deg, rgba(15, 15, 30, 0.5), var(--bg-base))',
          borderTop: '1px solid var(--border-subtle)',
          borderBottom: '1px solid var(--border-subtle)',
        }}
        aria-label="Supported event types"
      >
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-3xl)' }}>
            <div className="badge badge-rose" style={{ marginBottom: 'var(--space-md)' }}>
              ✦ Event Types
            </div>
            <h2>Plan Any Celebration</h2>
            <p style={{ maxWidth: '480px', margin: 'var(--space-md) auto 0' }}>
              Specialized AI planning for every occasion.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-lg)' }}>
            <div className="card" style={{ textAlign: 'center', padding: 'var(--space-2xl) var(--space-xl)', borderTop: '2px solid var(--lime)' }}>
              <div style={{ fontSize: '3.5rem', marginBottom: 'var(--space-md)', filter: 'drop-shadow(0 0 12px var(--lime-glow))' }} aria-hidden="true">💍</div>
              <h3 style={{ marginBottom: 'var(--space-sm)' }}>Weddings</h3>
              <p style={{ fontSize: '0.88rem' }}>
                Venue, catering, floral, photography, attire, stationery — every detail for your perfect day.
              </p>
              <div style={{ display: 'flex', gap: 'var(--space-xs)', justifyContent: 'center', marginTop: 'var(--space-lg)', flexWrap: 'wrap' }}>
                <span className="badge badge-accent">Venue</span>
                <span className="badge badge-gold">Catering</span>
                <span className="badge badge-rose">Florals</span>
              </div>
            </div>

            <div className="card" style={{ textAlign: 'center', padding: 'var(--space-2xl) var(--space-xl)', borderTop: '2px solid var(--violet)' }}>
              <div style={{ fontSize: '3.5rem', marginBottom: 'var(--space-md)', filter: 'drop-shadow(0 0 12px var(--violet-glow))' }} aria-hidden="true">🎂</div>
              <h3 style={{ marginBottom: 'var(--space-sm)' }}>Birthdays</h3>
              <p style={{ fontSize: '0.88rem' }}>
                Themes, entertainment, cakes, decorations, and activities for milestone celebrations at any age.
              </p>
              <div style={{ display: 'flex', gap: 'var(--space-xs)', justifyContent: 'center', marginTop: 'var(--space-lg)', flexWrap: 'wrap' }}>
                <span className="badge badge-gold">Themes</span>
                <span className="badge badge-accent">Entertainment</span>
                <span className="badge badge-rose">Cakes</span>
              </div>
            </div>

            <div className="card" style={{ textAlign: 'center', padding: 'var(--space-2xl) var(--space-xl)', borderTop: '2px solid var(--dragon)' }}>
              <div style={{ fontSize: '3.5rem', marginBottom: 'var(--space-md)', filter: 'drop-shadow(0 0 12px var(--dragon-glow))' }} aria-hidden="true">🎪</div>
              <h3 style={{ marginBottom: 'var(--space-sm)' }}>Community</h3>
              <p style={{ fontSize: '0.88rem' }}>
                Fundraisers, festivals, galas, corporate events — gatherings that bring people together.
              </p>
              <div style={{ display: 'flex', gap: 'var(--space-xs)', justifyContent: 'center', marginTop: 'var(--space-lg)', flexWrap: 'wrap' }}>
                <span className="badge badge-accent">Logistics</span>
                <span className="badge badge-gold">Sponsors</span>
                <span className="badge badge-rose">Outreach</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section" aria-label="How it works">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-3xl)' }}>
            <div className="badge badge-gold" style={{ marginBottom: 'var(--space-md)' }}>
              ✦ How It Works
            </div>
            <h2>Three Steps to <span style={{ color: 'var(--lime)' }}>Perfect</span></h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-xl)', maxWidth: '900px', margin: '0 auto' }}>
            {[
              { step: '01', title: 'Describe Your Vision', desc: 'Pick your event type, set your budget, guest count, and tell us about your dream celebration.', color: 'var(--lime)' },
              { step: '02', title: 'AI Generates Your Plan', desc: 'Our AI analyzes your requirements and generates a comprehensive plan with budgets, timelines, and vendors.', color: 'var(--violet)' },
              { step: '03', title: 'Refine & Execute', desc: 'Chat with Velora AI to fine-tune details, get vendor tips, and turn your plan into reality.', color: 'var(--dragon)' },
            ].map(({ step, title, desc, color }) => (
              <div key={step} className="card" style={{ textAlign: 'center', padding: 'var(--space-2xl)' }}>
                <div style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '3rem',
                  fontWeight: 900,
                  color,
                  opacity: 0.3,
                  marginBottom: 'var(--space-sm)',
                  lineHeight: 1,
                }}>
                  {step}
                </div>
                <h3 style={{ marginBottom: 'var(--space-sm)' }}>{title}</h3>
                <p style={{ fontSize: '0.88rem' }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section" aria-label="Call to action" style={{ borderTop: '1px solid var(--border-subtle)' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={{ marginBottom: 'var(--space-md)' }}>
            Ready to{' '}
            <span className="gradient-text" style={{
              background: 'var(--gradient-mesh)',
              backgroundSize: '200% 200%',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              Celebrate
            </span>
            ?
          </h2>
          <p style={{ maxWidth: '450px', margin: '0 auto var(--space-xl)' }}>
            Start planning your dream event in seconds. No sign-up required.
          </p>
          <div style={{ display: 'flex', gap: 'var(--space-md)', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/planner" className="btn btn-primary btn-lg" aria-label="Begin planning your event">
              ⚡ Start Free
            </a>
            <a href="/chat" className="btn btn-accent btn-lg" aria-label="Chat with Velora AI">
              💬 Ask Velora
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
