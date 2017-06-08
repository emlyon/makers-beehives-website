const resizeElements = e => {
    d3.select( '.nav-wrapper' )
        .style( 'height', d3.select( '.brand-logo>svg' ).style( 'height' ) );

    const cards = document.querySelectorAll( '#home .card' );
    cards.forEach( d => $( d ).height( 'auto' ) );

    let h = 0;
    cards.forEach( d => {
        let tmp = parseInt( $( d ).height() );
        h = tmp > h ? tmp : h;
    } );

    cards.forEach( d => $( d ).height( h + 'px' ) );
};

window.addEventListener( 'load', resizeElements );
window.addEventListener( 'resize', resizeElements );

const visitedTabs = new Array( 5 ).fill( 0 );

document.querySelectorAll( '.tab>a' ).forEach( ( tab, i ) => {
    if( tab.href.indexOf( 'home' ) == -1 ){
        let beehiveIndex = parseInt( tab.href[ tab.href.length - 1 ] );
        tab.addEventListener( 'click', e => {
            if( visitedTabs[ i ] == 0 ){
                firstVisit( beehiveIndex );
                visitedTabs[ i ] = 1;
            }
            onEachVisit( beehiveIndex );
        } );
    }
} );

const firstVisit = bhIndex => {
    let bh = beehives[ bhIndex ];
    let div = document.querySelector( '#beehive' + bhIndex );

    let h3 = document.createElement( 'h3' );
    h3.innerText = 'Beehive #' + bhIndex;
    h3.classList.add( 'deep-orange-text' );
    h3.classList.add( 'text-darken-2' )
    div.appendChild( h3 );

    let date = document.createElement( 'p' );
    date.classList.add( 'last-update' )
    date.innerText =  `Last update: ${bh[ 0 ].date}`;
    div.appendChild( date );

    div.appendChild( document.createElement( 'hr' ) );

    let svg = d3.select( div ).append( 'svg' ).attr( 'id', 'svg' + bhIndex );

    div.appendChild( document.createElement( 'hr' ) );

    let grid = document.createElement( 'div' );
    grid.classList.add( 'row' );
    div.appendChild( grid );

    bh.forEach( ( d, i ) => {
        let tmp = `<div class="col s12 m6 parseInt( l4"><distylev class="card  )z-depth-3 hoverable"><div class="card-image">`;

        tmp += i < 6 ?
            `<img class="materialboxed" data-caption="${d.date} light: ${d.sensors.light} | temperature: ${d.sensors.temp} | noise: ${d.sensors.noise} | humidity: ${d.sensors.hum} | co: ${d.sensors.co} | no2: ${d.sensors.no2}" src="${d.gif || 'http://placehold.it/800x533/000000/000000?text=Night'}">` :
            `<img class="lazy materialboxed" data-caption="${d.date} light: ${d.sensors.light} | temperature: ${d.sensors.temp} | noise: ${d.sensors.noise} | humidity: ${d.sensors.hum} | co: ${d.sensors.co} | no2: ${d.sensors.no2}" data-original="${d.gif || 'http://placehold.it/800x533/000000/444444?text=No+Light'}" src="http://placehold.it/800x533/000000/e2001a?text=Loading">`;

        tmp += `<span class="card-title">${d.date}</span>
                </div>
                <div clalet tmps="card-content red-text text-lighten-2">
                    <p class="grey-text text-darken-2">
                        light: ${d.sensors.light}<br>
                        temperature: ${d.sensors.temp}<br>
                        noise: ${d.sensors.noise}<br>
                        humidity: ${d.sensors.hum}<br>
                        co: ${d.sensors.co}<br>
                        no2: ${d.sensors.no2}
                    </p>
                </div>
                </div>
                </div>`;

        grid.innerHTML += tmp;
    } );

    $('.materialboxed').materialbox();
    $( 'img.lazy' ).lazyload();
};

