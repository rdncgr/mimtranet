# Mimtranet

Tarayıcı üzerinde çalışan, tamamen tarayıcı yerel depolama (LocalStorage) kullanan, sunucuya ihtiyaç duymayan kapsamlı bir intranet yönetim sistemi.

## 🚀 Özellikler

### 📊 Dashboard
- **Favori Notlar Widget**: Favori olarak işaretlenen notları gösterir
- **Son 5 Not Widget**: En son eklenen 5 notu listeler
- **İstatistikler Widget**: Toplam not, favori not, Excel dosya ve teklif sayılarını gösterir
- **Responsive Tasarım**: 3 sütun (büyük ekran), 2 sütun (orta ekran), 1 sütun (küçük ekran)

### 📝 Notlarım Modülü
- **WYSIWYG Editör**: TinyMCE ile zengin metin düzenleme (Türkçe dil desteği)
- **Favori Sistemi**: Notları favorilere ekleme/çıkarma
- **Arama ve Filtreleme**: Gerçek zamanlı not arama
- **Tablo Görünümü**: Başlık, açıklama ve işlemler sütunları
- **Önizleme Modalı**: Not içeriğini tam ekran görüntüleme
- **Düzenleme ve Silme**: Not güncelleme ve silme işlemleri
- **Dışa/İçe Aktarma**: JSON formatında not yedekleme ve geri yükleme
- **Boş Not Desteği**: Başlık ve içerik zorunluluğu yok

### 🧩 Şablonlar Modülü
- **Şablon Yönetimi**: Şablon oluşturma, düzenleme, silme
- **Parametreler**: "/unvan", "/tarih", "/tutar" gibi dinamik alanlarla içerik üretimi
- **Hazır Metinler**: Sıklıkla kullanılan metin parçalarını kaydetme ve şablona ekleme
- **E-posta Şablonları**: Konu, To ve Cc alanları ile e-posta taslağı hazırlama
- **Önizleme ve Kopyalama**: Parametrelerle doldurulmuş önizlemeyi görme ve içeriği kopyalama
- **E-posta ile Gönderme**: Oluşturulan içeriği e-posta istemcisine aktarma

### 📁 Evraklar Modülü
- **Çoklu Dosya Yükleme**: PDF, Office, görsel vb. dosyaları tek evrak kaydına ekleme
- **Metin İçeriği**: Evraka serbest metin alanı ekleme
- **Arama**: Başlık ve içerikte canlı arama
- **Düzenleme**: Evrak başlığı, içerik ve dosyaları güncelleme
- **Favoriler**: Sık kullanılan evrakları favorilere ekleyip Dashboard’da görüntüleme

### 📋 Teklifler Modülü
- **Kapsamlı Form**: 13 farklı alan ile detaylı teklif kaydı
- **Vade Seçenekleri**: 6, 12, 18, 24, 36, 48, 60 ay seçenekleri
- **Tablo Görünümü**: Tüm teklifleri liste halinde görüntüleme
- **Düzenleme ve Silme**: Teklif güncelleme ve silme
- **E-posta Entegrasyonu**: Otomatik mail konusu ve içerik oluşturma
- **Çoklu Para Birimi**: TL, USD, EUR desteği

### 📊 Excel Dosyaları Modülü
- **Dosya Yükleme**: .xls ve .xlsx dosya desteği
- **HTML Tablo Görünümü**: Excel verilerini web tablosu olarak görüntüleme
- **Sütun Filtreleme**: Her sütun için ayrı ayrı filtreleme
- **Dinamik Menü**: Sidebar'da yüklenen dosyaları listeleme
- **Dosya Silme**: Yüklenen dosyaları kaldırma
- **LocalStorage**: Dosya verilerini tarayıcıda saklama
 - **Sürükle-Bırak Sıralama**: Sol menüde Excel dosyalarının sırasını değiştirme

### 🎨 Kullanıcı Arayüzü
- **Modern Tasarım**: Bootstrap 5 ile responsive tasarım
- **Sidebar Navigasyon**: Kategorili menü sistemi
- **Tema Rengi**: #247BCA ana tema rengi
- **Bildirim Sistemi**: Başarı, uyarı ve hata mesajları
- **Modal Sistemleri**: Tüm işlemler için modal pencereler
- **Responsive Layout**: Mobil, tablet ve masaüstü uyumlu
 - **Karanlık Mod**: Ayarlar panelinden tek tıkla dark mode
 - **Sabit İstatistikler**: Alt kısımda sabit istatistik barı

