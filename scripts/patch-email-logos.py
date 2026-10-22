from pathlib import Path

old = """              <p style=\"margin:0;font-size:22px;font-weight:800;letter-spacing:-0.04em;color:#ffffff;\">
                Veto<span style=\"color:#5eead4;\">Crm</span>
              </p>
              <p style=\"margin:8px 0 0;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:rgba(244,251,249,0.75);font-weight:600;\">"""

new = """              <table role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\">
                <tr>
                  <td style=\"vertical-align:middle;padding-right:12px;\">
                    <img src=\"https://www.vetocrm.com/logo.png\" width=\"40\" height=\"40\" alt=\"VetoCrm\" style=\"display:block;border-radius:8px;border:0;\" />
                  </td>
                  <td style=\"vertical-align:middle;\">
                    <p style=\"margin:0;font-size:22px;font-weight:800;letter-spacing:-0.04em;color:#ffffff;\">
                      Veto<span style=\"color:#5eead4;\">Crm</span>
                    </p>
                  </td>
                </tr>
              </table>
              <p style=\"margin:10px 0 0;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:rgba(244,251,249,0.75);font-weight:600;\">"""

root = Path(__file__).resolve().parents[1] / "supabase" / "templates"
for p in root.glob("*.html"):
    text = p.read_text(encoding="utf-8")
    if old not in text:
        print("MISS", p.name)
        continue
    p.write_text(text.replace(old, new), encoding="utf-8")
    print("OK", p.name)
