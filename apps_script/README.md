# Google Sheet Senkronizasyon Köprüsü

Bu klasör, `proje.ocianix.com` ↔ Google Sheet iki yönlü senkronu için Apps Script kodunu içerir.

## Dosyalar

- **Code.gs** — Web app handler (`doGet`/`doPost`), CRUD, kolon eşleşmesi
- **seed.gs** — Excel'deki 46 projenin sabit array'i (`SEED_PROJECTS`)

## Kurulum (5 dakika)

1. **Sheet oluştur**
   - Drive klasöründe ([Ocianix Projeler](https://drive.google.com/drive/folders/130ZtMupBUogh5s6InNO_ceF56mn0urBb)) yeni Sheet aç.
   - Adı: `Ocianix Projeler Master`
   - İlk sekmeyi `Sayfa1` olarak bırak.

2. **Apps Script ekle**
   - Sheet'te `Extensions → Apps Script` aç.
   - Default `Code.gs` içeriğini sil → bu klasördeki `Code.gs`'i yapıştır.
   - Sol panelden `+` → Script → adını `seed` yap → bu klasördeki `seed.gs`'i yapıştır.
   - `Code.gs` içindeki `ADMIN_TOKEN` değerini güçlü bir tokenla değiştir (ör. `openssl rand -hex 24`). Kaydet.

3. **Excel verisini sheet'e doldur**
   - Apps Script editörünün üstündeki fonksiyon dropdown'unda `seedFromConstant` seç → ▶ Run.
   - İlk çalıştırmada Google izin isteyecek (kendi hesabın için yetkilendir).
   - Sheet'e dön → 46 satır + tüm başlıklarla dolu olmalı.

4. **Web App olarak deploy et**
   - `Deploy → New deployment → Type: Web app`
   - Description: `proje.ocianix.com sync`
   - Execute as: **Me**
   - Who has access: **Anyone**
   - Deploy → URL'yi kopyala (`https://script.google.com/macros/s/.../exec` formatında)

5. **Site'a bağla**
   - Site'ta sol menüden **Sheet Senkron**'a tıkla.
   - **Apps Script Web App URL** kutusuna deploy URL'sini yapıştır.
   - **Admin Token** kutusuna `Code.gs`'teki tokenın aynısını gir.
   - **Kaydet** → **Bağlantı Testi** → yeşil OK görmen lazım.

## Sonrası

- Sheet'te yapılan değişiklik → site polling süresinde (varsayılan 30 sn) ekrana yansır.
- Site'ta Yeni Proje / Düzenle / Sil → anında Sheet'e POST → tekrar fetch.
- Sheet ham veri (Excel başlıkları) tutuyor; site `status`/`projectType`/`progress`/`websiteUrl`/`websiteUrlPlaceholder` türev alanlarını okuma sırasında üretiyor.

## Güvenlik notları

- ADMIN_TOKEN paylaşma — yalnızca yazma korumalı. Okuma `doGet` herkese açık (canlı sitede projeler kısmı zaten public).
- Token değiştirmek istersen: `Code.gs` içinde değiştir → tekrar Deploy → site'ta yeni token'ı gir.
- Sheet'e başkası okuyabilir/yazabilir mi? Hayır — sheet `Anyone with link can view` yapmadıkça sadece Apps Script üzerinden erişiliyor, o da token doğrulamasıyla.

## Sorun giderme

- **CORS hatası**: Bu kurulumda yok çünkü `text/plain` body kullanıyoruz — preflight tetiklenmiyor.
- **`unauthorized`**: Token uyuşmuyor. Site'taki ile `Code.gs`'teki birebir aynı olmalı.
- **`unknown_action`**: Site eski versiyon → güncelle.
- **Sheet'i sıfırdan yeniden seed etmek**: Apps Script editöründe `seedFromConstant`'ı tekrar çalıştır.
