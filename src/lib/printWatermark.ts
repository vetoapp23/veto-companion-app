/**
 * Filigrane pour les documents imprimés des comptes Découverte (gratuit).
 * À injecter dans le HTML d'impression : voir buildWatermarkHtml().
 */

export const WATERMARK_TEXT = "VetoCrm.com · Plan Découverte";

export const watermarkStyle = `
  .vp-watermark {
    position: fixed;
    inset: 0;
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
    overflow: hidden;
  }
  .vp-watermark span {
    font-family: Arial, sans-serif;
    font-size: 90px;
    font-weight: 800;
    color: rgba(120,120,120,0.18);
    text-transform: uppercase;
    letter-spacing: 4px;
    transform: rotate(-32deg);
    white-space: nowrap;
    border: 6px solid rgba(120,120,120,0.18);
    padding: 12px 40px;
    border-radius: 8px;
  }
  .vp-watermark-footer {
    position: fixed;
    bottom: 6px;
    left: 0;
    right: 0;
    text-align: center;
    font-family: Arial, sans-serif;
    font-size: 10px;
    color: #999;
    letter-spacing: 1px;
  }
  @media print {
    .vp-watermark, .vp-watermark-footer { display: flex; }
  }
`;

export function buildWatermarkHtml(show: boolean): string {
  if (!show) return "";
  return `
    <div class="vp-watermark"><span>${WATERMARK_TEXT}</span></div>
    <div class="vp-watermark-footer">Document généré avec VetoCrm.com — Passez à un pack payant pour retirer ce filigrane</div>
  `;
}

/**
 * Lit le plan courant via fetch direct (utilisable hors hook).
 * Retourne true si le plan est 'free' ou inconnu.
 */
export async function shouldShowWatermark(): Promise<boolean> {
  try {
    const { supabase } = await import("@/integrations/supabase/client");
    const { data } = await supabase.rpc("get_organization_quota" as any);
    const code = (data as any)?.plan_code;
    return !code || code === "free";
  } catch {
    return true;
  }
}
