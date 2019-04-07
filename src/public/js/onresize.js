const resizeElements = e => {
    $('.nav-wrapper').height($('.brand-logo>img').height())

    const cards = document.querySelectorAll('.card')
    let maxHeight = 0

    cards.forEach(d => $(d).height('auto'))
    cards.forEach(d => {
        let tmp = parseInt($(d).height())
        maxHeight = tmp > maxHeight ? tmp : maxHeight
    })
    cards.forEach(d => $(d).height(maxHeight + 'px'))
}
resizeElements()
window.addEventListener('load', resizeElements)
window.addEventListener('resize', resizeElements)