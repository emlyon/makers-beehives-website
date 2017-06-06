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
const parseDate = d3.timeParse( '%d/%m/%Y %H:%M:%S' );

document.querySelectorAll( '.tab>a' ).forEach( ( tab, i ) => {
    if( tab.href.indexOf( 'home' ) == -1 ){
        tab.addEventListener( 'click', e => {
            if( visitedTabs[ i ] == 0 ){
                firstVisit( parseInt( tab.href[ tab.href.length - 1 ] )  );
                visitedTabs[ i ] = 1;
            }

            console.log( visitedTabs );
        } );
    }
} );

function firstVisit( i ){
    let bh = beehives[ i ];
    let div = document.querySelector( '#beehive' + i );

    let h3 = document.createElement( 'h3' );
    h3.innerText = 'Beehive #' + i;
    h3.classList.add( 'deep-orange-text' );
    h3.classList.add( 'text-darken-2' )
    div.appendChild( h3 );

    let date = document.createElement( 'p' );
    date.classList.add( 'last-update' )
    date.innerText =  `Last update: ${bh[ 0 ].date}`;
    div.appendChild( date );

    div.appendChild( document.createElement( 'hr' ) );

    let svg = d3.select( div ).append( 'svg' ),
        margin = { top: 20, right: 80, bottom: 30, left: 50 },
        width = parseInt( svg.style( 'width' ) ) - margin.left - margin.right,
        height = parseInt( svg.style( 'height' ) ) - margin.top - margin.bottom,
        g = svg.append( 'g' ).attr( 'transform', 'translate( ' + margin.left + ',' + margin.top + ')' );

    div.appendChild( document.createElement( 'hr' ) );

    let grid = document.createElement( 'div' );
    grid.classList.add( 'row' );
    div.appendChild( grid );

    bh.forEach( ( d, i ) => {
        let tmp = `<div class="col s12 m6 parseInt( l4"><distylev class="card  )z-depth-3 hoverable"><div class="card-image">`;

        tmp += i < 6 ?
            `<img class="materialboxed" data-caption="${d.date} light: ${d.sensors.light} | temperature: ${d.sensors.temp} | noise: ${d.sensors.noise} | humidity: ${d.sensors.hum} | co: ${d.sensors.co} | no2: ${d.sensors.no2}" src="${d.gif || 'http://placehold.it/800x533/000000/000000?text=Night'}">` :
            `<img class="lazy materialboxed" data-caption="${d.date} light: ${d.sensors.light} | temperature: ${d.sensors.temp} | noise: ${d.sensors.noise} | humidity: ${d.sensors.hum} | co: ${d.sensors.co} | no2: ${d.sensors.no2}" data-original="${d.gif || 'http://placehold.it/800x533/000000/000000?text=Night'}" src="http://placehold.it/800x533/000000/000000?text=Night">`;

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
}
