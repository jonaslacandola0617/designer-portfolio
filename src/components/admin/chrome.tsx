"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
export function AdminTabs() {
  const path = usePathname();
  return (
    <nav className="admin-nav" aria-label="Administration">
      {["Projects", "Media", "Settings"].map((name) => (
        <Link
          key={name}
          className={
            path.startsWith(`/admin/${name.toLowerCase()}`) ? "is-active" : ""
          }
          href={`/admin/${name.toLowerCase()}`}
          aria-current={
            path.startsWith(`/admin/${name.toLowerCase()}`) ? "page" : undefined
          }
        >
          {name}
        </Link>
      ))}
    </nav>
  );
}
