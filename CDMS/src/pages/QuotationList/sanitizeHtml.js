// Edited text is stored as a tiny HTML string so bold/italic/underline
// survive. Because that string is later injected with innerHTML (and may be
// loaded by a different user, e.g. the checker), we whitelist a few inline
// tags and strip everything else.

const ALLOWED = new Set(["B", "STRONG", "I", "EM", "U", "BR"]);
const BLOCKS = new Set(["DIV", "P"]);

export function sanitizeHtml(html) {
  const doc = new DOMParser().parseFromString(
    `<div>${html || ""}</div>`,
    "text/html",
  );
  const root = doc.body.firstChild;

  const walk = (node) => {
    Array.from(node.childNodes).forEach((child) => {
      if (child.nodeType === 3) return; // text
      if (child.nodeType !== 1) {
        node.removeChild(child); // comments etc.
        return;
      }
      walk(child);
      if (ALLOWED.has(child.tagName)) {
        // drop any attributes (style, onclick, ...)
        Array.from(child.attributes).forEach((a) =>
          child.removeAttribute(a.name),
        );
        return;
      }
      // Browsers wrap new lines in <div>/<p> inside contentEditable —
      // keep that as a line break instead of silently merging lines.
      if (BLOCKS.has(child.tagName) && child.previousSibling) {
        node.insertBefore(doc.createElement("br"), child);
      }
      while (child.firstChild) node.insertBefore(child.firstChild, child);
      node.removeChild(child);
    });
  };

  walk(root);
  return root.innerHTML;
}
