// TespitPro statik site üretici: `node uret.js` -> docs/
// İçerik: icerik.json (tek kaynak). Google İşletme verisi (puan, yorum sayısı, yorumlar) her derlemede Places API'den tazelenir.
const fs = require("fs"), path = require("path");
const J = JSON.parse(fs.readFileSync(path.join(__dirname, "icerik.json"), "utf8"));
const F = J.firma;

// ---- Sabitler (alan adı alınınca yalnız SITE değişir) ----
const SITE = F.site;
const TEL = F.tel, TEL_GOR = F.telGor;
const WA = "https://wa.me/905413730069?text=" + encodeURIComponent(F.waMesaj);
const MAPS = F.mapsCid;
const YORUM_YAZ = F.yorumYaz;
const PLACE_ID = F.placeId;
const ADRES = F.adres;
const INDEXNOW = F.indexnow;
const GSC_META = fs.existsSync(path.join(__dirname, "gsc-meta.txt")) ? fs.readFileSync(path.join(__dirname, "gsc-meta.txt"), "utf8").trim() : "";
const esc = (t) => String(t || "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
let G = { puan: 5, yorum: 42, yorumlar: [] };
const puanY = () => Number(G.puan || 5).toFixed(1).replace(".", ",");

// ---- İkonlar ----
const IK = {
  tel: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/></svg>',
  wa: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.200 5.1 5.1 0 0 0 1.1 2.7 11.7 11.7 0 0 0 4.5 4c1.7.7 2.300.8 3.2.6a2.7 2.7 0 0 0 1.8-1.2 2.2 2.2 0 0 0 .1-1.2c0-.1-.2-.2-.5-.3z"/></svg>',
  ok: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  logo: '<svg viewBox="0 0 40 40" aria-hidden="true"><rect width="40" height="40" rx="11" fill="#0B2545"/><path d="M20 7c-5.6 7.6-9 12.6-9 17a9 9 0 0 0 18 0c0-4.4-3.4-9.4-9-17z" fill="#F26B1D"/><path d="M15.5 24.5a4.5 4.5 0 0 0 4.5 4.5" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round"/></svg>',
};

const resim = (ad, alt, { genis = "(max-width:980px) 100vw, 50vw", oncelik = false, tek = false } = {}) =>
  `<img src="img/${ad}-800.webp" ${tek ? "" : `srcset="img/${ad}-800.webp 800w, img/${ad}-1600.webp 1600w" sizes="${genis}"`} alt="${alt}" ${oncelik ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">`;

// ---- Schema ----
const isletme = () => ({
  "@context": "https://schema.org", "@type": "Plumber", "@id": SITE + "#isletme",
  name: F.ad, slogan: F.slogan, url: SITE, telephone: TEL,
  image: [SITE + "img/og.jpg", SITE + "img/termal-duvar-1600.webp"], logo: SITE + "logo.svg",
  description: F.tanitim,
  address: { "@type": "PostalAddress", streetAddress: F.adresKisa, addressLocality: F.ilce, addressRegion: F.il, postalCode: F.postaKodu, addressCountry: "TR" },
  geo: { "@type": "GeoCoordinates", latitude: F.enlem, longitude: F.boylam },
  openingHoursSpecification: [{ "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"], opens: "00:00", closes: "23:59" }],
  areaServed: F.alanlar.map((n) => ({ "@type": "Place", name: n + ", İstanbul" })),
  hasMap: MAPS, sameAs: [MAPS],
  makesOffer: F.hizmetler.map((n) => ({ "@type": "Offer", itemOffered: { "@type": "Service", name: n } })),
});

// ---- Ortak bölümler ----
const SSS_ORTAK = J.sssOrtak;

