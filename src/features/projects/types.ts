export type PublicImage = {
  id: string;
  url: string;
  width: number | null;
  height: number | null;
  altText: string;
};
export type PublicCategory = {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  count: number;
};
export type PublicProjectCard = {
  archiveNumber: number;
  titleLines: string;
  homeLayout: string;
  artworkAspect: string;
  id: string;
  title: string;
  slug: string;
  year: number;
  shortDescription: string;
  sortOrder: number;
  category: { name: string; slug: string };
  coverImage: PublicImage | null;
};
export type PublicProjectDetail = PublicProjectCard & {
  brief: string;
  direction: string;
  result: string;
  status: string;
  role: string;
  disciplines: string[];
  tools: string[];
  projectContext: string;
  seoTitle: string;
  seoDescription: string;
  updatedAt: string;
  gallery: {
    caption: string;
    layout:
      | "FULL"
      | "WIDE"
      | "HALF"
      | "PAIR_LEFT"
      | "PAIR_RIGHT"
      | "DETAIL"
      | "LARGE"
      | "OFFSET_SMALL"
      | "FULL_WIDTH";
    media: PublicImage;
  }[];
};
export type PublicSiteSettings = {
  aboutHeadline: string;
  contactHeadline: string;
  statement: string;
  statementAttribution: string;
  bookingText: string;
  openingEdition: string;
  introDisciplines: string[];
  workflowTools: string[];
  availableFor: string[];
  designerName: string;
  professionalTitle: string;
  email: string;
  location: string;
  availabilityText: string;
  shortBio: string;
  longBio: string;
  capabilities: string[];
  instagramUrl: string;
  behanceUrl: string;
  linkedinUrl: string;
  githubUrl: string;
  defaultSeoTitle: string;
  defaultSeoDescription: string;
  socialImage: PublicImage | null;
};
