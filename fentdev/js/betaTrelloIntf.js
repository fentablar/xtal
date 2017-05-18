

var trelloAuthFail = function() {
  console.log("Trello auth FAIL");
  $("#viewBoards").append("<div class='board'><h1>Trello authorization error</h1>" +
  "<br><p>Trello did not authorize&period;&ensp;" +
  "Please ensure you click &quot;Allow&quot; so the app can connect to " +
  "Trello&semi; you may need to clear your browser cache before " +
  "attempting to reauthenticate&period;");
}

var trelloAuthSuccess = function() {
  console.log("Trello auth SUCCESS " + Date.now());
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
    $("#actionItems > .dashViewContainer").toggleClass("hideMe");
  });
  $("#cmpItemsShowHide").on("click", function() {
    $("#cmpItems > .dashViewContainer").toggleClass("hideMe");
  });
  $("#noDueDatesShowHide").on("click", function() {
    $("#noDueDates > .dashViewContainer").toggleClass("hideMe");
  });

  $("#boardSelect").change(function() {
    var boardOpt = $("#boardSelect option:selected").val();
    if (boardOpt === "allBoards") {
      $(".board, .actCard, .cmpCard, .nddCard").removeClass("hideMe");
    } else {
      $(".board, .actCard, .cmpCard, .nddCard").addClass("hideMe");
      $("#" + boardOpt + ", .board-" + boardOpt).removeClass("hideMe");
    }
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
  var dtNow = new Date(Date.now());
  var me = {}, teamArr = [], boardArr = [], listArr = [], cardArr = [];
  var dfdBoardArr = $.Deferred(), dfdListArr = $.Deferred(), dfdCardArr = $.Deferred();

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
      if (bddone === bdlen) {
        console.log("board arr resolve " + Date.now()); dfdBoardArr.resolve();
      }
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
          if (bldone === bllen && lddone === ldlen) {
            console.log("list arr resolve " + Date.now()); dfdListArr.resolve();
          }
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
          if (bcdone === bclen && cddone === cdlen) {
            console.log("card arr resolve " + Date.now()); dfdCardArr.resolve();
          }
        }
      });
    }
  });

  $.when(dfdBoardArr, dfdListArr, dfdCardArr).done(function() {
    var bh, lh, ch, pd, td, fd, nd, cmpd;
    var bhlen = boardArr.length, lhlen = listArr.length, chlen = cardArr.length;
    var pastDue = [], todayDue = [], futureDue = [], nullDue = [], cmpDue = [];
    for (bh = 0; bh < bhlen; bh++) {
      $("#viewBoards").append("<div class='board' id='" + boardArr[bh].id +
      "'><h1>" + boardArr[bh].name + "</h1><div class='board-lists'></div></div>");
      $("#boardSelect").append("<option value='" + boardArr[bh].id + "'>" +
      boardArr[bh].name + "</option>");
    }
    for (lh = 0; lh < lhlen; lh++) {
      $("#" + listArr[lh].idBoard + " > .board-lists")
      .append("<div class='list' id='" + listArr[lh].id + "'><h2>" +
      listArr[lh].name + "</h2><div class='list-cards'></div></div>");
    }
    for (ch = 0; ch < chlen; ch++) {
      $("#" + cardArr[ch].idList + " > .list-cards")
      .append("<div class='card' id='" + cardArr[ch].id + "'><p>" +
      cardArr[ch].name + "</p></div>");
      if (cardArr[ch].due === null) { nullDue.push(cardArr[ch]); }
      else if (cardArr[ch].dueComplete === true) { cmpDue.push(cardArr[ch]); }
      else if ((new Date(cardArr[ch].due).toLocaleDateString()) === dtNow.toLocaleDateString())
        { todayDue.push(cardArr[ch]); }
      else if (cardArr[ch].due < dtNow.toISOString()) { pastDue.push(cardArr[ch]); }
      else { futureDue.push(cardArr[ch]); }
    }
    pastDue.sort(function(a, b) {
      if (a.due < b.due) return -1;
      if (a.due > b.due) return 1;
      return 0;
    });
    todayDue.sort(function(a, b) {
      if (a.due < b.due) return -1;
      if (a.due > b.due) return 1;
      return 0;
    });
    futureDue.sort(function(a, b) {
      if (a.due < b.due) return -1;
      if (a.due > b.due) return 1;
      return 0;
    });
    cmpDue.sort(function(a, b) {
      if (a.dateLastActivity > b.dateLastActivity) return -1;
      if (a.dateLastActivity < b.dateLastActivity) return 1;
      return 0;
    });
    for (pd = 0; pd < pastDue.length; pd++) {
      var pdDate = new Date(pastDue[pd].due).toLocaleString(navigator.language, { month: "short", day: "numeric" });
      var pdBoard = "", pdList = "";
      for (var b = 0; b < bhlen; b++) {
        if (boardArr[b].id === pastDue[pd].idBoard) {
          pdBoard = boardArr[b].name;
          break;
        }
      }
      for (var l = 0; l < lhlen; l++) {
        if (listArr[l].id === pastDue[pd].idList) {
          pdList = listArr[l].name;
          break;
        }
      }
      $("#pastDue > .cardContainer").append("<div class='actCard board-" +
      pastDue[pd].idBoard + "' id='act-" + pastDue[pd].id + "'><div class='cardDue'>" +
      pdDate + "</div><div class='cardDesc'>" + pastDue[pd].name +
      "</div><div class='cardSrc'><div class='cardSrcBoard'>board&colon;&ensp;" +
      pdBoard + "</div><div class='cardSrcList'>list&colon;&ensp;" + pdList +
      "</div></div></div>");
    }
    for (td = 0; td < todayDue.length; td++) {
      var tdDate = new Date(todayDue[td].due).toLocaleString(navigator.language, { hour: "numeric", minute: "numeric" });
      var tdBoard = "", tdList = "";
      for (var b = 0; b < bhlen; b++) {
        if (boardArr[b].id === todayDue[td].idBoard) {
          tdBoard = boardArr[b].name;
          break;
        }
      }
      for (var l = 0; l < lhlen; l++) {
        if (listArr[l].id === todayDue[td].idList) {
          tdList = listArr[l].name;
          break;
        }
      }
      $("#todayDue > .cardContainer").append("<div class='actCard board-" +
      todayDue[td].idBoard + "' id='act-" + todayDue[td].id + "'><div class='cardDue'>" +
      tdDate + "</div><div class='cardDesc'>" + todayDue[td].name +
      "</div><div class='cardSrc'><div class='cardSrcBoard'>board&colon;&ensp;" +
      tdBoard + "</div><div class='cardSrcList'>list&colon;&ensp;" + tdList +
      "</div></div></div>");
    }
    for (fd = 0; fd < futureDue.length; fd++) {
      var fdDate = new Date(futureDue[fd].due).toLocaleString(navigator.language, { month: "short", day: "numeric", hour: "numeric", minute: "numeric" });
      var fdBoard = "", fdList = "";
      for (var b = 0; b < bhlen; b++) {
        if (boardArr[b].id === futureDue[fd].idBoard) {
          fdBoard = boardArr[b].name;
          break;
        }
      }
      for (var l = 0; l < lhlen; l++) {
        if (listArr[l].id === futureDue[fd].idList) {
          fdList = listArr[l].name;
          break;
        }
      }
      $("#futureDue > .cardContainer").append("<div class='actCard board-" +
      futureDue[fd].idBoard + "' id='act-" + futureDue[fd].id + "'><div class='cardDue'>" +
      fdDate + "</div><div class='cardDesc'>" + futureDue[fd].name +
      "</div><div class='cardSrc'><div class='cardSrcBoard'>board&colon;&ensp;" +
      fdBoard + "</div><div class='cardSrcList'>list&colon;&ensp;" + fdList +
      "</div></div></div>");
    }
    for (cmpd = 0; cmpd < cmpDue.length; cmpd++) {
      var cmpDate = new Date(cmpDue[cmpd].dateLastActivity).toLocaleString(navigator.language, { year: "numeric", month: "short", day: "numeric", hour: "numeric", minute: "numeric" });
      var cmpBoard = "", cmpList = "";
      for (var b = 0; b < bhlen; b++) {
        if (boardArr[b].id === cmpDue[cmpd].idBoard) {
          cmpBoard = boardArr[b].name;
          break;
        }
      }
      for (var l = 0; l < lhlen; l++) {
        if (listArr[l].id === cmpDue[cmpd].idList) {
          cmpList = listArr[l].name;
          break;
        }
      }
      $("#cmpItemsContainer").append("<div class='cmpCard board-" +
      cmpDue[cmpd].idBoard + "' id='cmp-" + cmpDue[cmpd].id + "'><div class='cardDesc'>" +
      cmpDue[cmpd].name + "</div><div class='cardSrc'><div class='cardSrcBoard'>" +
      "board&colon;&ensp;" + cmpBoard + "</div><div class='cardSrcList'>list&colon;&ensp;" +
      cmpList + "</div><div class='cardLastAct'>last activity&colon;&ensp;" +
      cmpDate + "</div></div></div>");
    }
    for (nd = 0; nd < nullDue.length; nd++) {
      var ndBoard = "", ndList = "";
      for (var b = 0; b < bhlen; b++) {
        if (boardArr[b].id === nullDue[nd].idBoard) {
          ndBoard = boardArr[b].name;
          break;
        }
      }
      for (var l = 0; l < lhlen; l++) {
        if (listArr[l].id === nullDue[nd].idList) {
          ndList = listArr[l].name;
          break;
        }
      }
      $("#noDueDatesContainer").append("<div class='nddCard board-" +
      nullDue[nd].idBoard + "' id='ndd-" + nullDue[nd].id + "'><div class='cardDesc'>" +
      nullDue[nd].name + "</div><div class='cardSrc'><div class='cardSrcBoard'>" +
      "board&colon;&ensp;" + ndBoard + "</div><div class='cardSrcList'>list&colon;&ensp;" +
      ndList + "</div></div></div>");
    }
    /* $(".cardContainer").mCustomScrollbar({
      theme: "dark-3",
      axis: "y",
      mouseWheel: { enable: true }
    });
    $(".board").mCustomScrollbar({
      theme: "inset-2",
      axis: "x",
      scrollInertia: 0,
      mouseWheel: { enable: false }
    });
    $(".list-cards").mCustomScrollbar({
      theme: "minimal-dark",
      axis: "y",
      mouseWheel: { enable: true }
    }); */
    console.log("All Done " + Date.now())
  });
}
