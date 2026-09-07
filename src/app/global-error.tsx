"use client";
export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <html lang="en">
      <body>
        <main>
          <h1>Unable to load the portfolio</h1>
          <p>Please try again shortly.</p>
          <button onClick={reset}>Try again</button>
        </main>
      </body>
    </html>
  );
}
