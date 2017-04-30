var trelloAuthFail = function() { console.log("Trello auth FAIL") };

var reapTrelloData = function() {
  console.log("Trello auth success");

  var boards = [], lists = [], cards = [];

  Trello.get("members/me/boards", function(boardData) {
    console.log("getting boards");
    for (var i = 0; i < boardData.length; i++) {
      boards.push(boardData[i]);
      console.log("board " + i);
      $("main").append("<div class='board' id='" + boardData[i].id + "'><h1>" +
      boardData[i].name + "</h1><div class = 'board-lists'></div></div>");
    }
  }).then(function() {
    console.log("getting lists");
    for (var i = 0; i < boards.length; i++) {
      Trello.get("boards/" + boards[i].id + "/lists", function(listData) {
        for (var k = 0; k < listData.length; k++) {
          lists.push(listData[k]);
          console.log("list " + k);
          $("#" + listData[k].idBoard + " > .board-lists").append("<div class='list' id='" +
          listData[k].id + "'><h2>" + listData[k].name +
          "</h2><div class='list-cards'></div></div>");
        }
      });
    }
  }).then(function() {
    console.log("getting cards");
    for (var i = 0; i < lists.length; i++) {
      Trello.get("lists/" + lists[i].id + "/cards", function(cardData) {
        for (var k = 0; k < cardData.length; k++) {
          cards.push(cardData[k]);
          console.log("card " + k);
          $("#" + cardData[k].idList + " > .list-cards").append("<div class='card' id='" +
          cardData[k].id + "'><p>" + cardData[k].name + "</p></div>");
        }
      });
    }
  }).then(function() {
    console.log("load scrollers");
    console.log(boards);
    console.log(lists);
    console.log(cards);
    $(".board").mCustomScrollbar({
      axis: "x",
      theme: "inset-2",
      scrollInertia: 0,
      mouseWheel: {
        enable: false
      }
    });
    $(".list-cards").mCustomScrollbar({
      axis: "y",
      theme: "minimal-dark",
      scrollInertia: 0
    });
  });
};

$(function() {
  Trello.authorize({
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
