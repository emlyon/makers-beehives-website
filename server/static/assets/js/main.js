const resizeCards = e => {
    const cards = document.querySelectorAll( '#home .card' );
    cards.forEach( d => $( d ).height( 'auto' ) );

    let h = 0;
    cards.forEach( d => {
        let tmp = parseInt( $( d ).height() );
        h = tmp > h ? tmp : h;
    } );

    cards.forEach( d => $( d ).height( h + 'px' ) );
};

window.addEventListener( 'load', resizeCards );
window.addEventListener( 'resize', resizeCards );

const visitedTabs = new Array( 5 ).fill( 0 );

document.querySelectorAll( '.tab>a' ).forEach( ( tab, i ) => {
    if( tab.href.indexOf( 'home' ) == -1 ){
        let beehiveIndex = parseInt( tab.href[ tab.href.length - 1 ] );
        tab.addEventListener( 'click', e => {
            if( visitedTabs[ i ] == 0 ){
                firstVisit( beehiveIndex  );
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
            margin = { top: 20, right: 80, bottom: 30, left: 40 },
            width = parseInt( svg.style( 'width' ) ) - margin.left - margin.right,
            height = parseInt( svg.style( 'height' ) ) - margin.top - margin.bottom;
            g = svg.append( 'g' ).attr( 'transform', 'translate(' + margin.left + ',' + margin.top + ')' );

        // console.log( width, height );

        let bh = beehives[ bhIndex ];
        //console.log( bh );

        let sensorsNames = [ 'light', 'temp', 'noise', 'hum', 'co', 'no2' ];
        let sensors = sensorsNames.map( sn => {
            return {
                id: sn,
                values: bh.map( d => {
                    return { date: d.date, value: parseFloat( d.sensors[ sn ] ) };
                } )
            };
        } );
        console.log( sensors );

        const parseTime = d3.timeParse( '%d/%m/%Y %H:%M:%S' );

        let x = d3.scaleTime().range( [ 0, width ] ).domain( d3.extent( bh, d => d.date ) ),
            y = d3.scaleLinear().range( [ height, 0 ] ),
            z = d3.scaleOrdinal( d3.schemeCategory10 );

        z.domain( sensorsNames );

        var line = d3.line()
            .curve( d3.curveBasis )
            .x( d => x( d.date ) )
            .y( d => y( d.temperature ) );

        function type( d, _, columns ) {
            d.date = parseTime( d.date );
            for( var i = 1, n = columns.length, c; i < n; ++ i ) d[ c = columns[ i ] ] = + d[ c ];
            return d;
        }

        g.append( 'g' )
              .attr( "class", "axis axis--x" )
              .attr( "transform", "translate(0," + height + ")" )
              .call( d3.axisBottom( x ) );

        g.append( "g" )
            .attr( "class", "axis axis--y" )
            .call( d3.axisLeft(y) )
            .append( "text")
            .attr( "transform", "rotate(-90)")
            .attr( "y", 6)
            .attr( "dy", "0.71em")
            .attr( "fill", "#000");

        var sensor = g.selectAll( ".sensor" )
            .data( sensors )
            .enter().append( "g" )
            .attr( "class", "sensor" );
    }, 50 );
};
