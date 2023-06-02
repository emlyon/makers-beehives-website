const bhIndex = location.pathname.split('/').at(-1).replace("bee", "")
// Home link will be at index 0
document.querySelectorAll('.nav-content a')[bhIndex].classList.add('active')

let div = document.querySelector('#content')

const url = new URL('https://script.google.com/macros/s/AKfycbw61xdBYnNVJI7AEDuUay7il1hTATextokstUNsuIy3jjE-vViu/exec')
url.search = new URLSearchParams({sheet: `beehive${bhIndex}`})
fetch(url)
    .then(resp => resp.json())
    .then(json => {
        const data = json.result.map(d =>{
            let [date, sensors, gif] = d
            date = new Date(date).toLocaleString('fr-FR').split(' à ').join(' ')
            sensors = JSON.parse(sensors)
            return {date, sensors, gif}
        })
        displayData(data)
    })

function displayData(bh) {
    document.querySelector('#preload').style.display = 'none'

    let h3 = document.createElement('h3')
    h3.innerText = `Beehive #${bhIndex}`
    h3.classList.add('deep-orange-text', 'text-darken-2')
    div.appendChild(h3)

    let date = document.createElement('p')
    date.classList.add('last-update')
    date.innerText = `Last update: ${bh[0].date}`
    div.appendChild(date)

    div.appendChild(document.createElement('hr'))

    createGraph(bh)

    div.appendChild(document.createElement('hr'))

    let grid = document.createElement('div')
    grid.classList.add('row')
    div.appendChild(grid)

    bh.forEach((d, i) => {
        let tmp = `<div class="col s12 m6 l4"><div class="card z-depth-3 hoverable"><div class="card-image">`

        tmp += `<img class="lazy materialboxed" data-caption="${d.date} weight: ${d.sensors.weight} | light: ${d.sensors.light} | temperature: ${d.sensors.temp} | noise: ${d.sensors.noise} | humidity: ${d.sensors.hum} | co: ${d.sensors.co} | no2: ${d.sensors.no2}" data-original="${d.gif || 'http://placehold.it/800x533/000000/444444?text=No+Light'}" src="http://placehold.it/800x533/000000/e2001a?text=Loading">`

        tmp += `<span class="card-title">${d.date}</span>
                </div>
                <div class="card-content red-text text-lighten-2">
                    <p class="grey-text text-darken-2">
                        weight: ${d.sensors.weight}<br>
                        light: ${d.sensors.light}<br>
                        temperature: ${d.sensors.temp}<br>
                        noise: ${d.sensors.noise}<br>
                        humidity: ${d.sensors.hum}<br>
                        co: ${d.sensors.co}<br>
                        no2: ${d.sensors.no2}
                    </p>
                </div>
                </div>
                </div>`

        grid.innerHTML += tmp
    })

    $('.materialboxed').materialbox()
    $('img.lazy').lazyload()
}

function createGraph(bh) {
    d3.select(div).append('svg').attr('id', `svg${bhIndex}`)

    let buttons = [], actives = [];
    ['light', 'temp', 'noise', 'hum', 'co', 'no2'].forEach(sensor => {
        let btn = document.createElement('a')
        btn.classList.add('gui', 'waves-effect', 'waves-light', 'grey', 'btn', 'col', 's12')
        btn.innerText = sensor
        btn.id = `btn-${bhIndex}-${btn.innerText}`
        actives.push(btn.innerText)
        buttons.push(btn)
    })
    let btnsRow = document.createElement('div')
    btnsRow.classList.add('row')
    buttons.forEach(btn => {
        let col = document.createElement('div')
        col.classList.add('col', 's6', 'm4', 'l2')

        col.appendChild(btn)
        btnsRow.appendChild(col)
    })
    div.appendChild(btnsRow)

    buttons.forEach(btn => {
        btn.addEventListener('click', e => {
            btn.classList.toggle('darken-2')
            let id = `#g-${bhIndex}-${btn.innerText.toLowerCase()}`
            d3.select(id)
                .transition()
                .duration(500)
                .style('opacity', d => {
                    return btn.classList.contains('darken-2') ? 1.0 : 0.0
                })
        })
    })

    setTimeout(() => {
        let svg = d3.select(`#svg${bhIndex}`),
            margin = {top: 20, right: 30, bottom: 30, left: 0},
            width = parseInt(svg.style('width')) - margin.left - margin.right,
            height = parseInt(svg.style('height')) - margin.top - margin.bottom
            g = svg.append('g').attr('transform', `translate(${margin.left}, ${margin.top})`)

        const parseTime = d3.timeParse('%d/%m/%Y %H:%M:%S')

        let sensorsNames = ['light', 'temp', 'noise', 'hum', 'co', 'no2']
        let sensors = sensorsNames.map(sn => ({
            id: sn,
            values: bh.map(d => ({date: parseTime(d.date), value: parseFloat(d.sensors[sn])}))
        }))

        let x = d3.scaleTime().range([0, width]).domain(d3.extent(bh, d => parseTime(d.date))),
            y = d3.scaleLinear().range([height, 0]),
            z = d3.scaleOrdinal(d3.schemeCategory10)

        z.domain(sensorsNames)

        var line = d3.line()
            .curve(d3.curveStep)
            .x(d => x(d.date))
            .y(d => y(d.value))

        g.append('g')
            .attr('class', 'axis axis--x')
            .attr('transform', `translate(0, ${height})`)
            .call(d3.axisBottom(x).ticks(3))

        let sensor = g.selectAll('.sensor')
            .data(sensors)
            .enter().append('g')
            .attr('id', d => `g-${bhIndex}-${d.id}`)
            .attr('class', 'sensor')
            .style('opacity', 0.15)

        sensor.append('path')
            .attr('class', 'line')
            .attr('d', d => {
                y.domain(d3.extent(d.values, s => s.value))
                return line(d.values)
            })
            .style('stroke', d => z(d.id))
            .attr('stroke-dasharray', function(d) {
                d.totalLength = this.getTotalLength()
                return `${d.totalLength} ${d.totalLength}`
            })
            .attr('stroke-dashoffset',  d => -d.totalLength)

        sensor.select('path')
            .transition()
            .duration(2000)
            .delay((d, i) => 1000 + i * 2500)
            .attr('stroke-dashoffset',  0)
            .on('start', (d, i) => {
                sensor.filter((s, j) => j === i).style('opacity', 1.0)
                document.querySelector(`#btn-${bhIndex}-${d.id}`).classList.add('darken-2')
            })
            .on('end', (d, i) => {
                if(i !== sensorsNames.length - 1) {
                    sensor.filter((s, j) => j === i)
                        .transition()
                        .delay(500)
                        .style('opacity', 0.15)
                        .on('start', d => {
                            document.querySelector(`#btn-${bhIndex}-${d.id}`).classList.remove('darken-2')
                        })
                }
                else{
                    sensor.transition()
                        .delay(500)
                        .duration(2000)
                        .style('opacity', 1.0)
                        .on('start', d => {
                            document.querySelector(`#btn-${bhIndex}-${d.id}`).classList.add('darken-2')
                        })
                }
            })

        sensor.append('text')
            .attr('transform', d => {
                y.domain(d3.extent(d.values, s => s.value))
                return `translate(${x(d.values[0].date)}, ${y(d.values[0].value)})`
            })
            .attr('x', 3)
            .attr('dy', '0.35em')
            .style('font', '10px sans-serif')
            .style('fill', d => z(d.id))
            .text(d => d.id)
    }, 200)
}