SENSORS_INFO = {
    light: {
      name: 'Luminosité',
      unit: 'Lux',
      seriesType: 'line'
    },
    temp: {
      name: 'Température',
      unit: '°C',
      seriesType: 'line'
    },
    noise: {
      name: 'Bruit',
      unit: 'dB',
      seriesType: 'line'
    },
    hum: {
      name: 'Humidité',
      unit: '%',
      seriesType: 'line'
    },
    co: {
      name: 'CO',
      unit: 'ppm',
      seriesType: 'line'
    },
    no2: {
      name: 'NO2',
      unit: 'ppm',
      seriesType: 'line'
    },
    weight: {
      name: 'Poids',
      unit: 'kg',
      seriesType: 'column'
    }
};
module.exports = SENSORS_INFO