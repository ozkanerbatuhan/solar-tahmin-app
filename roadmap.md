# Solar Enerji Tahminleme Web Sitesi Yol Haritası

Aşağıda, makine öğrenimi tabanlı bir **solar enerji tahminleme web sitesi** geliştirme süreci için detaylı bir yol haritası sunulmaktadır. Bu yol haritası, projenin gereksinimlerini, kullanılacak teknoloji yığınını ve geliştirme aşamalarını içerir. Ayrıca, proje kapsamında **yapay zekâ ile kodlama yaparken kullanılabilecek bir prompt listesi** de eklenmiştir.

## Web Sitesi Temel Gereksinimleri

- **Tarih Bazlı Tahmin:** Kullanıcılar, belirli bir tarih seçerek tahmini üretim miktarlarını görebilecek.  
- **Veri İçe Aktarma:** Geçmiş verileri sisteme yükleyerek algoritmanın kendini geliştirmesine olanak tanıyacak bir veri import (içe aktarma) özelliği olacak.  
- **Doğruluk Karşılaştırması:** Gerçek üretim verileri ile tahmini verileri karşılaştırarak tahmin modelinin doğruluk oranlarını gösterecek.  
- **Veri Görselleştirme:** Grafikler aracılığıyla geçmiş ve tahmini üretim verileri saatlik, günlük, haftalık ve aylık olarak görselleştirilecek.  
- **Kullanıcı Arayüzü:** Kullanıcı arayüzü, sağlanan örnek görseller temel alınarak modern ve kullanıcı dostu şekilde tasarlanacak.  
- **Dil Desteği:** Web sitesi öncelikle Türkçe olacak, ancak yapısı ileride çoklu dil desteği eklenebilecek şekilde oluşturulacak.  
- **Hava Durumu Verileri:** Hava durumu verisi çeken bir API entegrasyonu bulunacak (ilk aşamada gerçek API yerine statik rastgele veriler kullanılacak).  
- **Veri Saklama:** Kullanıcılar tarafından yüklenen veriler CSV/Excel formatında sisteme alınacak ve yaklaşık 6-7 yıl süreyle saklanacak (tahmin modeli için geniş bir veri geçmişi oluşturmak amacıyla).

## Teknoloji Yığını

- **Frontend:** Next.js (React framework) + Bootstrap (CSS kütüphanesi) + Redux (durum yönetimi) kullanılacak.  
- **Grafikler:** Chart.js, D3.js veya Highcharts kütüphanelerinden biri ile grafiksel veri görselleştirmeleri yapılacak.  
- **Tablolar:** React Table veya AG Grid kullanılarak veri tabloları oluşturulacak.  
- **Backend:** Node.js (Express) veya Django ile API tabanlı bir arka uç geliştirilecek. Frontend ile backend API üzerinden haberleşecek.  
- **Veritabanı:** PostgreSQL (SQL) veya MongoDB (NoSQL) kullanılarak üretim ve tahmin verileri depolanacak.  
- **Makine Öğrenimi:** Python ortamında geliştirilen tahmin modeli (ör. scikit-learn, TensorFlow veya PyTorch kullanılarak) Flask/FastAPI ile bir servis haline getirilip backend’e entegre edilecek.  
- **API Entegrasyonu:** Hava durumu verileri için uygun bir üçüncü parti API kullanılacak (ilk etapta entegrasyon yapısı hazırlanıp gerçek veriler yerine rastgele değerler kullanılacak).

## Geliştirme Aşamaları

