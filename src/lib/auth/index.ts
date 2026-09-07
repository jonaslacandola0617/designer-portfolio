import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { db } from "@/lib/db";
import { loginSchema } from "@/lib/validation";
import { allowLogin } from "./rate-limit";
export const { handlers, auth, signIn, signOut } = NextAuth({
  pages: { signIn: "/admin/login" },
  session: { strategy: "jwt", maxAge: 8 * 60 * 60 },
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(raw) {
        const parsed = loginSchema.safeParse(raw);
        if (!parsed.success || !(await allowLogin(parsed.data.email)))
          return null;
        const user = await db.adminUser.findUnique({
          where: { email: parsed.data.email },
        });
        const valid = await compare(
          parsed.data.password,
          user?.passwordHash ??
            "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxJ3VmwlBKr4WaLQhq6HmMYQf2S",
        );
        return user && valid
          ? { id: user.id, email: user.email, name: user.name }
          : null;
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) token.sub = user.id;
      return token;
    },
    session({ session, token }) {
      if (session.user && token.sub) session.user.id = token.sub;
      return session;
    },
  },
});
export async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const admin = await db.adminUser.findUnique({
    where: { id: session.user.id },
    select: { id: true },
  });
  if (!admin) throw new Error("Unauthorized");
  return admin;
}
