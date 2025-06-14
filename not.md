/api/inverters/inverters/{inverter_id}/data
inverterid değeri için 1-8 e kadar değer girebilecek
skip ve limit değerleri
http://217.18.210.229:8000/api/inverters/inverters/1/data?skip=100&limit=100

{
  "name": "Inverter-1",
  "location": "Location-1",
  "description": null,
  "id": 1,
  "created_at": "2025-05-20T18:40:59.311640",
  "updated_at": "2025-05-20T18:40:59.311647",
  "data": [
    {
      "power_output": 38.80942417,
      "id": 108169,
      "irradiance": 45.7,
      "timestamp": "2024-11-14T08:00:00",
      "inverter_id": 1,
      "temperature": 3.1,
      "additional_data": null
    },