1. **Planlama ve Tasarım:** Projenin kapsamı ve gereksinimleri belirlenecek. Kullanıcı arayüzü tasarımı için örnek görsellerden yararlanılarak wireframe ve taslaklar oluşturulacak. Sayfa bileşenleri, navigasyon yapısı ve veri akışı planlanacak.  
2. **Ön Uç Geliştirme:** Next.js ile tek sayfa uygulaması (SPA) yapısı kurulacak. React bileşenleri oluşturulacak ve Bootstrap ile stil verilecek. Redux ile uygulamanın durum yönetimi (seçilen tarih, yüklenen veri, kullanıcı tercihleri vb.) sağlanacak.  
3. **Arka Uç Geliştirme:** Seçilen teknolojiye (Node.js/Django) göre RESTful API geliştirilecek. Bu API, tahmin sorguları, veri yükleme, doğruluk hesaplama ve hava durumu verisi sağlama gibi işlevleri gerçekleştirecek uç noktalar (endpoints) sunacak.  
4. **Makine Öğrenimi Entegrasyonu:** Python ile geliştirilen güneş enerjisi üretim tahmin modeli, Flask veya FastAPI aracılığıyla bir web servisi olarak sunulacak. Backend, bu servise istek göndererek belirli tarih aralıkları için tahmin sonuçlarını alacak. Model, başlarda mevcut tarihi verilerle eğitilecek ve kullanıcı yeni veri yükledikçe kendini güncelleyecek şekilde tasarlanacak.  
5. **Grafik ve Tabloların Entegrasyonu:** Chart.js/D3.js/Highcharts kullanılarak, gerçek ve tahmini üretim verileri için etkileşimli grafikler oluşturulacak. Bu grafikler saatlik, günlük, haftalık ve aylık filtreler ile kullanıcıya veri inceleme imkânı sunacak. Ayrıca, React Table/AG Grid ile yüklenen verilerin ve tahmin sonuçlarının tablo görünümleri sağlanacak.  
6. **Test Süreci:** Tüm bileşenler entegre edildikten sonra sistem genelinde testler yapılacak. Birim testleri, API testleri ve arayüz üzerinde manuel testler ile her özelliğin düzgün çalışıp çalışmadığı kontrol edilecek. Tahmin sonuçları ile gerçek veriler karşılaştırılarak model başarımı (hata oranları, doğruluk yüzdesi) değerlendirilecek. Kullanıcı geri bildirimi alınarak olası iyileştirmeler belirlenecek.  
7. **Dağıtım (Deployment):** Uygulama, üretim (production) ortamına taşınacak. Sunucuya frontend ve backend kodları yüklenerek gerekli yapılandırmalar yapılacak. Veritabanı ve makine öğrenimi servisi bulut veya sunucu ortamında çalışır hale getirilecek. Son olarak, alan adı ve SSL kurulumu tamamlanıp web sitesi erişime açılacak.

## AI Prompt Listesi

Yukarıdaki yol haritasını uygularken, her bir adımı yapay zekâ desteğiyle kodlayabilmek için aşağıdaki prompt örneklerini kullanabilirsiniz:

- **Dashboard Oluşturma:** *"Next.js ve Redux kullanarak solar tahminleme için bir dashboard oluştur. İçinde metrikler, üretim grafikleri, veri yükleme bölümü ve hava durumu bilgisi olsun."*  
- **Veri Yükleme Bileşeni:** *"CSV/Excel dosya yükleme bileşeni oluştur. Kullanıcıların geçmiş üretim verilerini yüklemesine izin ver."*  
- **Karşılaştırma Grafiği:** *"Tahmin edilen ve gerçek üretim verilerini karşılaştıran etkileşimli bir grafik bileşeni oluştur."*  
- **API Bağlantısı:** *"Seçilen tarih aralığına göre üretim tahmini getiren bir API uç noktası oluştur ve frontend arayüzüne bağla."*  
- **Dil Desteği ve Lokalizasyon:** *"Türkçe dil desteğiyle bir web sitesi oluştur. Tüm metinleri yapılandır ve ileride çoklu dil desteği eklenebilecek şekilde hazırla."*  
- **Hava Durumu Bileşeni:** *"Hava durumu verilerini (şimdilik rastgele oluşturulan) gösteren bir arayüz bileşeni oluştur ve bunu tahminleme dashboard’ına entegre et."*  

Bu yol haritası ve prompt listesi doğrultusunda, solar enerji tahminleme web sitesinin geliştirme sürecini adım adım ilerletebilirsin. Her aşamada belirlenen teknolojileri ve en iyi uygulamaları kullanarak, son kullanıcı için işlevsel ve verimli bir deneyim sunan bir platform oluşturmak hedeflenmektedir.