### 🧮 Araçlar
- **KDV Hesaplama**: KDV hariç/dahil tutar, matrah hesaplama
- **Yüzde Hesaplama**: Değer üzerinden +/− yüzde ve pay oranı

## 📁 Dosya Yapısı

```
Mimtranet/
├── index.html          # Ana HTML dosyası
├── styles.css          # CSS stilleri
├── script.js           # JavaScript fonksiyonları
├── rdncgr.png          # Logo dosyası
├── tinymce/            # TinyMCE editör dosyaları (çekirdek, eklentiler, temalar, diller)
└── README.md           # Bu dosya
```

## 🛠️ Teknolojiler

- **HTML5**: Semantik yapı
- **CSS3**: Modern stillendirme ve animasyonlar
- **JavaScript (Vanilla)**: ES6+ özellikleri
- **Bootstrap 5.3.0**: Responsive framework
- **Bootstrap Icons 1.10.0**: İkon kütüphanesi
- **TinyMCE**: WYSIWYG editör (yerel `tinymce/` klasöründen yüklenir)
- **SheetJS (XLSX)**: Excel dosya işleme

## ⚙️ Ayarlar Paneli

- **Görünüm**: Karanlık mod, istatistik çubuğu aç/kapat
- **Menü Görünürlüğü**: Dashboard, Notlarım, Şablonlar, Evraklar, Teklifler, Araçlar için ayrı ayrı görünürlük
- **Veri Yönetimi**: Tüm veriler veya tekil varlıklar (Notlar, Evraklar, Şablonlar, Parametreler, Hazır Metinler) için JSON dışa/ice aktarma
- **Tanıtım Turu**: Onboarding’i resetleyip yeniden başlatma

## 🎯 Kullanım

### Başlangıç
1. `index.html` dosyasını tarayıcıda açın
2. Sistem otomatik olarak Dashboard sayfasını gösterecektir
3. Sol menüden modüller arası geçiş yapabilirsiniz

### Notlarım Kullanımı
1. "Notlarım" menüsüne tıklayın
2. "Yeni Not Ekle" butonu ile not oluşturun
3. Başlık ve içerik girebilir (zorunlu değil)
4. WYSIWYG editör ile zengin metin düzenleyin
5. Notları favorilere ekleyin
6. Arama kutusu ile notlarda arama yapın
7. Dışa/İçe aktarma ile yedek alın

### Şablonlar Kullanımı
1. "Şablonlar" menüsüne tıklayın
2. "Şablon Ekle" ile yeni şablon oluşturun
3. İçerikte "/parametre" tanımları ve Hazır Metinler’i kullanın
4. E-posta şablonu olarak işaretleyip konu/To/Cc alanlarını doldurun (opsiyonel)
5. Önizleme ekranından içeriği kopyalayın veya e-posta olarak gönderin

### Evraklar Kullanımı
1. "Evraklar" menüsüne tıklayın
2. "Evrak Ekle" ile başlık, içerik ve dosyaları ekleyin (çoklu yükleme)
3. Evrakları liste üstündeki arama ile filtreleyin
4. Kayıtları düzenleyin, dosyaları güncelleyin, favori olarak işaretleyin

### Teklifler Kullanımı
1. "Teklifler" menüsüne tıklayın
2. "Yeni Teklif Ekle" butonu ile teklif oluşturun
3. Tüm alanları doldurun (zorunlu alanlar işaretli)
4. Vade seçeneklerinden birini seçin
5. Teklifi kaydedin ve tabloda görüntüleyin
6. Düzenleme, silme ve mail gönderme işlemlerini yapın

### Excel Dosyaları Kullanımı
1. "Excel Dosyaları" kategorisinden dosya yükleyin
2. Dosya başlığı ve dosyayı seçin
3. Yüklenen dosya sidebar'da listelenecektir
4. Dosyaya tıklayarak HTML tablosu olarak görüntüleyin
5. Sütun filtrelerini kullanarak veri filtreleyin
6. Dosyayı silmek için filtre butonunun yanındaki sil butonunu kullanın
7. Sol menüde dosyaların sırasını sürükle-bırak ile değiştirin

### Araçlar Kullanımı
1. "Araçlar" menüsüne girin
2. Değer, KDV oranı ve/veya yüzde oranını girin
3. Sonuç kartlarından KDV ve yüzde hesaplarını görüntüleyin

## 🔧 Geliştirme

