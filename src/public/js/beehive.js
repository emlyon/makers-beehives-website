$(function () {
  $('.materialboxed').materialbox();
  $('img.lazy').lazyload();
  // beehiveIndex is a global variable defined in the ejs template
  // Home link will be at index 0
  document.querySelectorAll('.nav-content a')[beehiveIndex].classList.add('active');
  // beehiveData is a global variable defined in the ejs template
  createChart(beehiveData);
});