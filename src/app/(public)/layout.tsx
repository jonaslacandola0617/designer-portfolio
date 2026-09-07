import { getSiteSettings } from "@/features/projects/queries";
import { PublicChrome } from "@/components/public/chrome";
export const dynamic = "force-dynamic";
export async function generateMetadata() {
  const s = await getSiteSettings();
  return {
    title: { default: s.defaultSeoTitle, template: `%s | ${s.designerName}` },
    description: s.defaultSeoDescription,
  };
}
export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PublicChrome settings={await getSiteSettings()}>{children}</PublicChrome>
  );
}
