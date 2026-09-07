"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main id="main" className="public-main intro">
      <h1>Something went wrong</h1>
      <p>We couldn’t load this page. Please try again shortly.</p>
      <button onClick={reset}>Try again</button>
    </main>
  );
}
