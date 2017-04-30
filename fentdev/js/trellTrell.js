var trelloAuthFail = function() { console.log("Trello auth FAIL") };

var trelloAuthSuccess = function() {
  console.log("Trello auth SUCCESS");
  reapTrelloData();
};

function reapTrelloData() {
  //get Trello boards, make container, label for each
  Trello.get("members/me/boards", function(boardData) {
    console.log("calling boards");
    for (var bd = 0; bd < boardData.length; bd++) {
      $("main").append("<div id='" + boardData[bd].id + "' class='board'><h1>" +
      boardData[bd].name + "</h1><div class='board-lists'></div></div>");

      //get lists fr each board, make container, label in board for each
      Trello.get("boards/" + boardData[bd].id + "/lists", function(listData) {
        console.log("calling lists");
        for (var ld = 0; ld < listData.length; ld++) {
          $("#" + listData[ld].idBoard + " > .board-lists").append("<div class='list' id='" +
          listData[ld].id + "'><h2>" + listData[ld].name +
          "</h2><div class='list-cards'></div></div>");

          //get cards fr each list, make container, label in list for each
          Trello.get("lists/" + listData[ld].id + "/cards", function(cardData) {
            console.log("calling cards");
            for (var cd = 0; cd < cardData.length; cd++) {
              $("#" + cardData[cd].idList + " > .list-cards").append("<div class='card' id='" +
              cardData[cd].id + "'><p>" + cardData[cd].name + "</p></div>");
            }
          }, function() { console.log("card load failed"); });
        }
      }, function() { console.log("list load failed"); });
    }
  }, function() { console.log("board load failed"); });
}

$(function() {
  Trello.authorize({
    type: "popup",
    name: "chingu raccoons xtal",
    scope: {
      read: "true",
      write: "true"
    },
    expiration: "never",
    success: trelloAuthSuccess,
    error: trelloAuthFail
  });
});
