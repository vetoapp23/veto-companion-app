function waitForImages(root: ParentNode): Promise<void> {
  const images = Array.from(root.querySelectorAll("img"));
  if (images.length === 0) return Promise.resolve();
  return Promise.all(
    images.map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete && img.naturalWidth > 0) {
            resolve();
            return;
          }
          img.onload = () => resolve();
          img.onerror = () => resolve();
        })
    )
  ).then(() => undefined);
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function isMobileUa() {
  if (typeof navigator === "undefined") return false;
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
}

/**
 * Impression via iframe caché — plus fiable sur mobile (pas de popup bloquée).
 */
async function printViaIframe(html: string): Promise<void> {
  const iframe = document.createElement("iframe");
  iframe.setAttribute("title", "print-frame");
  iframe.style.cssText =
    "position:fixed;right:0;bottom:0;width:0;height:0;border:0;opacity:0;pointer-events:none;";
  document.body.appendChild(iframe);

  const win = iframe.contentWindow;
  const doc = win?.document;
  if (!win || !doc) {
    iframe.remove();
    throw new Error("Impossible de préparer l’impression sur cet appareil.");
  }

  doc.open();
  doc.write(html);
  doc.close();

  await waitForImages(doc.body);
  await delay(isMobileUa() ? 600 : 350);

  try {
    win.focus();
    win.print();
  } finally {
    // Laisser le dialogue d’impression s’ouvrir avant de retirer l’iframe
    window.setTimeout(() => {
      try {
        iframe.remove();
      } catch {
        /* ignore */
      }
    }, 60_000);
  }
}

function loadHtmlInWindow(html: string): Window | null {
  const win = window.open("", "_blank");
  if (!win) return null;
  win.document.open();
  win.document.write(html);
  win.document.close();
  return win;
}

/**
 * Ouvre le HTML dans la boîte d'impression du navigateur
 * (Imprimer papier ou « Enregistrer au format PDF » — même rendu CSS).
 * Sur mobile / popup bloquée → iframe (sans nouvel onglet).
 *
 * **Sécurité :** `html` must already be safe for `document.write` — callers that
 * interpolate user/clinic data must escape with `escapeHtml` / `safePrintUrl`
 * before passing HTML here. This helper only writes caller-provided markup.
 */
export async function printHtml(html: string): Promise<void> {
  if (isMobileUa()) {
    await printViaIframe(html);
    return;
  }

  const win = loadHtmlInWindow(html);
  if (!win) {
    // Desktop avec bloqueur de popups
    await printViaIframe(html);
    return;
  }

  await waitForImages(win.document.body);
  await delay(400);
  win.focus();
  win.print();
}

/**
 * Alias du module d'impression (évite html2canvas / html2pdf qui cassent la mise en page).
 * Dans la boîte de dialogue, choisir « Enregistrer au format PDF ».
 *
 * **Sécurité :** same contract as {@link printHtml} — escape untrusted strings upstream.
 */
export async function downloadHtmlAsPdf(html: string, _filename?: string): Promise<void> {
  await printHtml(html);
}
