
export default function Footer() {
  return (
    <footer className="footer">
      <a href="/" className="brand footer-brand">
        <span className="brand-icon">K</span>
        <span>
          Ketek<span className="brand-light">Book</span>
        </span>
      </a>

      <p>Less planning. More playing.</p>

      <span>
        © {new Date().getFullYear()} KetekBook.
        All rights reserved.
      </span>
    </footer>
  );
}
