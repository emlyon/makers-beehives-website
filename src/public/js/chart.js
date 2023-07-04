function createChart(beehiveData, chartId = '#chart') {
  const series = buildSeries(beehiveData);
  const labels = Object.values(beehiveData).map((d) => formatDatetime(d.dateTime));
  const yaxis = buildYAxis();
  const options = {
    series,
    labels,
    colors: ['#008FFB', '#00E396', '#746624', '#775DD0', '#F9CE1D', '#F9A3A4', '#F86624'],
    chart: {
      height: 350,
      type: 'line',
      stacked: false
    },
    stroke: {
      width: 3,
      curve: 'smooth'
    },
    plotOptions: {
      bar: {
        columnWidth: '50%'
      }
    },
    fill: {
      opacity: 1,
      gradient: {
        inverseColors: false,
        shade: 'light',
        type: 'vertical',
        opacityFrom: 0.85,
        opacityTo: 0.55,
        stops: [0, 100, 100, 100]
      }
    },
    markers: {
      size: 0
    },
    xaxis: {
      type: 'datetime'
    },
    yaxis,
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: function (value, { seriesIndex }) {
          const unit = Object.values(SENSORS_INFO).map((sensor) => sensor.unit)[seriesIndex];
          if (typeof value !== 'undefined') {
            return [value.toFixed(1), unit].join(' ');
          }
          return value;
        }
      }
    }
  };

  const chart = new ApexCharts(document.querySelector(chartId), options);
  chart.render();
}

function buildSeries(beehiveData) {
  return Object.keys(SENSORS_INFO).map((key) => {
    return {
      name: SENSORS_INFO[key].name,
      type: SENSORS_INFO[key].seriesType,
      data: Object.values(beehiveData).map((entry) => entry.sensors[key])
    };
  });
}

function buildYAxis() {
  return Object.keys(SENSORS_INFO).map((key) => {
    return {
      show: false,
      title: {
        text: SENSORS_INFO[key].name
      },
      seriesName: SENSORS_INFO[key].name
    };
  });
}

function formatDatetime(dateTimeString) {
  let [date, time] = dateTimeString.split(' ');
  const [day, month, year] = date.split('/');
  date = [month, day, year].join('/');
  return `${date} ${time}`;
}
