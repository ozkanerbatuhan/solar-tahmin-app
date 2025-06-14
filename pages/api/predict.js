// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { date } = req.body;
    
    if (!date) {
      return res.status(400).json({ error: 'Tarih parametresi gereklidir' });
    }
    
    // Burada gerçek tahmin yapılacaktır. Şu an için rastgele değerler döndürelim.
    const prediction = generateMockPredictionData(date);
    
    res.status(200).json(prediction);
  } catch (error) {
    console.error('Tahmin hatası:', error);
    res.status(500).json({ error: 'Tahmin işleminde bir hata oluştu' });
  }
}

// Örnek tahmin verisi oluşturan yardımcı fonksiyon
function generateMockPredictionData(date) {
  // Gün doğumu saat 6, gün batımı saat 18 olarak varsayalım
  const sunriseHour = 6;
  const sunsetHour = 18;
  
  // Saatlik üretim tahminleri
  const hourlyProduction = Array.from({ length: 24 }, (_, hour) => {
    // Gün doğumu ve gün batımı arasında üretim olsun, diğer saatlerde 0
    let prediction = 0;
    
    if (hour >= sunriseHour && hour <= sunsetHour) {
      // Öğlen saatlerinde en yüksek değeri verelim (zirve saat 12'de)
      const peakFactor = 1 - Math.abs(hour - 12) / 6;
      prediction = Math.round(peakFactor * 100 * (0.7 + Math.random() * 0.6)); // 70-130 kW arasında maks değer
    }
    
    // Gerçek değer, tahmin değerinin %80-120 arasında rastgele olsun
    const actual = prediction > 0 ? Math.round(prediction * (0.8 + Math.random() * 0.4)) : 0;
    
    return {
      hour,
      prediction,
      actual
    };
  });
  
  // Günlük toplam değerler
  const totalPrediction = hourlyProduction.reduce((sum, item) => sum + item.prediction, 0);
  const totalActual = hourlyProduction.reduce((sum, item) => sum + item.actual, 0);
  
  return {
    date,
    hourlyProduction,
    daily: {
      prediction: totalPrediction,
      actual: totalActual,
      accuracy: totalActual > 0 ? Math.round((1 - Math.abs(totalPrediction - totalActual) / totalActual) * 100) : 0
    }
  };
} 