const ust = (s) => `<!doctype html>
<html lang="tr"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>${s.baslik}</title>
<meta name="description" content="${s.aciklama}">
<link rel="canonical" href="${SITE}${s.dosya === "index.html" ? "" : s.dosya}">
<meta name="theme-color" content="#0B2545">
<meta property="og:title" content="${s.baslik}"><meta property="og:description" content="${s.aciklama}">
<meta property="og:type" content="website"><meta property="og:url" content="${SITE}${s.dosya === "index.html" ? "" : s.dosya}">
<meta property="og:image" content="${SITE}img/og.jpg"><meta property="og:locale" content="tr_TR"><meta name="twitter:card" content="summary_large_image">
<meta name="geo.region" content="TR-34"><meta name="geo.placename" content="Bahçelievler, İstanbul"><meta name="geo.position" content="${F.enlem};${F.boylam}">${GSC_META}
<link rel="icon" href="logo.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&family=JetBrains+Mono:wght@500&display=swap" rel="stylesheet">
<link rel="preload" as="image" href="img/${s.heroFoto}-800.webp" imagesrcset="img/${s.heroFoto}-800.webp 800w, img/${s.heroFoto}-1600.webp 1600w" imagesizes="(max-width:980px) 100vw, 50vw">
<link rel="stylesheet" href="style.css">
${s.ekSema || ""}
<script type="application/ld+json">${JSON.stringify(isletme())}</script>
<script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: s.sss.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) })}</script>
${s.dosya === "index.html" ? "" : `<script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "TespitPro", item: SITE }, { "@type": "ListItem", position: 2, name: s.h1, item: SITE + s.dosya }] })}</script>`}
</head><body>
<a class="atla" href="#icerik">İçeriğe geç</a>
<div class="duyuru"><span class="canli" aria-hidden="true"></span>Merkez: Şirinevler · 7/24 su kaçağı tespiti</div>
<header class="ust" id="ust"><div class="kap">
<a class="logo" href="index.html" aria-label="TespitPro ana sayfa">${IK.logo}<span>Tespit<b>pro</b></span></a>
<nav class="menu" aria-label="Ana menü"><a href="index.html#yontem">Nasıl buluyoruz</a><a href="index.html#galeri">Sahadan</a><a href="index.html#yorumlar">Yorumlar</a><a href="index.html#bolgeler">Bölgeler</a><a href="index.html#sss">SSS</a><a href="#talep">Talep oluştur</a></nav>
<a class="btn btn-ana" href="tel:${TEL}">${IK.tel}<span>${TEL_GOR}</span></a>
</div></header>
<div class="termal-cizgi" aria-hidden="true"></div>
<main id="icerik">`;

const heroDefault = (s) => `<section class="hero"><div class="kap">
<div>
<div class="cipler"><span class="cip"><span class="nokta"></span>7/24 açık · gece ve hafta sonu</span><a class="cip" href="${MAPS}"><span class="yildiz">★</span>Google ${puanY()} · ${G.yorum} yorum</a></div>
<h1>${s.heroBaslik}</h1>
<p class="giris">${s.giris}</p>
<div class="btnler"><a class="btn btn-ana" href="tel:${TEL}">${IK.tel}Hemen ara</a><a class="btn btn-wa" href="${WA}">${IK.wa}WhatsApp'tan yaz</a></div>
<p class="semtler">Merkez: <strong>Şirinevler</strong> · Bahçelievler, Esenler, Yenibosna, Güngören, Bakırköy</p>
</div>
<div class="hero-gorsel"><div class="cerceve">${resim(s.heroFoto, s.heroAlt, { oncelik: true })}<span class="tarama" aria-hidden="true"></span></div>
<div class="etiket e1"><strong>Önce buluyoruz, sonra açıyoruz</strong>Kaçağın noktası kesinleşmeden hiçbir yer kırılmaz.</div>
<a class="etiket e2" href="${MAPS}" style="text-decoration:none"><span class="puan">${puanY()}</span><span><strong>Google puanı</strong>${G.yorum} gerçek yorum</span></a>
</div></div></section>`;

const hero = (s) => s.tip === "ana" ? heroSlider() : s.tip === "rehber" ? rehberHero(s) : heroDefault(s);

