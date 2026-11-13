# Kullanım: python admin/foto.py <ad>
# ham-foto/<ad>.(jpg|jpeg|png|webp) -> docs/img/<ad>-800.webp ve docs/img/<ad>-1600.webp
import glob
import os
import sys

from PIL import Image, ImageOps

kok = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ad = sys.argv[1] if len(sys.argv) > 1 else ""
if not ad or not all(c.isalnum() or c == "-" for c in ad):
    sys.exit("geçersiz ad")
kaynak = [p for p in glob.glob(os.path.join(kok, "ham-foto", ad + ".*")) if p.lower().endswith((".jpg", ".jpeg", ".png", ".webp"))]
if not kaynak:
    sys.exit("ham foto bulunamadı: " + ad)

im = ImageOps.exif_transpose(Image.open(kaynak[0])).convert("RGB")
cikis = os.path.join(kok, "docs", "img")
os.makedirs(cikis, exist_ok=True)
for genislik in (800, 1600):
    kopya = im
    if im.width > genislik:
        kopya = im.resize((genislik, round(im.height * genislik / im.width)), Image.LANCZOS)
    hedef = os.path.join(cikis, f"{ad}-{genislik}.webp")
    kopya.save(hedef, "WEBP", quality=82, method=6)
    print("yazıldı:", hedef, kopya.size)
