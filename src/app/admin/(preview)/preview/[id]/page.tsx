import { notFound } from "next/navigation";
import {
  getPreviewProject,
  getSiteSettings,
} from "@/features/projects/queries";
import { ProjectPresentation } from "@/components/public/portfolio";
import { PublicChrome } from "@/components/public/chrome";
export const dynamic = "force-dynamic";
export default async function Preview({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const p = await getPreviewProject((await params).id);
  if (!p) notFound();
  return (
    <PublicChrome settings={await getSiteSettings()}>
      <ProjectPresentation project={p} />
    </PublicChrome>
  );
}
