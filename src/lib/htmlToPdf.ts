/** Largeur A4 en pixels (~96 dpi) — stable pour html2canvas */
const A4_WIDTH_PX = 794;

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

function prepareTarget(doc: Document): HTMLElement {
  const target = doc.querySelector(".report-root") as HTMLElement | null;
  if (!target) throw new Error("Document de rapport invalide.");
  target.style.width = `${A4_WIDTH_PX}px`;
  target.style.maxWidth = `${A4_WIDTH_PX}px`;
  target.style.background = "#ffffff";
  return target;
}

async function renderPdfFromElement(target: HTMLElement, filename: string, scrollY = 0): Promise<void> {
  const html2pdf = (await import("html2pdf.js")).default;
  await html2pdf()
    .set({
      margin: [8, 8, 8, 8],
      filename,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: "#ffffff",
        scrollX: 0,
        scrollY: -scrollY,
      },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      pagebreak: { mode: ["css", "legacy"] },
    } as any)
    .from(target)
    .save();
}

function loadHtmlInWindow(html: string): Window | null {
  // Fenêtre hors écran : rendu complet comme « Imprimer », sans flash visible
  const win = window.open("", "_blank", `width=${A4_WIDTH_PX + 40},height=900,left=9999,top=0`);
  if (!win) return null;
  win.document.open();
  win.document.write(html);
  win.document.close();
  return win;
}

async function renderViaPopup(html: string, filename: string): Promise<boolean> {
  const win = loadHtmlInWindow(html);
  if (!win) return false;

  try {
    await waitForImages(win.document.body);
    await new Promise((r) => setTimeout(r, 600));
    const target = prepareTarget(win.document);
    await renderPdfFromElement(target, filename, win.scrollY);
    return true;
  } finally {
    win.close();
  }
}

async function renderViaIframe(html: string, filename: string): Promise<void> {
  const iframe = document.createElement("iframe");
  iframe.setAttribute("aria-hidden", "true");
  iframe.style.cssText = [
    "position:fixed",
    "top:0",
    "left:0",
    `width:${A4_WIDTH_PX}px`,
    "height:100vh",
    "border:none",
    "opacity:0.01",
    "pointer-events:none",
    "z-index:-1",
  ].join(";");
  document.body.appendChild(iframe);

  const doc = iframe.contentDocument || iframe.contentWindow?.document;
  if (!doc) {
    document.body.removeChild(iframe);
    throw new Error("Impossible de générer le PDF.");
  }

  doc.open();
  doc.write(html);
  doc.close();

  try {
    await waitForImages(doc.body);
    await new Promise((r) => setTimeout(r, 600));
    const target = prepareTarget(doc);
    iframe.style.height = `${Math.max(target.scrollHeight, 900)}px`;
    await renderPdfFromElement(target, filename);
  } finally {
    document.body.removeChild(iframe);
  }
}

/**
 * Génère un PDF à partir du même HTML que l'impression.
 */
export async function downloadHtmlAsPdf(html: string, filename: string): Promise<void> {
  const viaPopup = await renderViaPopup(html, filename);
  if (!viaPopup) {
    await renderViaIframe(html, filename);
  }
}

export async function printHtml(html: string): Promise<void> {
  const win = loadHtmlInWindow(html);
  if (!win) {
    throw new Error("Autorisez les popups pour imprimer le rapport.");
  }
  setTimeout(() => {
    win.print();
  }, 600);
}
