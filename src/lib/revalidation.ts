import "server-only";
import { revalidatePath } from "next/cache";
export function invalidatePortfolio() {
  revalidatePath("/", "layout");
  revalidatePath("/sitemap.xml");
}
