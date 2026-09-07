import Link from "next/link";
export default function NotFound() {
  return (
    <main id="main" className="register-public container page-head">
      <p className="eyebrow">404</p>
      <h1>Page not found</h1>
      <p>This page is unavailable or has not been published.</p>
      <Link className="btn" href="/work">Browse work →</Link>
    </main>
  );
}
