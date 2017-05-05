var me = {}, teamArr = [], boardArr = [], listArr = [], cardArr = [];

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
  reapMyBoards(me, teamArr, boardArr, listArr, cardArr);
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

function reapMyBoards(meObj, tArr, bArr, lArr, cArr) {

  Trello.get("members/me").done(function(mdata) {
    Object.assign(meObj, mdata);
  });

  Trello.get("members/me/organizations").done(function(tdata) {
    var tdLen = tdata.length;
    for (var td = 0; td < tdLen; td++) {
      tArr.push(tdata[td]);
    }
  });

  Trello.get("members/me/boards")
  .done(function(bdata) {
    var bdLen = bdata.length;
    for (var bd = 0; bd < bdLen; bd++) {
      $("#viewBoards").append("<div class='board' id='" + bdata[bd].id +
      "'><h1>" + bdata[bd].name + "</h1><div class='board-lists'></div></div>");
      bArr.push(bdata[bd]);
      Trello.get("boards/" + bdata[bd].id + "/lists")
      .done(function(ldata) {
        var ldLen = ldata.length;
        for (var ld = 0; ld < ldLen; ld++) {
          $("#" + ldata[ld].idBoard + " > .board-lists")
          .append("<div class='list' id='" + ldata[ld].id + "'><h2>" +
          ldata[ld].name + "</h2><div class='list-cards'></div></div>");
          lArr.push(ldata[ld]);
        }
      });
      Trello.get("boards/" + bdata[bd].id + "/cards")
      .done(function(cdata) {
        var cdLen = cdata.length;
        for (var cd = 0; cd < cdLen; cd++) {
          $("#" + cdata[cd].idList + " > .list-cards")
          .append("<div class='card' id='" + cdata[cd].id + "'><p>" +
          "</p></div>");
          cArr.push(cdata[cd]);
        }
      });
    }
  });

/*
  $.when.apply($, boardArr).done(function() {
    var baLen = boardArr.length;
    for (var ba = 0; ba < baLen; ba++) {
      $("#viewBoards").append("<div class='board' id='" + boardArr[ba].id +
      "'><h1>" + boardArr[ba].name + "</h1><div class='board-lists'></div></div>");
    }
  });

  $.when.apply($, listArr).done(function() {
    var laLen = listArr.length;
    for (var la = 0; la < laLen; la++) {
      $("#" + listArr[la].idBoard + " > .board-lists")
      .append("<div class='list' id='" + listArr[la].id + "'><h2>" +
      listArr[la].name + "</h2><div class='list-cards'></div></div>");
    }
  });

  $.when.apply($, cardArr).done(function() {
    var caLen = cardArr.length;
    for (var ca = 0; ca < caLen; ca++) {
      $("#" + cardArr[ca].idList + " > .list-cards")
      .append("<div class='card' id='" + cardArr[ca].id + "'><p>" +
      "</p></div>");
    }
  });
*/

}
