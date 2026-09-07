import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import postcss from "postcss";
const publicHtml = readFileSync("design/public-site.html", "utf8");
const adminHtml = readFileSync("design/admin.html", "utf8");
mkdirSync("src/styles", { recursive: true });
let css = publicHtml.match(/<style>([\s\S]*?)<\/style>/)[1];
const tokens = css.slice(
  css.indexOf(":root{"),
  css.indexOf("@media (prefers-reduced-motion"),
);
writeFileSync("src/styles/tokens.css", tokens);
css = css.slice(css.indexOf("@media (prefers-reduced-motion"));
const tree = postcss.parse(css);
tree.walkRules((rule) => {
  if (
    rule.selector.includes(".art-") ||
    rule.selector.includes(".art-mark") ||
    rule.selector.includes(".art-tag") ||
    rule.selector.includes(".grid-lines")
  )
    rule.remove();
});
writeFileSync("src/styles/public.css", tree.toString());
const admin = postcss.parse(adminHtml.match(/<style>([\s\S]*?)<\/style>/)[1]);
admin.walkRules((rule) => {
  if (rule.selector.includes(".ph")) {
    rule.remove();
    return;
  }
  rule.selector = rule.selector
    .split(",")
    .map((selector) => {
      const s = selector.trim();
      if ([":root", "html", "body"].includes(s)) return ".register-admin";
      return `.register-admin ${s}`;
    })
    .join(",");
});
writeFileSync("src/styles/admin.css", admin.toString());
writeFileSync(
  "src/app/globals.css",
  '@import "../styles/tokens.css";\n@import "../styles/public.css";\n@import "../styles/admin.css";\n@import "../styles/production.css";\n',
);