### Yeni Modül Ekleme
1. `index.html` dosyasında sidebar menüsüne yeni link ekleyin
2. Sayfa içeriğini `#page-content` div'i içine ekleyin
3. JavaScript'te gerekli fonksiyonları tanımlayın
4. LocalStorage entegrasyonu için `saveData()` ve `loadData()` fonksiyonlarını kullanın

### Tema Değişiklikleri
CSS dosyasındaki `:root` değişkenlerini düzenleyerek tema rengini değiştirebilirsiniz:

```css
:root {
    --primary-color: #247BCA;
    --primary-hover: #1e6bb8;
}
```

### Veri Yapısı
Sistem şu veri türlerini LocalStorage'da saklar:
- `notes`: Not verileri
- `excelFiles`: Excel dosya verileri
- `teklifler`: Teklif verileri
- `appState`: Uygulama durumu
 - `sablonlar`: Şablon verileri
 - `parametreler`: Şablon parametre tanımları
 - `hazirMetinler`: Şablonlarda kullanılan hazır metinler

### Yerelleştirme
- TinyMCE editörü Türkçe dil dosyası ile gelir (`tinymce/langs/tr.js`).
- Yardım modülünün klavye navigasyon metinleri için Türkçe çeviri mevcuttur (`tinymce/plugins/help/js/i18n/tr.js`).

## 📱 Responsive Özellikler

- **Mobil**: Sidebar gizli, tek sütun layout
- **Tablet**: Sidebar gizli, iki sütun layout
- **Masaüstü**: Sidebar görünür, üç sütun layout
- **Widget Kartları**: Ekran boyutuna göre otomatik düzenleme

## 🔒 Veri Yönetimi

### LocalStorage Kullanımı
- Tüm veriler tarayıcının LocalStorage'ında saklanır
- Sayfa yenilendiğinde veriler korunur
- Tarayıcı verilerini temizlediğinde veriler silinir

### Veri Limitleri ve Yedekleme Önerisi
- LocalStorage kapasitesi tarayıcıya göre ~5–10 MB aralığındadır.
- Büyük Excel dosyaları ve çok sayıda not bu limite yaklaşabilir.
- Düzenli olarak JSON dışa aktarım ile yedek almanız önerilir.

### Yedekleme
- Notlar JSON formatında dışa aktarılabilir
- İçe aktarma ile yedekler geri yüklenebilir
- Dosya adı otomatik timestamp ile oluşturulur
 - Ayarlar panelinden tüm verileri tek JSON dosyası olarak indirip yükleyebilirsiniz

## 🎨 Tasarım Özellikleri

- **Modern Arayüz**: Temiz ve kullanıcı dostu tasarım
- **Gradient Sidebar**: Mavi gradient arka plan
- **Hover Efektleri**: Buton ve link hover animasyonları
- **Gölge Efektleri**: Kartlar ve modal pencereler
- **Yuvarlatılmış Köşeler**: Modern görünüm
- **Boş Durum Göstergeleri**: Veri olmadığında bilgilendirici mesajlar
- **Loading Animasyonları**: İşlem sırasında görsel geri bildirim

## 🔧 Sistem Gereksinimleri

- Modern web tarayıcısı (Chrome, Firefox, Safari, Edge)
- JavaScript etkin
- LocalStorage desteği
- File API desteği (Excel yükleme için)

## 📄 Lisans

Bu proje açık kaynak kodludur ve özel kullanım için geliştirilmiştir. Ticari kullanım için lisans gerekebilir.

## 🔐 Gizlilik ve Güvenlik

- Tüm veriler yalnızca sizin tarayıcınızda saklanır; sunucuya gönderilmez.
- Paylaşılan veya kurumsal bilgisayarlarda kullanırken tarayıcı verilerini koruduğunuzdan emin olun.

## 🧭 Tanıtım Turu (Onboarding)

- Uygulamaya ilk girişte özellikleri adım adım tanıtan bir tur vardır.
- Ayarlar panelinden turu sıfırlayıp yeniden başlatabilirsiniz.

## 🤝 Katkıda Bulunma

1. Projeyi fork edin
2. Feature branch oluşturun (`git checkout -b feature/AmazingFeature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add some AmazingFeature'`)
4. Branch'inizi push edin (`git push origin feature/AmazingFeature`)
5. Pull Request oluşturun

## 📞 İletişim

Proje ile ilgili sorularınız için GitHub Issues kullanabilirsiniz.