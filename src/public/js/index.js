$(function () {
  // beehivesData is a global variable defined in the ejs template
  ['bee1', 'bee2', 'bee3', 'bee4'].forEach((beehiveId) => {
    const beehiveData = beehivesData[beehiveId]?.data;
    if (beehiveData) {
      $(`#${beehiveId}Preview .no-data-placeholder`).hide();
      createChart(beehiveData, `.${beehiveId}Chart`);
    } else {
      $(`.${beehiveId}Chart`).hide();
      $(`#${beehiveId}Preview button`).hide();
    }
  });
});
