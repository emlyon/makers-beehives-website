$(function () {
  // beehivesData is a global variable defined in the ejs template
  createChart(beehivesData['bee2'].data, '#bee2Chart');
  createChart(beehivesData['bee1'].data, '#bee1Chart');
});