const heroSlider = () => `<section class="hero hero-slider" aria-label="Öne çıkanlar"><div class="kap">
<div class="cipler"><span class="cip"><span class="nokta"></span>7/24 açık · gece ve hafta sonu</span><a class="cip" href="${MAPS}"><span class="yildiz">★</span>Google ${puanY()} · ${G.yorum} yorum</a></div>
<div class="slider" data-slider aria-roledescription="carousel" aria-label="Öne çıkanlar">
${J.slider.map((s, i) => `<div class="slayt" role="group" aria-roledescription="slide" aria-label="${i + 1} / ${J.slider.length}"${i ? " hidden" : ""}>
<div class="slayt-metin">${i ? `<p class="h1">${s.baslik}</p>` : `<h1>${s.baslik}</h1>`}
<p class="giris">${s.metin}</p>
<div class="btnler"><a class="btn btn-ana" href="tel:${TEL}">${IK.tel}Hemen ara</a><a class="btn btn-wa" href="${WA}">${IK.wa}WhatsApp'tan yaz</a></div>
<p class="semtler">Merkez: <strong>Şirinevler</strong> · Bahçelievler, Esenler, Yenibosna, Güngören, Bakırköy</p>
</div>
<div class="hero-gorsel"><div class="durum-satir"><span class="kirmizi-nokta" aria-hidden="true"></span>CANLI · ${i + 1} / ${J.slider.length}</div><div class="cerceve">${resim(s.foto, s.alt, { oncelik: i === 0 })}<span class="hud">${s.etiket}</span><span class="tarama" aria-hidden="true"></span></div>
<div class="etiket e1"><strong>Önce buluyoruz, sonra açıyoruz</strong>Kaçağın noktası kesinleşmeden hiçbir yer kırılmaz.</div>
<a class="etiket e2" href="${MAPS}" style="text-decoration:none"><span class="puan">${puanY()}</span><span><strong>Google puanı</strong>${G.yorum} gerçek yorum</span></a>
</div></div>`).join("\n")}
<div class="slider-kontrol">
<button class="sk-btn sk-onceki" type="button" aria-label="Önceki slayt">‹</button>
<div class="noktalar">${J.slider.map((s, i) => `<button class="nokta-btn" type="button" aria-label="Slayt ${i + 1}: ${s.etiket}">${String(i + 1).padStart(2, "0")} // ${s.sekme}</button>`).join("")}</div>
<button class="sk-btn sk-sonraki" type="button" aria-label="Sonraki slayt">›</button>
<button class="sk-btn sk-durdur" type="button" aria-pressed="false" aria-label="Slayt geçişini durdur"><span>Durdur</span></button>
</div>
</div></div></section>`;

const rehberHero = (s) => `<section class="hero"><div class="kap">
<div><div class="cipler"><a class="cip" href="index.html">← Ana sayfa</a></div><h1>${s.h1}</h1><p class="giris">${s.giris}</p>
<div class="btnler"><a class="btn btn-ana" href="tel:${TEL}">${IK.tel}Hemen ara</a><a class="btn btn-wa" href="${WA}">${IK.wa}WhatsApp'tan yaz</a></div></div>
<div class="hero-gorsel"><div class="cerceve">${resim(s.heroFoto, s.heroAlt, { oncelik: true })}</div></div>
</div></section>`;

const rehberGorsel = (r) => r.svg || resim(r.foto, r.alt, { genis: "(max-width:980px) 100vw, 33vw" });

const rehberKart = () => `<section class="bolum" id="rehber" aria-labelledby="rh-bas" style="padding-top:0"><div class="kap">
<div class="bolum-bas"><h2 id="rh-bas">Su kaçağı rehberi.</h2><p>Kaçağı nasıl anlarsınız, ilk ne yapmalısınız? Kısa yazılarla anlatıyoruz.</p></div>
<div class="rehber-izgara">
${J.rehber.map((r) => `<a class="rehber-kart" href="su-kacagi-rehberi.html#${r.slug}"><div class="rehber-gorsel">${rehberGorsel(r)}</div><h3>${r.baslik}</h3><p>${r.ozet}</p><span class="devam">Devamını oku ${IK.ok}</span></a>`).join("\n")}
</div>
<div class="btnler" style="margin-top:28px"><a class="btn btn-hayalet" href="su-kacagi-rehberi.html">Tüm rehber ${IK.ok}</a></div>
</div></section>`;

const rehberSayfasi = (s) => `<section class="bolum" style="padding-top:72px"><div class="kap">
${J.rehber.map((r) => `<article class="makale" id="${r.slug}"><h2>${r.baslik}</h2><p class="makale-ozet">${r.ozet}</p><div class="makale-gorsel">${rehberGorsel(r)}</div><div class="metin">${r.paragraflar.map((p) => `<p>${p}</p>`).join("")}</div></article>`).join("\n")}
</div></section>${sss(s.sss)}${talepFormu()}${kapanis}`;

const IKON = {
  kisi: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/></svg>',
  pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>',
  damla: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/></svg>',
};
const talepFormu = () => `<section class="bolum talep" id="talep" aria-labelledby="t-bas" style="padding-top:0"><div class="kap">
<div class="bolum-bas"><h2 id="t-bas">Sorun bildir, talep oluştur.</h2><p>Formu doldurun; mesajınız WhatsApp'ta hazır açılsın. Bilgileriniz sitemizde saklanmaz.</p></div>
<form class="talep-form" id="talepForm" novalidate>
<div class="alan"><label for="tf-ad">Ad Soyad <span aria-hidden="true">*</span></label><div class="girdi">${IKON.kisi}<input id="tf-ad" name="ad" autocomplete="name" maxlength="80" required></div></div>
<div class="alan"><label for="tf-tel">Telefon <span aria-hidden="true">*</span></label><div class="girdi">${IK.tel}<input id="tf-tel" name="tel" type="tel" inputmode="tel" autocomplete="tel" placeholder="05xx xxx xx xx" maxlength="20" required></div></div>
<div class="alan"><label for="tf-semt">Semt</label><div class="girdi">${IKON.pin}<select id="tf-semt" name="semt"><option value="">Seçin</option>${J.bolgeler.map((b) => `<option>${b.ad}</option>`).join("")}<option>Diğer</option></select></div></div>
<fieldset class="alan tam"><legend>Aciliyet</legend><div class="secim-cipler"><label class="cip-sec"><input type="radio" name="zaman" value="Hemen" checked><span>Hemen</span></label><label class="cip-sec"><input type="radio" name="zaman" value="Bugün içinde"><span>Bugün içinde</span></label><label class="cip-sec"><input type="radio" name="zaman" value="Randevu"><span>Randevu</span></label></div></fieldset>
<fieldset class="alan tam"><legend>Sorun tipi <span aria-hidden="true">*</span></legend><div class="secim-cipler">${J.talepKonulari.map((k) => `<label class="cip-sec"><input type="radio" name="konu" value="${esc(k)}"><span>${IKON.damla}${k}</span></label>`).join("")}</div><p class="hata" id="tf-konu-hata" role="alert" hidden></p></fieldset>
<div class="alan tam"><label for="tf-acik">Açıklama</label><textarea id="tf-acik" name="aciklama" rows="4" maxlength="600" placeholder="Nerede, ne zamandır, neler görüyorsunuz?"></textarea></div>
<p class="hata tam" id="tf-hata" role="alert" hidden></p>
<div class="tam talep-butonlar"><button class="btn btn-wa" type="submit">${IK.wa}WhatsApp ile talebi gönder</button><button class="btn btn-lacivert" type="button" id="beniAra">${IK.tel}Beni arayın</button></div>
</form></div></section>`;

const yorumKart = (y) => `<article class="yorum-kart"><span class="yildizlar" aria-label="${y.puan} yıldız">${"★".repeat(Math.round(y.puan || 5))}</span><blockquote>${esc(y.metin.length > 360 ? y.metin.slice(0, 357) + "…" : y.metin)}</blockquote><footer><span class="bas-harf" aria-hidden="true">${esc((y.yazar || "?").trim()[0])}</span><span><strong>${esc(y.yazar)}</strong>${esc(y.once)} · <span class="google-rozet">Google</span></span></footer></article>`;
const yorumSeridi = (l) => {
  const satir = (liste, ters) => `<div class="serit-satir${ters ? " ters" : ""}"${ters ? ' aria-hidden="true"' : ""}><div class="serit-iz"><div class="serit-grup">${liste.map(yorumKart).join("")}</div><div class="serit-grup" aria-hidden="true">${liste.map(yorumKart).join("")}</div></div></div>`;
  return `<div class="yorum-bant">${satir(l, false)}${satir([...l].reverse(), true)}</div>`;
};

const belirtiler = `<section class="koyu belirti" aria-labelledby="b-bas"><div class="kap">
<div><h2 id="b-bas">${J.belirtiler.baslik}</h2><p class="alt">${J.belirtiler.giris}</p><div class="termal-serit" style="max-width:220px;margin-top:28px"></div></div>
<ol>
${J.belirtiler.maddeler.map((m, i) => `<li><span>0${i + 1}</span><strong>${m.baslik}</strong><p>${m.metin}</p><div class="teshis"><b>Teşhis:</b> ${m.teshis}</div></li>`).join("\n")}
</ol></div></section>`;

const yontemler = `<section class="bolum" id="yontem" aria-labelledby="y-bas"><div class="kap">
<div class="bolum-bas"><h2 id="y-bas">${J.yontem.baslik}</h2><p>${J.yontem.giris}</p></div>
<div class="yontem">
<div class="yontem-liste" role="tablist" aria-label="Tespit yöntemleri">
${J.yontem.maddeler.map((m, i) => `<button class="yontem-btn" role="tab" id="yt${i}" aria-controls="yg" aria-selected="${i === 0}" data-foto="${m.foto}" data-alt="${esc(m.alt)}" data-not="${esc(m.baslik)}"><span class="no">0${i + 1}</span><span><strong>${m.baslik}</strong><p>${m.metin}</p></span></button>`).join("\n")}
</div>
<figure class="yontem-gorsel" id="yg" role="tabpanel" aria-live="polite">${resim(J.yontem.maddeler[0].foto, J.yontem.maddeler[0].alt)}<figcaption>${J.yontem.maddeler[0].baslik}</figcaption></figure>
</div></div></section>`;

const surec = `<section class="bolum" style="padding-top:0" aria-labelledby="s-bas"><div class="kap">
<div class="bolum-bas"><h2 id="s-bas">${J.surec.baslik}</h2><p>${J.surec.giris}</p></div>
<ol class="surec">
${J.surec.adimlar.map((a) => `<li><strong>${a.baslik}</strong><p>${a.metin}</p></li>`).join("\n")}
</ol></div></section>`;

const galeri = `<section class="bolum koyu" id="galeri" aria-labelledby="g-bas" style="background:#0E2B4F"><div class="kap">
<div class="bolum-bas"><h2 id="g-bas" style="color:#fff">${J.galeri.baslik}</h2><p style="color:#B9C6D6">${J.galeri.giris}</p></div>
<div class="galeri">
${J.galeri.fotolar.map((f) => `<figure class="${f.sinif}">${resim(f.foto, f.alt, { genis: f.genis, tek: !!f.tek })}<figcaption>${f.etiket}</figcaption></figure>`).join("\n")}
</div></div></section>`;

const yorumlar = () => {
  const l = (G.yorumlar || []).filter((y) => y.metin).slice(0, 8);
  return `<section class="bolum koyu yorum-koyu" id="yorumlar" aria-labelledby="r-bas"><div class="kap">
