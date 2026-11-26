
export default function Header() {
  return (
    <header className="navbar">
      <a href="/" className="brand">
        <span className="brand-icon">K</span>
        <span>
          Ketek<span className="brand-light">Book</span>
        </span>
      </a>

      <nav className="nav-links">
        <a href="/">Home</a>
        <a href="/#courts">Our Courts</a>
        <a href="/#about">About</a>
      </nav>

      <div className="nav-actions">
        <a href="/login" className="login-link">
          Sign in
        </a>

        <a href="/#courts" className="nav-cta">
          Book a Court <span>↗</span>
        </a>
      </div>
    </header>
  );
}
