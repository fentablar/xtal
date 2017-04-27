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
  // define arrays to contain board,list,card data
  var boardsArray = [];
  var listsArray = [];
  var cardsArray = [];

  // authorie Trello app
  trelloAuth();

  // get board,list,card data and push to arrays
  Trello.get("members/me/boards", function(boardData) {
    for (var bd = 0; bd < boardData.length; bd++) {
      boardsArray.push(boardData[bd]);
      Trello.get("boards/" + boardData[bd].id + "/lists", function(listData) {
        for (var ld = 0; ld < listData.length; ld++) {
          listsArray.push(listData[ld]); } });
      Trello.get("boards/" + boardData[bd].id + "/cards", function(cardData) {
        for (var cd = 0; cd < cardData.length; cd++) {
          cardsArray.push(cardData[cd]); } });
    }
  });

  for (var ba = 0; ba < boardsArray.length; ba++) {
    $("main").append("<div class='board'><h1>" + boardsArray[ba].name +
    "</h1><div class='board-lists' id='" + boardsArray[ba].id +
    "'></div></div>");
  }
});
