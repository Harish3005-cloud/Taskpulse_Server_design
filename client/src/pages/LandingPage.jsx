import { Link } from 'react-router-dom';
import './LandingPage.css';

const features = [
  {
    icon: '🤖',
    title: 'AI-Powered Prioritization',
    description: 'Let AI analyze your tasks and suggest priorities, deadlines, and categories automatically.'
  },
  {
    icon: '⚡',
    title: 'Real-Time Collaboration',
    description: 'See updates instantly across your team. WebSocket-powered live task updates.'
  },
  {
    icon: '📊',
    title: 'Weekly AI Digests',
    description: 'Get automated weekly summaries with insights on your team\'s productivity and blockers.'
  },
  {
    icon: '🏢',
    title: 'Multi-Tenant Workspaces',
    description: 'Create isolated workspaces for different teams or projects with role-based access.'
  },
  {
    icon: '🔒',
    title: 'Enterprise Security',
    description: 'JWT authentication, refresh token rotation, and full data isolation between tenants.'
  },
  {
    icon: '📈',
    title: 'Smart Analytics',
    description: 'Track completion rates, overdue tasks, and team velocity with cached dashboards.'
  }
];

export default function LandingPage() {
  return (
    <div className="landing">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-glow hero-glow-1"></div>
          <div className="hero-glow hero-glow-2"></div>
          <div className="hero-grid"></div>
        </div>

        <div className="container hero-content">
          <div className="hero-badge animate-fade-in-up">
            <span className="badge-dot"></span>
            AI-Powered Task Management
          </div>

          <h1 className="hero-title animate-fade-in-up delay-100">
            Manage tasks at the
            <br />
            <span className="gradient-text">speed of thought</span>
          </h1>

          <p className="hero-subtitle animate-fade-in-up delay-200">
            TaskPulse uses AI to automatically prioritize, categorize, and score your tasks.
            <br />
            Built for teams that ship fast.
          </p>

          <div className="hero-cta animate-fade-in-up delay-300">
            <Link to="/login" className="btn btn-primary btn-lg" id="hero-get-started">
              Get Started — It's Free
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
            <a href="#features" className="btn btn-secondary btn-lg">
              See Features
            </a>
          </div>

          <div className="hero-stats animate-fade-in-up delay-400">
            <div className="stat">
              <span className="stat-value">10x</span>
              <span className="stat-label">Faster prioritization</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat">
              <span className="stat-value">100%</span>
              <span className="stat-label">Test coverage target</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat">
              <span className="stat-value">∞</span>
              <span className="stat-label">Free tier tasks</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features" id="features">
        <div className="container">
          <div className="section-header animate-fade-in-up">
            <h2 className="section-title">
              Everything you need to
              <span className="gradient-text"> ship faster</span>
            </h2>
            <p className="section-subtitle">
              Production-grade task management with AI scoring, real-time updates, and team collaboration.
            </p>
          </div>

          <div className="features-grid">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="feature-card card animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="feature-icon">{feature.icon}</div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-desc">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-card card-glass animate-fade-in-up">
            <h2 className="cta-title">Ready to supercharge your workflow?</h2>
            <p className="cta-subtitle">
              Start managing tasks with AI in under 30 seconds. No credit card required.
            </p>
            <Link to="/login" className="btn btn-primary btn-lg" id="cta-get-started">
              Start Building Now
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container footer-inner">
          <div className="footer-brand">
            <span>⚡</span> TaskPulse
          </div>
          <p className="footer-copy">
            Built with Node.js, Express, MongoDB, Redis & React
          </p>
        </div>
      </footer>
    </div>
  );
}
