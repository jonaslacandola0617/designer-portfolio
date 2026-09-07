export function RegistrationMark({ veil = false }: { veil?: boolean }) {
  const size = veil ? 64 : 24;
  const c = size / 2;
  return (
    <svg
      className={veil ? "veil-mark" : "reg-mark"}
      viewBox={`0 0 ${size} ${size}`}
      aria-hidden="true"
    >
      <circle
        cx={c}
        cy={c}
        r={veil ? 14 : 6}
        stroke="currentColor"
        fill="none"
        strokeWidth="1.4"
      />
      <line
        x1={c}
        y1="0"
        x2={c}
        y2={size}
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <line
        x1="0"
        y1={c}
        x2={size}
        y2={c}
        stroke="currentColor"
        strokeWidth="1.4"
      />
    </svg>
  );
}
export function JLMonogram({ admin = false }: { admin?: boolean }) {
  return (
    <span className={admin ? "jl-mark" : "brand-mark"} aria-hidden="true">
      <span>JL</span>
    </span>
  );
}
export function SectionHead({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="section-head">
      <div className="section-number">
        <RegistrationMark />
        <span className="eyebrow">
          {number} — {title}
        </span>
      </div>
      {children}
    </div>
  );
}
