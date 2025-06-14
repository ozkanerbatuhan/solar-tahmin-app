# Solar Enerji Tahmin Sistemi

Bu proje, güneş enerjisi üretim tahmini yapan bir web uygulamasıdır. Makine öğrenimi algoritmalarını kullanarak geçmiş verilerden gelecekteki güneş enerjisi üretimini tahmin eder.

## Özellikler

- **Tarih Bazlı Tahmin:** Belirli bir tarih seçerek tahmini üretim miktarlarını görebilirsiniz.
- **Veri İçe Aktarma:** Geçmiş verileri sisteme yükleyerek algoritmanın kendini geliştirmesine olanak tanır.
- **Doğruluk Karşılaştırması:** Gerçek üretim verileri ile tahmini verileri karşılaştırarak tahmin modelinin doğruluk oranlarını gösterir.
- **Veri Görselleştirme:** Grafikler aracılığıyla geçmiş ve tahmini üretim verileri saatlik, günlük, haftalık ve aylık olarak görselleştirilir.

## Kurulum

1. Node.js ve npm'i yükleyin (https://nodejs.org/)
2. Proje klasörüne gidin:
   ```
   cd solar-tahmin-app
   ```
3. Bağımlılıkları yükleyin:
   ```
   npm install
   ```
4. Geliştirme sunucusunu başlatın:
   ```
   npm run dev
   ```
5. Tarayıcınızda [http://localhost:3000](http://localhost:3000) adresine gidin

## Kullanılan Teknolojiler

- **Frontend:** Next.js, React, Bootstrap
- **Grafik Kütüphaneleri:** Chart.js, React-Chartjs-2
- **Veri Formatları:** CSV, Excel (.xlsx, .xls)

## Veri Formatı

Sisteme yükleyeceğiniz veri dosyalarında aşağıdaki sütunlar bulunmalıdır:

- **Tarih:** YYYY-MM-DD formatında
- **Saat:** 0-23 arasında tam sayı
- **Üretim:** kWh cinsinden üretim miktarı
- **Sıcaklık (opsiyonel):** Celsius cinsinden
- **Işınım (opsiyonel):** W/m² cinsinden 