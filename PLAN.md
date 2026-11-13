# TespitPro v3 — uygulama planı (uygulayıcı: alt ajan)

Proje: `C:\Users\ben\Desktop\TespitPro-Site`. Derleme: `node uret.js` → `docs/`. Stil: `style.css` (tokenlar `:root`'ta; yeni CSS dosya SONUNA eklenir, mevcut kurallar bozulmaz).
Kurallar: yeni npm bağımlılığı YOK · telefon/adres/puan uydurma YOK · sahte istatistik/yorum/fiyat YOK · Türkçe yazım düzgün · `git push`/yayın YOK · `prefers-reduced-motion` uyulur · klavye ile kullanılabilir.

## A. İçerik tek kaynak: `icerik.json`
`uret.js` içindeki tüm metin/dizi sabitlerini (firma bilgileri, YONTEM, belirtiler, süreç, kimlere, BOLGELER + bölge sayfa metinleri, SSS_ORTAK, hero metinleri) `icerik.json`'a taşı; `uret.js` bunu okusun. Çıktı HTML'i değişmesin (A bitince derle, `docs/index.html` aynı görünmeli).
Yeni alanlar: `slider[] {foto, baslik, metin, alt}`, `talepKonulari[]`, `rehber[] {slug, baslik, ozet, foto|svg, paragraflar[]}`.

## B. Ön yüz eklemeleri
1. **Hero slider** (index): 4 slayt (`akustik-banyo`, `termal-balkon`, `termal-duvar`, `noktasal-acma`), her biri kendi başlık+metin; sol metin + sağ büyük foto düzeni korunur. 6 sn otomatik geçiş, üzerine gelince/odakta durur, önceki/sonraki + nokta düğmeleri, `aria-roledescription="carousel"`. Reduced-motion → otomatik geçiş yok. Yalnız 1. slayt `<h1>`, diğerleri `<p class="h1">`. 1. foto `fetchpriority=high`, diğerleri lazy. Bölge sayfalarında slider yok (mevcut hero kalır).
2. **Talep formu** `#talep` ("Sorun bildir, talep oluştur"): ad*, telefon* (TR cep doğrulama), semt (bölgeler + Diğer), sorun tipi* (seçilebilir çipler = `talepKonulari`), açıklama, zaman (Hemen / Bugün içinde / Randevu). Gönder → biçimli mesajla `https://wa.me/905413730069?text=...` yeni sekmede. Veri saklanmaz. Menüye "Talep oluştur" bağlantısı; bölge sayfalarına da eklenir.
3. **Canlı sohbet balonu** (tüm sayfalar): sağ altta yüzen düğme (mobilde alt çubuğun üstünde), açılınca sohbet paneli: "7/24 çevrimiçi" durumu, karşılama balonu, hızlı yanıt çipleri (Alt kata su iniyor · Su faturam yüksek · Duvarda nem var · Randevu almak istiyorum), metin kutusu + Gönder → WhatsApp'ı o metinle açar. Esc kapatır, odak yönetimi.
4. **Yorumlar şeridi**: iki sıra; üst sıra sola, alt sıra sağa sonsuz kayar (içerik ikilenir, kopya `aria-hidden`), üzerine gelince durur. Reduced-motion → mevcut yatay kaydırma. Alt sıra ters sırada.
5. **Su kaçağı rehberi**: index'te görselli kart bölümü (4–6 kart: kendi fotoğraflar veya basit satır içi SVG çizimler) + yeni sayfa `su-kacagi-rehberi.html` (her yazı bir `<article id=slug>`, Article + FAQ schema, sitemap'e ekle). Konular: Sayaç testiyle kaçak nasıl anlaşılır · Alt kata su iniyorsa ilk yapılacaklar · Termal kamera neyi görür · Akustik dinleme nasıl çalışır · Kırmadan tespit neden daha az masraf demek · Kaçağı geciktirmenin binaya zararları. Doğru, genel bilgi; fiyat yok.

## C. Yerel yönetim paneli (`admin/`)
- `admin/sunucu.js`: Node `http`, yalnız `127.0.0.1:4310`. API: `GET/POST /api/icerik` (POST'ta JSON doğrula, `yedek/icerik-<zaman>.json` yedekle, yaz) · `POST /api/foto` ({ad, dataUrl} → `ham-foto/`'ya kaydet, `python admin/foto.py` ile `docs/img/<ad>-800.webp` + `-1600.webp` üret) · `GET /api/fotolar` · `POST /api/derle` (`node uret.js` çıktısı) · `POST /api/yayinla` (git commit; remote yoksa "yayın adresi ayarlı değil" döner, push etme) · `/onizleme/*` → `docs/` statik.
- `admin/index.html` (vanilla JS): sekmeler Firma · Slider · Yöntemler/Hizmetler · Belirtiler · Bölgeler · SSS · Rehber · Talep konuları · Fotoğraflar (yükle + liste, foto seçici) · Google (google.json özeti; "Google'dan yenile" = derle) · Yayınla (Derle → önizleme iframe → Yayınla). Dizi alanlarında ekle/sil/yukarı/aşağı. Kaydedilmemiş değişiklik uyarısı. Site ile aynı renk tokenları.
- `TespitPro Yonetim.bat`: sunucuyu başlatır, `http://127.0.0.1:4310` açar.

## D. Doğrulama (bitmeden zorunlu)
1. `node uret.js` hatasız. 2. `python -m http.server 18765 --bind 127.0.0.1 --directory docs` + Playwright: 1440 ve 390 viewport ekran görüntüsü (`test/v3-*.png`, tam sayfa DEĞİL, üst + talep + yorumlar bölümleri), konsol hatası 0, yatay taşma 0, slider düğmesi çalışıyor, form gönderiminde açılan URL `wa.me` ve mesaj içeriyor (popup yakala), sohbet balonu açılıyor. 3. Admin: sunucuyu başlat, GET/POST icerik ve derle uç noktalarını test et, kapat. 4. `git add -A && git commit` (push yok).
