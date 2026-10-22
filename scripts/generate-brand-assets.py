from pathlib import Path
import base64
import io

from PIL import Image

src = Path(
    r"C:\Users\bilal\.cursor\projects\c-Users-bilal-Desktop-Stage-Vetoapp\assets"
    r"\c__Users_bilal_AppData_Roaming_Cursor_User_workspaceStorage_fb75176d847762fe0ed3b4cd0b8a1544_images_logo-complet-9dd9c134-63bf-4aff-9013-044a839f5bdd.png"
)
out = Path(r"C:\Users\bilal\Desktop\Stage\Vetoapp\public")

im = Image.open(src).convert("RGBA")
w, h = im.size
side = min(w, h)
left = (w - side) // 2
top = (h - side) // 2
square = im.crop((left, top, left + side, top + side))

logo512 = square.resize((512, 512), Image.Resampling.LANCZOS)
logo512.save(out / "logo.png", optimize=True)
logo512.save(out / "favicon-512.png", optimize=True)

square.resize((32, 32), Image.Resampling.LANCZOS).save(out / "favicon-32.png", optimize=True)
square.resize((180, 180), Image.Resampling.LANCZOS).save(out / "apple-touch-icon.png", optimize=True)

logo512.save(
    out / "favicon.ico",
    format="ICO",
    sizes=[(16, 16), (32, 32), (48, 48)],
)

# Favicon SVG embeds the real mark for pixel-perfect match in browsers that prefer SVG
png256 = square.resize((256, 256), Image.Resampling.LANCZOS)
buf = io.BytesIO()
png256.save(buf, format="PNG", optimize=True)
b64 = base64.b64encode(buf.getvalue()).decode("ascii")
(out / "favicon.svg").write_text(
    f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" role="img" aria-label="VetoCrm">'
    f'<image href="data:image/png;base64,{b64}" width="256" height="256"/></svg>\n',
    encoding="utf-8",
)

for n in [
    "logo.png",
    "favicon-512.png",
    "favicon-32.png",
    "apple-touch-icon.png",
    "favicon.ico",
    "favicon.svg",
]:
    p = out / n
    print(f"{n}: {p.stat().st_size} bytes")
