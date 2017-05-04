var trelloAuthFail = function() {
  console.log("Trello auth FAIL");
  $("#viewBoards").append("<div class='board'><h1>Trello authorization error</h1>" +
  "<br><p>Trello did not authorize&period;&ensp;" +
  "Please ensure you click &quot;Allow&quot; so the app can connect to " +
  "Trello&semi; you may need to clear your browser cache before " +
  "attempting to reauthenticate&period;");
}

var trelloAuthSuccess = function() {
  console.log("Trello auth SUCCESS");
  $.when(getMe(me))
  .then(getMyBoards(myBoardsArr))
  .then(getMyBoardsLists(myBoardsArr, myBoardsListsArr))
  .then(getMyBoardsCards(myBoardsArr, myBoardsCardsArr))
  .then(myBoardsHtml(myBoardsArr))
  .then(myBoardsListsHtml(myBoardsListsArr))
  .done(myBoardsCardsHtml(myBoardsCardsArr));
};

$(function() {
  var me, myBoardsArr = [], myBoardsListsArr = [], myBoardsCardsArr = [];
  authorizeTrello();

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
    $(".actionsCategory").toggleClass("hideMe");
  });
});

function authorizeTrello() {
  Trello.authorize({
    type: "popup",
    name: "xtal trello interface",
    scope: {
      read: "true",
      write: "true"
    },
    expiration: "never",
    success: trelloAuthSuccess,
    error: trelloAuthFail
  });
}

function getMe(obj) {
  var dfdMe = $.Deferred();
  Trello.get("members/me", function(data) {
    Object.assign(obj, data);
    dfdMe.resolve();
  });
  return dfdMe.promise();
}

function getMyBoards(boardArr) {
  var dfdBoard = $.Deferred();
  Trello.get("members/me/boards", function(boardData) {
    for (var bd = 0; bd < boardData.length; bd++) {
      boardArr.push(boardData[bd]);
    }
    $.when.apply($, boardArr).then(function() { dfdBoard.resolve(); });
  });
  return dfdBoard.promise();
}

function getMyBoardsLists(boardArr, listArr) {
  var dfdLists = $.Deferred();
  for (var i = 0; i < boardArr.length; i++) {
    Trello.get("boards/" + boardArr[i].id + "/lists", function(listData) {
      for (var ld = 0; ld < listData.length; ld++) {
        listArr.push(listData[ld]);
      }
    });
  }
  $.when.apply($, listArr).then(function() { dfdLists.resolve(); });
  return dfdLists.resolve();
}

function getMyBoardsCards(boardArr, cardArr) {
  var dfdCards = $.Deferred();
  for (var k = 0; k < boardArr.length; k++) {
    Trello.get("boards/" + boardArr[k].id + "/cards", function(cardData) {
      for (var cd = 0; cd < cardData.length; cd++) {
        cardArr.push(cardData[k]);
      }
    });
  }
  $.when.apply($, cardArr).then(function() { dfdCards.resolve(); });
  return dfdCards.promise();
}

function myBoardsHtml(boardArr) {
  var dfdBoardHtml = $.Deferred();
  var tmpArr = [];
  for (var i = 0; i < boardArr.length; i++) {
    $("#viewBoards").append("<div class='board' id='" + boardArr[i].id +
    "'><h1>" + boardArr[i].name + "</h1><div class='board-lists'></div></div>");
    tmpArr.push(i);
  }
  $.when.apply($, tmpArr).then(function() { dfdBoardHtml.resolve(); });
  return dfdBoardHtml.promise();
}

function myBoardsListsHtml(listArr) {
  var dfdListHtml = $.Deferred();
  var tmpArr = []
  for (var i = 0; i < listArr.length; i++) {
    $("#" + listArr[i].idBoard + " > .board-lists").append("<div class='list' id='" +
    listArr[i].id + "'><h2>" + listArr[i].name +
    "</h2><div class='list-cards'></div></div>");
    tmpArr.push(i);
  }
  $.when.apply($, tmpArr).then(function() { dfdListHtml.resolve(); });
  return dfdListHtml.promise();
}

function myBoardsCardsHtml(cardArr) {
  var dfdCardHtml = $.Deferred();
  var tmpArr = [];
  for (var i = 0; i < cardArr.length; i++) {
    $("#" + cardArr[i].idList + " > .list-cards").append("<div class='card' id='" +
    cardArr[i].id + "'><p>" + cardArr[i].name + "</p></div>");
  }
  $.when.apply($, tmpArr).then(function() { dfdCardHtml.resolve(); });
  return dfdCardHtml.promise();
}
