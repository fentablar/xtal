$(function() {
  $(".navButton").on("click", function() {
    $(".navButton").removeClass("navActive");
    $(this).addClass("navActive");
    var opt = $(this).attr("id");
    if(opt === "dashButton") {
      $("#viewDash").css({"display": "block"});
      $("#viewBoards").css({"display": "none"});
    } else {
      $("#viewDash").css({"display": "none"});
      $("#viewBoards").css({"display": "block"});
    }
  });
  $("#actionItemsShowHide").on("click", function() {
    $("#actionItems > .dashViewContainer").toggleClass("hideMe");
  });
  $("#noDueDatesShowHide").on("click", function() {
    $("#noDueDates > .dashViewContainer").toggleClass("hideMe");
  });
  $("#recentActivityShowHide").on("click", function() {
    $("#recentActivity > .dashViewContainer").toggleClass("hideMe");
  });
});
