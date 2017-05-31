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