<div class="bolum-bas"><div class="yorum-bas"><h2 id="r-bas">Müşterilerimiz<br>ne diyor?</h2></div>
<a class="buyuk-puan" href="${MAPS}" style="text-decoration:none"><b>${puanY()}</b><span><span class="yildizlar" aria-label="5 üzerinden ${puanY()}">★★★★★</span><small>Google'da ${G.yorum} yorum</small></span></a></div>
${yorumSeridi(l)}
<div class="btnler" style="margin-top:24px"><a class="btn btn-hayalet" href="${MAPS}">Tüm yorumlar ${IK.ok}</a><a class="btn btn-hayalet" href="${YORUM_YAZ}">Yorum yazın</a></div>
</div></section>`;
};

const kimlere = `<section class="bolum" style="padding-top:0" aria-labelledby="k-bas"><div class="kap">
<div class="bolum-bas"><h2 id="k-bas">${J.kimlere.baslik}</h2><p>${J.kimlere.giris}</p></div>
<div class="kimlere">
${J.kimlere.maddeler.map((m) => `<div><strong>${m.baslik}</strong><p>${m.metin}</p></div>`).join("\n")}
</div></div></section>`;

const bolgeler = `<section class="bolum" id="bolgeler" aria-labelledby="h-bas" style="padding-top:0"><div class="kap">
<div class="bolum-bas"><h2 id="h-bas">Hizmet bölgelerimiz.</h2><p>Merkezimiz Şirinevler Yeşilbağ Sokak'ta; çevre ilçelere kısa sürede ulaşıyoruz.</p></div>
<div class="bolge"><nav class="bolge-liste" aria-label="Bölge sayfaları">
${J.bolgeler.map((b) => b.sayfa ? `<a href="${b.sayfa}">${b.ad}<small>Su kaçağı tespiti ${IK.ok}</small></a>` : `<span>${b.ad}<small>Hizmet veriyoruz</small></span>`).join("\n")}
</nav>
<div class="harita"><iframe loading="lazy" title="TespitPro konumu, Şirinevler" referrerpolicy="no-referrer-when-downgrade" src="https://maps.google.com/maps?q=${F.enlem},${F.boylam}&z=15&output=embed"></iframe></div>
</div></div></section>`;

const sss = (l) => `<section class="bolum" id="sss" aria-labelledby="q-bas" style="padding-top:0"><div class="kap">
<div class="bolum-bas"><h2 id="q-bas">Sık sorulanlar.</h2></div>
<div class="sss">${l.map(([q, a]) => `<details><summary>${q}</summary><p>${a}</p></details>`).join("\n")}</div>
</div></section>`;

const kapanis = `<section class="kapanis"><div class="kap"><div class="kutu">
<div><h2>Kaçağı var,<br>biz buluruz.</h2><p>Gece ya da gündüz fark etmez. Arayın, belirtileri anlatın; ne yapmanız gerektiğini telefonda söyleyelim.</p></div>
<div><a class="tel" href="tel:${TEL}">${TEL_GOR}</a><div class="btnler"><a class="btn btn-ana" href="tel:${TEL}">${IK.tel}Hemen ara</a><a class="btn btn-wa" href="${WA}">${IK.wa}WhatsApp</a><a class="btn btn-hayalet-acik" href="#talep">Online talep formu</a></div></div>
</div></div></section>`;

const WA_BASE = WA.split("?")[0] + "?text=";
const SOHBET = `<button class="sohbet-ac" id="sohbetAc" type="button" aria-expanded="false" aria-controls="sohbet">${IK.wa}<span>7/24 WhatsApp · Fotoğraf gönderin</span></button>
<section class="sohbet" id="sohbet" role="dialog" aria-labelledby="sh-bas" hidden>
<header class="sohbet-bas"><div><strong id="sh-bas">TespitPro</strong><span class="sohbet-durum"><span class="nokta"></span>7/24 çevrimiçi</span></div><button class="sohbet-kapat" id="sohbetKapat" type="button" aria-label="Sohbeti kapat">×</button></header>
<div class="sohbet-govde" id="shGovde" aria-live="polite"><div class="balon gelen">Merhaba! Su kaçağı belirtinizi yazın, WhatsApp'tan ekibimize iletelim.</div></div>
<div class="hizli">${["Alt kata su iniyor", "Su faturam yüksek", "Duvarda nem var", "Randevu almak istiyorum"].map((t) => `<button type="button">${t}</button>`).join("")}</div>
<form class="sohbet-form" id="shForm"><label class="sr" for="shMetin">Mesajınız</label><textarea id="shMetin" rows="2" maxlength="400" placeholder="Mesajınızı yazın"></textarea><button class="btn btn-wa" type="submit">Gönder</button></form>
</section>`;
const SCRIPT_B = String.raw`<script>
(function(){
var WA_BASE="${WA_BASE}";
var rm=matchMedia("(prefers-reduced-motion: reduce)").matches;
function waAc(m){var a=document.createElement("a");a.href=WA_BASE+encodeURIComponent(m);a.target="_blank";a.rel="noopener";document.body.appendChild(a);a.click();a.remove()}
var sl=document.querySelector("[data-slider]");
if(sl){
 var sd=[].slice.call(sl.querySelectorAll(".slayt")),nk=[].slice.call(sl.querySelectorAll(".nokta-btn")),pb=sl.querySelector(".sk-durdur"),i=0,t=null,elle=false,ustte=false,odakta=false;
 function git(n){i=(n+sd.length)%sd.length;sd.forEach(function(s,k){s.hidden=k!==i});nk.forEach(function(b,k){b.setAttribute("aria-current",k===i?"true":"false")})}
 function guncelle(){clearInterval(t);t=null;if(!rm&&!elle&&!ustte&&!odakta)t=setInterval(function(){git(i+1)},6000)}
 sl.addEventListener("mouseenter",function(){ustte=true;guncelle()});
 sl.addEventListener("mouseleave",function(){ustte=false;guncelle()});
 sl.addEventListener("focusin",function(){odakta=true;guncelle()});
 sl.addEventListener("focusout",function(){odakta=false;guncelle()});
 pb.addEventListener("click",function(){elle=!elle;pb.setAttribute("aria-pressed",String(elle));pb.querySelector("span").textContent=elle?"Oynat":"Durdur";pb.setAttribute("aria-label",elle?"Slayt geçişini başlat":"Slayt geçişini durdur");guncelle()});
 sl.querySelector(".sk-onceki").addEventListener("click",function(){git(i-1)});
 sl.querySelector(".sk-sonraki").addEventListener("click",function(){git(i+1)});
 nk.forEach(function(b,k){b.addEventListener("click",function(){git(k)})});
 git(0);guncelle();
}
var f=document.getElementById("talepForm");
if(f){
 var hata=document.getElementById("tf-hata"),kh=document.getElementById("tf-konu-hata");
 function hataGoster(el,m){hata.textContent=m;hata.hidden=false;el.focus()}
 f.addEventListener("submit",function(e){
  e.preventDefault();hata.hidden=true;kh.hidden=true;
  var ad=f.ad.value.trim(),tel=f.tel.value.replace(/[\s()\-]/g,""),konu=f.querySelector('input[name="konu"]:checked');
  if(ad.length<2)return hataGoster(f.ad,"Lütfen adınızı yazın.");
  if(!/^(?:\+?90|0)?5\d{9}$/.test(tel))return hataGoster(f.tel,"Geçerli bir cep telefonu numarası yazın (05xx xxx xx xx).");
  if(!konu){kh.textContent="Lütfen bir sorun tipi seçin.";kh.hidden=false;f.konu[0].focus();return}
  var m=["Merhaba, su kaçağı için talep oluşturmak istiyorum.","Ad: "+ad,"Telefon: "+f.tel.value.trim(),"Semt: "+(f.semt.value||"Belirtilmedi"),"Sorun: "+konu.value,"Zaman: "+f.zaman.value];
  var acik=f.aciklama.value.trim();if(acik)m.push("Açıklama: "+acik);
  waAc(m.join("\n"));
 });
}
var ba=document.getElementById("beniAra");
if(ba)ba.addEventListener("click",function(){var ad=f.ad.value.trim(),tel=f.tel.value.trim(),m="Merhaba, beni arayın.";if(ad)m+=" Adım: "+ad+".";if(tel)m+=" Telefon: "+tel;waAc(m)});
var sb=document.getElementById("sohbetAc");
if(sb){
 var sh=document.getElementById("sohbet"),sk=document.getElementById("sohbetKapat"),tx=document.getElementById("shMetin"),gv=document.getElementById("shGovde"),sf=document.getElementById("shForm");
 function balon(m,c){var d=document.createElement("div");d.className="balon "+c;d.textContent=m;gv.appendChild(d);gv.scrollTop=gv.scrollHeight}
 function sohbetGoster(a){sh.hidden=!a;sb.setAttribute("aria-expanded",String(a));if(a)tx.focus();else sb.focus()}
 sb.addEventListener("click",function(){sohbetGoster(sh.hidden)});
 sk.addEventListener("click",function(){sohbetGoster(false)});
 document.addEventListener("keydown",function(e){if(e.key==="Escape"&&!sh.hidden)sohbetGoster(false)});
 [].slice.call(sh.querySelectorAll(".hizli button")).forEach(function(b){b.addEventListener("click",function(){tx.value=b.textContent;tx.focus()})});
 sf.addEventListener("submit",function(e){e.preventDefault();var t=tx.value.trim();if(!t){tx.focus();return}balon(t,"giden");waAc(t);tx.value="";balon("WhatsApp'ta mesajınız hazır. Gönderdiğinizde ekibimiz yanıtlar.","gelen")});
}
})();
</script>`;

const alt = () => `</main>
<footer class="alt-bilgi"><div class="kap">
<div><a class="logo" href="index.html">${IK.logo}<span>Tespit<b>pro</b></span></a><p>Kırmadan su kaçağı tespiti ve noktasal onarım.<br>${ADRES}</p><p style="margin-top:10px"><a href="tel:${TEL}">${TEL_GOR}</a> · Her gün 24 saat</p></div>
<div><h3>Bölgeler</h3><ul>${J.bolgeler.filter((b) => b.sayfa).map((b) => `<li><a href="${b.sayfa}">${b.ad} su kaçağı tespiti</a></li>`).join("")}<li><a href="su-kacagi-rehberi.html">Su kaçağı rehberi</a></li></ul></div>
<div><h3>Google</h3><ul><li><a href="${MAPS}">Haritalar'da yol tarifi</a></li><li><a href="${MAPS}">Google yorumları (${puanY()} ★)</a></li><li><a href="${YORUM_YAZ}">Yorum yazın</a></li></ul></div>
<p class="telif">© ${new Date().getFullYear()} TespitPro. Fotoğraflar TespitPro'ya aittir. <span class="imza">Site tasarım: <a href="https://www.erenkoybilgisayar.com.tr/">Erenköy Bilgisayar Teknik Servis</a></span></p>
</div></footer>
<div class="sabit"><a class="btn btn-ana" href="tel:${TEL}">${IK.tel}Ara</a><a class="btn btn-wa" href="${WA}">${IK.wa}WhatsApp</a></div>
<script>
(function(){var u=document.getElementById("ust");addEventListener("scroll",function(){u.classList.toggle("kaydi",scrollY>8)},{passive:true});
var g=document.getElementById("yg");if(!g)return;var im=g.querySelector("img"),fc=g.querySelector("figcaption"),b=[].slice.call(document.querySelectorAll(".yontem-btn"));
b.forEach(function(x,i){x.addEventListener("click",function(){b.forEach(function(y){y.setAttribute("aria-selected",y===x)});var f=x.dataset.foto;im.srcset="img/"+f+"-800.webp 800w, img/"+f+"-1600.webp 1600w";im.src="img/"+f+"-800.webp";im.alt=x.dataset.alt;fc.textContent=x.dataset.not});
x.addEventListener("keydown",function(e){var k={ArrowDown:1,ArrowRight:1,ArrowUp:-1,ArrowLeft:-1}[e.key];if(k){e.preventDefault();var n=b[(i+k+b.length)%b.length];n.focus();n.click()}})});})();
</script>
${SOHBET}
${SCRIPT_B}
</body></html>`;

const bolgeMetni = (ad, paragraflar, mahalleler) => `<section class="bolum" aria-labelledby="m-bas"><div class="kap">
<div class="bolum-bas"><h2 id="m-bas">${ad}'de su kaçağı tespiti.</h2></div>
<div class="metin">${paragraflar.map((p) => `<p>${p}</p>`).join("")}<div class="mahalleler">${mahalleler.map((m) => `<span>${m}</span>`).join("")}</div></div>
</div></section>`;

const SAYFALAR = [...J.sayfalar, J.rehberSayfa].map((ham) => {
  const rehber = ham.tip === "rehber";
  const s = { ...ham, sss: rehber ? J.rehber.map((r) => [r.baslik, r.ozet]) : [...ham.sssEk, ...SSS_ORTAK] };
  if (rehber) s.ekSema = `<script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@type": "Article", headline: ham.h1, description: ham.aciklama, image: SITE + "img/termal-ekran-1600.webp", mainEntityOfPage: SITE + ham.dosya, publisher: { "@type": "Organization", name: F.ad, logo: { "@type": "ImageObject", url: SITE + "logo.svg" } } })}</script>`;
  s.govde = () => s.tip === "ana"
    ? belirtiler + yontemler + surec + galeri + rehberKart() + yorumlar() + kimlere + bolgeler + sss(SSS_ORTAK) + talepFormu() + kapanis
    : rehber ? rehberSayfasi(s)
    : bolgeMetni(s.bolge, s.paragraflar, s.mahalleler) + belirtiler + yontemler + yorumlar() + sss(s.sss) + talepFormu() + kapanis;
  return s;
});

