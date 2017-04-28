var reapTrelloData = function() {

  //get Trello boards, make container, label for each
  Trello.get("members/me/boards", function(boardData) {
    for (var bd = 0; bd < boardData.length; bd++) {
      $("main").append("<div class='board'><h1>" + boardData[bd].name +
      "</h1><div class='board-lists' id='" + boardData[bd].id + "'></div></div>");

      //get lists fr each board, make container, label in board for each
      Trello.get("boards/" + boardData[bd].id + "/lists", function(listData) {
        $(".board").mCustomScrollbar({
          axis: "x",
          theme: "inset-2",
          scrollIntertia: 0,
          mouseWheel: {
            enable: false
          }
        });
        for (var ld = 0; ld < listData.length; ld++) {
          $("#" + listData[ld].idBoard).append("<div class='list'><h2>" +
          listData[ld].name + "</h2><div class='list-cards' id='" +
          listData[ld].id + "'></div></div>");

          //get cards fr each list, make container, label in list for each
          Trello.get("lists/" + listData[ld].id + "/cards", function(cardData) {
            $(".list-cards").mCustomScrollbar({
              axis: "y",
              theme: "minimal-dark",
              scrollInertia: 0
            });
            for (var cd = 0; cd < cardData.length; cd++) {
              $("#" + cardData[cd].idList).append("<div class='card' id='" +
              cardData[cd].id + "'><p>" + cardData[cd].name + "</p></div>");
            }
          }, function() { console.log("card load failed"); });
        }
      }, function() { console.log("list load failed"); });
    }
  }, function() { console.log("board load failed"); });
};

var trelloAuthFail = function() { console.log("Trello auth FAIL"); };

$(document).ready(function() {
  //authorize Trello app
  Trello.authorize( {
    type: "popup",
    name: "chingu raccoons xtal",
    scope: {
      read: "true",
      write: "true"
    },
    expiration: "never",
    success: reapTrelloData,
    error: trelloAuthFail
  });
});
