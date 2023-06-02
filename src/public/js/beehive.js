$(function () {
  $('.materialboxed').materialbox();
  $('img.lazy').lazyload();
  // beehiveIndex is a global variable defined in the ejs template
  // Home link will be at index 0
  document.querySelectorAll('.nav-content a')[beehiveIndex].classList.add('active');
  // beehiveData is a global variable defined in the ejs template
  createGraph(beehiveData);
});

function createGraph(beehiveData) {
  const target = document.querySelector('#graph');
  d3.select(target).append('svg').attr('id', `svg${beehiveIndex}`);

  let buttons = SENSORS_NAMES,
    actives = SENSORS_NAMES;
  document.querySelectorAll('.graph-button').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      btn.classList.toggle('darken-2');
      let id = `#g-${beehiveIndex}-${btn.innerText.toLowerCase()}`;
      d3.select(id)
        .transition()
        .duration(500)
        .style('opacity', (d) => {
          return btn.classList.contains('darken-2') ? 1.0 : 0.0;
        });
    });
  });

  setTimeout(() => {
    let svg = d3.select(`#svg${beehiveIndex}`),
      margin = { top: 20, right: 30, bottom: 30, left: 0 },
      width = parseInt(svg.style('width')) - margin.left - margin.right,
      height = parseInt(svg.style('height')) - margin.top - margin.bottom;
    console.log('svg', svg);
    g = svg.append('g').attr('transform', `translate(${margin.left}, ${margin.top})`);
    console.log('g', g);
    const parseTime = d3.timeParse('%d/%m/%Y %H:%M:%S');

    let sensors = SENSORS_NAMES.map((sn) => ({
      id: sn,
      values: Object.values(beehiveData).map((entry) => ({
        date: parseTime(entry.dateTime),
        value: parseFloat(entry.sensors[sn])
      }))
    }));
    console.log('sensors', sensors);

    let x = d3
        .scaleTime()
        .range([0, width])
        .domain(d3.extent(beehiveData, (d) => parseTime(d.date))),
      y = d3.scaleLinear().range([height, 0]),
      z = d3.scaleOrdinal(d3.schemeCategory10);

    console.log('x', x);
    z.domain(SENSORS_NAMES);

    var line = d3
      .line()
      .curve(d3.curveStep)
      .x((d) => x(d.date))
      .y((d) => y(d.value));

    g.append('g')
      .attr('class', 'axis axis--x')
      .attr('transform', `translate(0, ${height})`)
      .call(d3.axisBottom(x).ticks(3));

    let sensor = g
      .selectAll('.sensor')
      .data(sensors)
      .enter()
      .append('g')
      .attr('id', (d) => `g-${beehiveIndex}-${d.id}`)
      .attr('class', 'sensor')
      .style('opacity', 0.15);

    sensor
      .append('path')
      .attr('class', 'line')
      .attr('d', (d) => {
        y.domain(d3.extent(d.values, (s) => s.value));
        return line(d.values);
      })
      .style('stroke', (d) => z(d.id))
      .attr('stroke-dasharray', function (d) {
        d.totalLength = this.getTotalLength();
        return `${d.totalLength} ${d.totalLength}`;
      })
      .attr('stroke-dashoffset', (d) => -d.totalLength);

    sensor
      .select('path')
      .transition()
      .duration(2000)
      .delay((d, i) => 1000 + i * 2500)
      .attr('stroke-dashoffset', 0)
      .on('start', (d, i) => {
        sensor.filter((s, j) => j === i).style('opacity', 1.0);
        document.querySelector(`#btn-${beehiveIndex}-${d.id}`).classList.add('darken-2');
      })
      .on('end', (d, i) => {
        if (i !== SENSORS_NAMES.length - 1) {
          sensor
            .filter((s, j) => j === i)
            .transition()
            .delay(500)
            .style('opacity', 0.15)
            .on('start', (d) => {
              document.querySelector(`#btn-${beehiveIndex}-${d.id}`).classList.remove('darken-2');
            });
        } else {
          sensor
            .transition()
            .delay(500)
            .duration(2000)
            .style('opacity', 1.0)
            .on('start', (d) => {
              document.querySelector(`#btn-${beehiveIndex}-${d.id}`).classList.add('darken-2');
            });
        }
      });

    sensor
      .append('text')
      .attr('transform', (d) => {
        y.domain(d3.extent(d.values, (s) => s.value));
        console.log('d.values[0].date', d.values[0].date);
        return `translate(${x(d.values[0].date)}, ${y(d.values[0].value)})`;
      })
      .attr('x', 3)
      .attr('dy', '0.35em')
      .style('font', '10px sans-serif')
      .style('fill', (d) => z(d.id))
      .text((d) => d.id);
  }, 200);
}
