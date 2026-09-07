import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  if (path.startsWith("/admin") && path !== "/admin/login") {
    const session = await auth();
    const admin = session?.user?.id
      ? await db.adminUser.findUnique({
          where: { id: session.user.id },
          select: { id: true },
        })
      : null;
    if (!admin)
      return NextResponse.redirect(new URL("/admin/login", request.url));
  }
  if (path.startsWith("/work/")) {
    let slug = "";
    try {
      slug = decodeURIComponent(path.slice("/work/".length));
    } catch {
      /* Invalid slugs remain unavailable. */
    }
    const project = await db.project.findFirst({
      where: { slug, status: "PUBLISHED" },
      select: { id: true },
    });
    // Establish the HTTP status before App Router can begin streaming a response.
    if (!project)
      return NextResponse.rewrite(
        new URL("/unavailable-project", request.url),
        { status: 404 },
      );
  }
  return NextResponse.next();
}
export const config = { matcher: ["/admin/:path*", "/work/:slug"] };
