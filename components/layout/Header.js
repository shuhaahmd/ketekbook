
import Link from "next/link";

export default function Header() {
  return (
    <header className="navbar">
      <Link href="/" className="brand">
        <span className="brand-icon">K</span>
        <span>
          Ketek<span className="brand-light">Book</span>
        </span>
      </Link>

      <nav className="nav-links">
        <Link href="/">Home</Link>
        <Link href="/#courts">Our Courts</Link>
        <Link href="/#about">About</Link>
      </nav>

      <div className="nav-actions">
        <Link href="/admin/login" className="login-link">
          Admin Sign in
        </Link>

        <Link href="/#courts" className="nav-cta">
          Book a Court
        </Link>
      </div>
    </header>
  );
}