(async () => {
  try {
    const ayar = require("C:/Users/ben/Desktop/Musteri-Avcisi-Pro/veri/ayarlar.json");
    G = await require("C:/Users/ben/Desktop/Musteri-Avcisi-Pro/places.js").detay(ayar.placesKey, PLACE_ID);
    fs.writeFileSync(path.join(__dirname, "google.json"), JSON.stringify(G, null, 1));
  } catch (e) {
    console.log("Google verisi alınamadı, son kayıt kullanılıyor:", e.message);
    try { G = JSON.parse(fs.readFileSync(path.join(__dirname, "google.json"), "utf8")); } catch {}
  }
  const CIKIS = path.join(__dirname, "docs");
  fs.mkdirSync(CIKIS, { recursive: true });
  for (const s of SAYFALAR) fs.writeFileSync(path.join(CIKIS, s.dosya), ust(s) + hero(s) + s.govde(s) + alt());
  fs.copyFileSync(path.join(__dirname, "style.css"), path.join(CIKIS, "style.css"));
  fs.writeFileSync(path.join(CIKIS, "logo.svg"), IK.logo.replace("<svg ", '<svg xmlns="http://www.w3.org/2000/svg" ').replace(' aria-hidden="true"', ""));
  const bugun = new Date().toISOString().slice(0, 10);
  fs.writeFileSync(path.join(CIKIS, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${SAYFALAR.map((s) => `<url><loc>${SITE}${s.dosya === "index.html" ? "" : s.dosya}</loc><lastmod>${bugun}</lastmod></url>`).join("\n")}\n</urlset>\n`);
  fs.writeFileSync(path.join(CIKIS, "robots.txt"), `User-agent: *\nAllow: /\nSitemap: ${SITE}sitemap.xml\n`);
  fs.writeFileSync(path.join(CIKIS, "llms.txt"), `# TespitPro\n\n> Bahçelievler Şirinevler merkezli kırmadan su kaçağı tespiti (termal kamera, akustik dinleme, kameralı inceleme) ve noktasal onarım. 7/24. Google puanı ${puanY()} (${G.yorum} yorum). Telefon ${TEL_GOR}. Adres: ${ADRES}.\n\n${SAYFALAR.map((s) => `- [${s.h1}](${SITE}${s.dosya === "index.html" ? "" : s.dosya})`).join("\n")}\n`);
  fs.writeFileSync(path.join(CIKIS, ".nojekyll"), "");
  fs.writeFileSync(path.join(CIKIS, INDEXNOW + ".txt"), INDEXNOW);
  console.log("Yazıldı:", SAYFALAR.length, "sayfa | Google:", puanY(), "puan,", G.yorum, "yorum,", (G.yorumlar || []).length, "yorum metni");
})();
