const fs=require("fs"),path=require("path");
const k=require("C:/Users/ben/Desktop/Musteri-Avcisi-Pro/veri/ayarlar.json").placesKey;
(async()=>{
const r=await fetch("https://places.googleapis.com/v1/places/ChIJu-e2S3qlyhQRqUqEAdVxJaA",{headers:{"X-Goog-Api-Key":k,"X-Goog-FieldMask":"photos"}});
const j=await r.json(); const ph=j.photos||[]; fs.mkdirSync("ham-foto",{recursive:true});
const liste=[];
for(const [i,p] of ph.entries()){
 const u="https://places.googleapis.com/v1/"+p.name+"/media?maxWidthPx=1600&key="+k;
 const b=Buffer.from(await (await fetch(u)).arrayBuffer()); const f="ham-foto/g"+(i+1)+".jpg"; fs.writeFileSync(f,b);
 liste.push({f,w:p.widthPx,h:p.heightPx,yazar:(p.authorAttributions||[]).map(a=>a.displayName).join(", ")});
}
fs.writeFileSync("ham-foto/kaynak.json",JSON.stringify(liste,null,1)); console.log(JSON.stringify(liste,null,1));
})().catch(e=>console.log("HATA",e.message));
