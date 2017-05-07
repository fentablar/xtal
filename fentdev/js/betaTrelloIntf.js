

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
  var me = {}, teamArr = [], boardArr = [], listArr = [], cardArr = [];
  var dfdBoardArr = $.Deferred(), dfdBoardHtml = $.Deferred();
  var dfdListArr = $.Deferred(), dfdListHtml = $.Deferred();
  var dfdCardArr = $.Deferred(), dfdCardHtml = $.Deferred();

  Trello.get("members/me").done(function(mdata) {
    Object.assign(me, mdata);
  });

  Trello.get("members/me/organizations").done(function(tdata) {
    var tdlen = tdata.length;
    for (var td = 0; td < tdlen; td++) {
      teamArr.push(tdata[td]);
    }
  });

  Trello.get("members/me/boards").done(function(bdata) {
    var bd, bdlen = bdata.length, bddone = 0;
    for (bd = 0; bd < bdlen; bd++) {
      boardArr.push(bdata[bd]);
      bddone++;
      if (bddone === bdlen) { console.log("board arr resolve"); dfdBoardArr.resolve(); }
    }
  }).done(function(bdata) {
    var bl, bllen = bdata.length, bldone = 0;
    for (bl = 0; bl < bllen; bl++) {
      Trello.get("boards/" + bdata[bl].id + "/lists").done(function(ldata) {
        var ld, ldlen = ldata.length, lddone = 0;
        bldone++;
        for (ld = 0; ld < ldlen; ld++) {
          listArr.push(ldata[ld]);
          lddone++;
          if (bldone === bllen && lddone === ldlen) { console.log("list arr resolve"); dfdListArr.resolve(); }
        }
      });
    }
  }).done(function(bdata) {
    var bc, bclen = bdata.length, bcdone = 0;
    for (bc = 0; bc < bclen; bc++) {
      Trello.get("boards/" + bdata[bc].id + "/cards").done(function(cdata) {
        var cd, cdlen = cdata.length, cddone = 0;
        bcdone++;
        for (cd = 0; cd < cdlen; cd++) {
          cardArr.push(cdata[cd]);
          cddone++;
          if (bcdone === bclen && cddone === cdlen) { console.log("card arr resolve"); dfdCardArr.resolve(); }
        }
      });
    }
  });

  $.when(dfdBoardArr).done(function() {
    var bh, bhlen = boardArr.length, bhdone = 0;
    for (bh = 0; bh < bhlen; bh++) {
      $("#viewBoards").append("<div class='board' id='" + boardArr[bh].id +
      "'><h1>" + boardArr[bh].name + "</h1><div class='board-lists'></div></div>");
      bhdone++;
      if (bhdone === bhlen) { console.log("board html resolve"); dfdBoardHtml.resolve(); }
    }
  });

  $.when(dfdBoardHtml, dfdListArr).done(function() {
    var lh, lhlen = listArr.length, lhdone = 0;
    for (lh = 0; lh < lhlen; lh++) {
      $("#" + listArr[lh].idBoard + " > .board-lists")
      .append("<div class='list' id='" + listArr[lh].id + "'><h2>" +
      listArr[lh].name + "</h2><div class='list-cards'></div></div>");
      lhdone++;
      if (lhdone === lhlen) { console.log("list html resolve"); dfdListHtml.resolve(); }
    }
  });

  $.when(dfdListHtml, dfdCardArr).done(function() {
    var ch, chlen = cardArr.length, chdone = 0;
    for (ch = 0; ch < chlen; ch++) {
      $("#" + cardArr[ch].idList + " > .list-cards")
      .append("<div class='card' id='" + cardArr[ch].id + "'><p>" +
      cardArr[ch].name + "</p></div>");
      chdone++;
      if (chdone === chlen) { console.log("card html resolve"); dfdCardHtml.resolve(); }
    }
  });
}
