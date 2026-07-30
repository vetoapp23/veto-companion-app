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
 */
export async function printHtml(html: string): Promise<void> {
  const win = loadHtmlInWindow(html);
  if (!win) {
    throw new Error("Autorisez les popups pour imprimer le rapport.");
  }
  await waitForImages(win.document.body);
  await new Promise((r) => setTimeout(r, 400));
  win.focus();
  win.print();
}

/**
 * Alias du module d'impression (évite html2canvas / html2pdf qui cassent la mise en page).
 * Dans la boîte de dialogue, choisir « Enregistrer au format PDF ».
 */
export async function downloadHtmlAsPdf(html: string, _filename?: string): Promise<void> {
  await printHtml(html);
}
