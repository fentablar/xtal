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
  reapMyBoards();
};

$(function() {

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

function reapMyBoards() {
  var me;
  var boardArr = [], listArr = [], cardArr = [];

  $.when(function() {
    var dfdMe = $.Deferred();
    Trello.get("members/me", function(meData) {
      Object.assign(me, meData);
      dfdMe.resolve();
    });
    return dfdMe.promise();
  })
  .then(function() {
    var dfdBoard = $.Deferred();
    var tmpArr = [];
    Trello.get("members/me/boards", function(boardData) {
      for (var bd = 0; bd < boardData.length; bd++) {
        boardArr.push(boardData[bd]);
        tmpArr.push(bd);
      }
      $.when.apply($, tmpArr).then(function() { dfdBoard.resolve(); });
    });
    return dfdBoard.promise();
  })
  .then(function() {
    var dfdList = $.Deferred();
    var tmpArr = [];
    for (var bd = 0; bd < boardArr.length; bd++) {
      Trello.get("boards/" + boardArr[bd].id + "/lists", function(listData) {
        for (var ld = 0; ld < listData.length; ld++) {
          listArr.push(listData[ld]);
          tmpArr.push(ld);
        }
      });
    }
    $.when.apply($, tmpArr).then(function() { dfdList.resolve(); });
    return dfdList.promise();
  })
  .then(function() {
    var dfdCard = $.Deferred();
    var tmpArr = [];
    for (var bd = 0; bd < boardArr.length; bd++) {
      Trello.get("boards/" + boardArr[bd].id + "/cards", function(cardData) {
        for (var cd = 0; cd < cardData.length; cd++) {
          cardArr.push(cardData[cd]);
          tmpArr.push(cd);
        }
      });
    }
    $.when.apply($, tmpArr).then(function() { dfdCard.resolve(); });
    return dfdCard.promise();
  })
  .then(function() {
    var dfdBoardHtml = $.Deferred();
    for (var bd = 0; bd < boardArr.length; i++) {
      $("#viewBoards").append("<div class='board' id='" + boardArr[bd].id +
      "'><h1>" + boardArr[bd].name + "</h1><div class='board-lists'></div></div>");
    }
    dfdBoardHtml.resolve();
    return dfdBoardHtml.promise();
  })
  .then(function() {
    var dfdListHtml = $.Deferred();
    for (var ld = 0; ld < listArr.length; ld++) {
      $("#" + listArr[ld].idBoard + " > .board-lists").append("<div class='list' id='" +
      listArr[ld].id + "'><h2>" + listArr[ld].name +
      "</h2><div class='list-cards'></div></div>");
    }
    dfdListHtml.resolve();
    return dfdListHtml.promise();
  })
  .then(function() {
    var dfdCards = $.Deferred();
    for (var cd = 0; cd < cardArr.length; cd++) {
      $("#" + cardArr[cd].idList + " > .list-cards").append("<div class='card' id='" +
      cardArr[cd].id + "'><p>" + cardArr[cd].name + "</p></div>");
    }
    dfdCardHtml.resolve();
    return dfdCardHtml.promise();
  })
  .done(function() { console.log("done"); });
}
