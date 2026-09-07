# REGISTER prototype inventory

The approved reference is `design/public-site.html`, `design/admin.html`, and `design/design-system.md`. The HTML files embed all CSS, JavaScript and SVG markup. There are no bundled image/font files; artwork is CSS-generated and fonts use Google Fonts declarations.

## Screens and components

Public: cover opening; selected-work variants `wr-a/b/c/d`; numbered registration section headings; discipline hover previews; statement; profile/contact teasers; visual archive with spans `8,4,4,8,6,6,5,7,12`; index archive; detail metadata/narrative/gallery/next project; About; Contact; ink footer.

Shared public behavior: fixed header, full-screen mobile navigation, left-drawn nav underline, 650ms ink veil (route change at 340ms), pointer label offset by 16px, artwork scale 1.035, one homepage load-in. Reduced motion collapses duration.

Admin: centered login; sticky identity/navigation; three plain statistics; catalogue project rows with hover actions; 2:1 editor and sidebar; category chips; segmented status/featured controls; image dropzone; four-column gallery; five-column media library; profile/social settings; bottom toast lasting 2200ms.

## Responsive rules

Public: menu/opening at 760px; work rows at 900px; disciplines, narrative, gallery, About at 860px; archive/index/capabilities at 700px. Admin: editor/media at 900px; project rows at 760px; statistics at 640px; form rows/media at 560px. Prototype selectors and exact declarations are ported rather than reinterpreted.

## Infrastructure gaps

- Archive identity must be independent of `sortOrder`. Add a sequence-backed, immutable number with deterministic backfill.
- Preserve `projectContext`; backfill a separate Brief and add Direction/Result.
- Store manual project-title line breaks, homepage row variant, artwork aspect and the three gallery slot semantics.
- Add editable statement, profile/contact headlines, booking note, opening edition, introductory disciplines, workflow tools and availability list to settings.
- Replace fake hash routing and local state with Next routes, authenticated server actions and persistent CMS data. Keep SEO, draft privacy, storage ownership and deletion protections.
- Media editing, category management, SEO and destructive confirmations remain available through restrained controls using the prototype's existing form patterns.

Reference files remain unchanged. Prototype sample claims are not copied into production content. Visual comparisons use the same viewport, loaded fonts, and explicitly marked test content; artwork comes through the CMS image pipeline.
