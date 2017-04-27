// function to authorize Trello app
function trelloAuth() {
  var trelloAuthSuccess = function() {
    console.log("Trello auth SUCCESS");
  };
  var trelloAuthFail = function() {
    console.log("Trello auth FAIL");
  };
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
}

$(document).ready(function() {
  // authorie Trello app
  trelloAuth();
  Trello.get("members/me/boards", function(boardData) {
    for (var bd = 0; bd < boardData.length; bd++) {
      $("main").append("<div class='board'><h1>" + boardData[bd].name +
      "</h1><div class='board-lists' id='" + boardData[bd].id +
      "'></div></div>");
      Trello.get("boards/" + boardData[bd].id + "/lists", function(listData) {
        for (var ld = 0; ld < listData.length; ld++) {
          $("#" + listData[ld].idBoard).append("<div class='list'><h2>" +
          listData[ld].name + "</h2><div class='list-cards' id='" +
          listData[ld].id + "'></div></div>");
        }
      });
    }
  });
});