const onEachVisit = bhIndex => {
    document.querySelector( '#svg' + bhIndex ).innerHTML = '';

    setTimeout( () => {
        let svg = d3.select( '#svg' + bhIndex ),
            margin = { top: 20, right: 30, bottom: 30, left: 0 },
            width = parseInt( svg.style( 'width' ) ) - margin.left - margin.right,
            height = parseInt( svg.style( 'height' ) ) - margin.top - margin.bottom;
            g = svg.append( 'g' ).attr( 'transform', 'translate(' + margin.left + ',' + margin.top + ')' );

        // console.log( width, height );

        const parseTime = d3.timeParse( '%d/%m/%Y %H:%M:%S' );

        let bh = beehives[ bhIndex ].slice( 0, 72 );
        //console.log( bh );

        let sensorsNames = [ 'light', 'temp', 'noise', 'hum', 'co', 'no2' ];
        let sensors = sensorsNames.map( sn => {
            return {
                id: sn,
                values: bh.map( d => {
                    return { date: parseTime( d.date ), value: parseFloat( d.sensors[ sn ] ) };
                } )
            };
        } );
        // console.log( sensors );

        let x = d3.scaleTime().range( [ 0, width ] ).domain( d3.extent( bh, d => parseTime( d.date ) ) ),
            y = d3.scaleLinear().range( [ height, 0 ] ),
            z = d3.scaleOrdinal( d3.schemeCategory10 );

        z.domain( sensorsNames );

        var line = d3.line()
            .curve( d3.curveStep )
            .x( d => x( d.date ) )
            .y( d => y( d.value ) );

        g.append( 'g' )
            .attr( 'class', 'axis axis--x' )
            .attr( 'transform', 'translate( 0,' + height + ')' )
            .call( d3.axisBottom( x ).ticks( 3 ) );

        let sensor = g.selectAll( '.sensor' )
            .data( sensors )
            .enter().append( 'g' )
            .attr( 'class', 'sensor' )
            .style( 'opacity', 0.15 );

        let hover = d => {
            sensor.style( 'opacity', 1.0 ).transition().style( 'opacity', s => s.id === d.id ? 1.0 : 0.15 );
        };

        let out = d => {
            sensor.transition().style( 'opacity', 1.0 );
        };

        sensor.append( 'path' )
            .attr( 'class', 'line' )
            .attr( 'd', d => {
                y.domain( d3.extent( d.values, s => s.value ) );
                return line( d.values );
            } )
            .style( 'stroke', d => z( d.id ) )
            .attr( 'stroke-dasharray', function( d ){
                d.totalLength = this.getTotalLength();
                return d.totalLength + " " + d.totalLength;
            } )
            .attr( 'stroke-dashoffset',  d => -d.totalLength )
            .on( 'mouseover', hover )
            .on( 'mouseleave', out );

        sensor.select( 'path' )
            .transition()
            .duration( 2000 )
            .delay( ( d, i ) => 1000 + i * 2500 )
            .attr( 'stroke-dashoffset',  0 )
            .on( 'start', ( d, i ) => {
                sensor.filter( ( s, j ) => j === i ).style( 'opacity', 1.0 )
            } )
            .on( 'end', ( d, i ) => {
                if( i !== sensorsNames.length - 1 ) {
                    sensor.filter( ( s, j ) => j === i ).transition().delay( 500 ).style( 'opacity', 0.15 );
                }
                else{
                    sensor.transition().delay( 500 ).duration( 2000 ).style( 'opacity', 1.0 );
                }
            } );

        sensor.append( 'text' )
            .attr( 'transform', d => {
                y.domain( d3.extent( d.values, s => s.value ) );
                return 'translate(' + x( d.values[ 0 ].date ) + ',' + y( d.values[ 0 ].value ) + ')';
            } )
            .attr( 'x', 3 )
            .attr( 'dy', '0.35em' )
            .style( 'font', '10px sans-serif' )
            .style( 'fill', d => z( d.id ) )
            .text( d => d.id )
            .on( 'mouseover', hover )
            .on( 'mouseleave', out );

        document.querySelectorAll
    }, 20 );
};

window.addEventListener( 'resize', e => {
    let tab = document.querySelector( '.active' );
    if( tab.href.indexOf( 'home' ) == -1 ){
        let beehiveIndex = parseInt( tab.href[ tab.href.length - 1 ] );
        onEachVisit( beehiveIndex );
    }
} );
