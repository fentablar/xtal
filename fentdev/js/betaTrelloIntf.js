

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
    var bd, bdlen = bdata.length;
    for (bd = 0; bd < bdlen; bd++) {
      boardArr.push(bdata[bd]);
      if (bd + 1 === bdlen) { console.log("board arr resolve"); dfdBoardArr.resolve(); }
    }
  }).done(function(bdata) {
    var bl, bllen = bdata.length, bldone = 0;
    for (bl = 0; bl < bllen; bl++) {
      Trello.get("boards/" + bdata[bl].id + "/lists").done(function(ldata) {
        var ld, ldlen = ldata.length, lddone = 0;
        bldone += 1;
        for (ld = 0; ld < ldlen; ld++) {
          listArr.push(ldata[ld]);
          lddone += 1;
          if (bldone === bllen && lddone === ldlen) { console.log("list arr resolve"); dfdListArr.resolve(); }
        }
      });
    }
  }).done(function(bdata) {
    var bc, bclen = bdata.length, bcdone = 0;
    for (bc = 0; bc < bclen; bc++) {
      Trello.get("boards/" + bdata[bc].id + "/cards").done(function(cdata) {
        var cd, cdlen = cdata.length, cddone = 0;
        bcdone += 1;
        for (cd = 0; cd < cdlen; cd++) {
          cardArr.push(cdata[cd]);
          cddone += 1;
          if (bcdone === bclen && cddone === cdlen) { console.log("card arr resolve"); dfdCardArr.resolve(); }
        }
      });
    }
  });

  $.when(dfdBoardArr).done(function() {
    var bh, bhlen = barr.length;
    for (bh = 0; bh < bhlen; bh++) {
      $("#viewBoards").append("<div class='board' id='" + barr[bh].id +
      "'><h1>" + barr[bh].name + "</h1><div class='board-lists'></div></div>");
      if (bh + 1 === bhlen) { console.log("board html resolve"); dfdBoardHtml.resolve(); }
    }
  });

  $.when(dfdBoardHtml, dfdListArr).done(function() {
    var lh, lhlen = larr.length;
    for (lh = 0; lh < lhlen; lh++) {
      $("#" + larr[lh].idBoard + " > .board-lists")
      .append("<div class='list' id='" + larr[lh].id + "'><h2>" +
      larr[lh].name + "</h2><div class='list-cards'></div></div>");
      if (lh + 1 === lhlen) { console.log("list html resolve"); dfdListHtml.resolve(); }
    }
  });

  $.when(dfdListHtml, dfdCardArr).done(function() {
    var ch, chlen = carr.length;
    for (ch = 0; ch < chlen; ch++) {
      $("#" + carr[ch].idList + " > .list-cards")
      .append("<div class='card' id='" + carr[ch].id + "'><p>" +
      carr[ch].name + "</p></div>");
      if (ch + 1 === chlen) { console.log("card html resolve"); dfdCardHtml.resolve(); }
    }
  });
}
