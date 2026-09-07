"use client";
export default function AdminError({ reset }: { reset: () => void }) {
  return (
    <main className="register-admin screen admin-view" id="main">
      <div className="container">
      <h1>Unable to load administration</h1>
      <p>
        Please retry. If this continues, check your session and database
        configuration.
      </p>
      <button className="btn" onClick={reset}>Try again</button>
      </div>
    </main>
  );
}
