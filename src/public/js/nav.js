document.querySelectorAll('.tab>a').forEach(el => {
    el.addEventListener('click', e => location.href = el.href)
})