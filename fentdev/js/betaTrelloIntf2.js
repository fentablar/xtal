$(function() {
  const trelloAuthFail = function() {
    $(".loadHeading").html("Trello did not authorize");
    $(".loadSubHeading").html("please ensure you click \u0022Allow\u0022 " +
      "so the app can connect to Trello\u003B you may need to clear your " +
      "browser cache before attempting to reauthenticate");
  };
  const trelloAuthSuccess = function() {
    $(".loadHeading").html("Fetching Data");
    $(".loadSubheading").html("one moment please\u2026");
    getAllData();
  }

  $(".loadHeading").html("Authorizing Trello\u2026");
  $(".loadSubHeading")
      .html("please allow pop\u2010ups on this site in order to authenticate");

  Trello.authorize({
    type: "popup",
    name: "xtal Trello Interface",
    scope: {
      read: "true",
      write: "true"
    },
    expiration: "never",
    success: trelloAuthSuccess,
    error: trelloAuthFail
  });

  $(".navButton").on("click", function() {
    $(".navButton").removeClass("navActive");
    $(this).addClass("navActive");
    let opt = $(this).attr("id");
    if (opt === "dashButton") {
      $("#viewDash").css("display", "block");
      $("#viewBoards").css("display", "none");
    }
    else {
      $("#viewDash").css("display", "none");
      $("#viewBoards").css("display", "block");
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
    let boardOpt = $("#boardSelect option:selected").val();
    if (boardOpt === "allBoards") {
      $(".board, .actCard, .cmpCard, .nddCard").removeClass("hideMe");
    }
    else {
      $(".board, .actCard, .cmpCard, .nddCard").addClass("hideMe");
      $("#" + boardOpt + ", .board-" + boardOpt).removeClass("hideMe");
    }
  });

  function getAllData() {
    const me = {}, teamArr = [], boardArr = [], listArr = [], cardArr = [];

    const getBoards = Trello.get("members/me/boards").then(function(data) {
      const len = data.length;
      for (let i = 0; i < len; i++) {
        boardArr.push(data[i]);
      }
      return boardArr;
    });

    const getLists = getBoards.then(function(bdata) {
      console.log("getlists bdata: " + bdata);
      return bdata.map(function(brd) {
        return Trello.get("boards/" + brd.id + "/lists")
                .then(function(data) {
                  const len = data.length;
                  console.log(len);
                  for (let i = 0; i < len; i++) {
                    listArr.push(data[i]);
                  }
                });
      });
    });

    const getCards = getBoards.then(function(bdata) {
      console.log("getcards bdata: " + bdata);
      return bdata.map(function(brd) {
        return Trello.get("boards/" + brd.id + "/cards")
                .then(function(data) {
                  const len = data.length;
                  for (let i = 0; i < len; i++) {
                    cardArr.push(data[i]);
                  }
                });
      });
    });

    Trello.get("members/me").then(function(data) {
      Object.assign(me, data);
    });

    Trello.get("members/me/organizations").then(function(data) {
      const len = data.length;
      for (let i = 0; i < len; i++) {
        teamArr.push(data[i]);
      }
    });

    Promise.all([getBoards, getLists, getCards]).then(function() {
      $(".loadNotice").css("display", "none");
      $("#viewDash").css("display", "block");
      $("#headerMain > .headerNav, .pageCopy").css("visibility", "visible");
      reapBoards();
      reapLists(listArr);
      reapCards();
      console.log(boardArr);
      console.log(listArr);
      console.log(cardArr);
    });

    function reapBoards() {
      const len = boardArr.length;
      console.log("board len: " + len);
      for (let i = 0; i < len; i++) {
        console.log("board item: " + boardArr[i]);
        $("#viewBoards").append("<div class='board' id='" + boardArr[i].id +
        "'><h1><a href='" + boardArr[i].url + "' target='_blank'>" +
        boardArr[i].name + "</a></h1><div class='board-lists'></div></div>");
        $(".selector").append("<option value='" + boardArr[i].id + "'>" +
        boardArr[i].name + "</option>");
      }
    }

    function reapLists(listArr) {
      const len = listArr.length;
      console.log("list len: " + len);
      for (let i = 0; i < len; i++) {
        console.log("list item: " + listArr[i]);
        $("#" + listArr[i].idBoard + " > .board-lists")
        .append("<div class='list' id='" + listArr[i].id + "'><h2>" +
        listArr[i].name + "</h2><div class='list-cards'></div></div>");
      }
    }

    function reapCards() {
      const lang = navigator.language, dtNow = new Date(Date.now()),
            dtHM = {hour: "numeric", minute: "numeric"},
            dtMD = {month: "short", day: "numeric"},
            dtYMD = Object.create(dtMD);
            dtYMD.year = "numeric";
      const dtMDHM = Object.create(dtHM);
            dtMDHM.month = "short";
            dtMDHM.day = "numeric";
      const dtYMDHM = Object.create(dtMDHM);
            dtYMDHM.year = "numeric";
      const pastDue = [], todayDue = [], futureDue = [],
            nullDue = [], cmpDue = [];

      brdVwDueDateArr();
      ddView();

      function brdVwDueDateArr() {
        const len = cardArr.length;
        console.log("card len: " + len);
        for (let i = 0; i < len; i++) {
          console.log("card item: " + cardArr[i]);
          let iLabels = "", iDue = "";
          if (cardArr[i].labels.length > 0) {
            for (let k = 0; k < cardArr[i].labels.length; k++) {
              iLabels += "<div class='crdLbl' style='background-color:" +
              cardArr[i].labels[k].color + "'></div>";
            }
          }
          if (cardArr[i].due !== null) {
            iDue += "Due\u003A\u2002" + new Date(cardArr[i].due)
                      .toLocaleString(lang, dtYMDHM);
          }
          $("#" + cardArr[i].idList + " > .list-cards")
            .append("<a href='" + cardArr[i].url + "' target='_blank'>" +
            "<div class='card' id='" + cardArr[i].id + "'>" +
            "<div class='crdLabels'>" + iLabels + "</div>" +
            "<div class='crdName'>" + cardArr[i].name + "</div>" +
            "<div class='crdDue'>" + iDue + "</div></div></a>");
          if (cardArr[i].due === null) nullDue.push(cardArr[i]);
          else {
            let dueLocale = new Date(cardArr[i].due).toLocaleDateString();
            if (cardArr[i].dueComplete === true) cmpDue.push(cardArr[i]);
            else if (dueLocale === dtNow.toLocaleDateString()) todayDue.push(cardArr[i]);
            else if (cardArr[i].due < dtNow.toISOString()) pastDue.push(cardArr[i]);
            else futureDue.push(cardArr[i]);
          }
        }
      }

      function ddView() {
        const brdLen = boardArr.length, lstLen = listArr.length;
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
        if (pastDue.length === 0) {
          $("#pastDue > .cardContainer")
            .append("<div class='zeroResults'>No Past Due Items</div>");
        }
        else {
          const len = pastDue.length;
          for (let i = 0; i < len; i++) {
            let iDate = new Date(pastDue[i].due).toLocaleString(lang, dtYMD),
                iDLA = new Date(pastDue[i].dateLastActivity).toLocaleString(lang, dtYMDHM),
                iBoard = "", iList = "";
            for (let k = 0; k < brdLen; k++) {
              if (boardArr[k].id === pastDue[i].idBoard) {
                iBoard = boardArr[k].name;
                break;
              }
            }
            for (let k = 0; k < lstLen; k++) {
              if (listArr[k].id === pastDue[i].idList) {
                iList = listArr[k].name;
                break;
              }
            }
            $("#pastDue > .cardContainer")
              .append("<div class='actCard board-" + pastDue[i].idBoard +
              "' id='act-" + pastDue[i].id + "'><a href='" + pastDue[i].url +
              "' target='_blank'><div class='cardDue'>" + iDate + "</div>" +
              "<div class='cardDesc'>" + pastDue[i].name + "</div>" +
              "<div class='cardSrc'><div class='cardSrcBoard'>" +
              "board\u003A\u2002" + iBoard + "</div>" +
              "<div class='cardSrcList'>list\u003A\u2002" + iList + "</div>" +
              "<div class='cardLastAct'>last activity\u003A\u2002" + iDLA +
              "</div></div></a></div>");
          }
        }
        if (todayDue.length === 0) {
          $("#todayDue > .cardContainer")
            .append("<div class='zeroResults'>No Items Due Today</div>");
        }
        else {
          const len = todayDue.length;
          for (let i = 0; i < len; i++) {
            let iDate = new Date(todayDue[i].due).toLocaleString(lang, dtHM),
                iDLA = new Date(todayDue[i].dateLastActivity).toLocaleString(lang, dtYMDHM),
                iBoard = "", iList = "";
            for (let k = 0; k < brdLen; k++) {
              if (boardArr[k].id === todayDue[i].idBoard) {
                iBoard = boardArr[k].name;
                break;
              }
            }
            for (let k = 0; k < lstLen; k++) {
              if (listArr[k].id === todayDue[i].idList) {
                iList = listArr[k].name;
                break;
              }
            }
            $("#todayDue > .cardContainer")
              .append("<div class='actCard board-" + todayDue[i].idBoard +
              "' id='act-" + todayDue[i].id + "'><a href='" + todayDue[i].url +
              "' target='_blank'><div class='cardDue'>" + iDate + "</div>" +
              "<div class='cardDesc'>" + todayDue[i].name + "</div>" +
              "<div class='cardSrc'><div class='cardSrcBoard'>" +
              "board\u003A\u2002" + iBoard + "</div>" +
              "<div class='cardSrcList'>list\u003A\u2002" + iList + "</div>" +
              "<div class='cardLastAct'>last activity\u003A\u2002" + iDLA +
              "</div></div></a></div>");
          }
        }
        if (futureDue.length === 0) {
          $("#futureDue > .cardContainer")
            .append("<div class='zeroResults'>No Upcoming Items</div>");
        }
        else {
          const len = futureDue.length;
          for (let i = 0; i < len; i++) {
            let iDate = new Date(futureDue[i].due).toLocaleString(lang, dtMDHM),
                iDLA = new Date(futureDue[i].dateLastActivity).toLocaleString(lang, dtMDHM),
                iBoard = "", iList = "";
            for (let k = 0; k < brdLen; k++) {
              if (boardArr[k].id === futureDue[i].idBoard) {
                iBoard = boardArr[k].name;
                break;
              }
            }
            for (let k = 0; k < lstLen; k++) {
              if (listArr[k].id === futureDue[i].idList) {
                iList = listArr[k].name;
                break;
              }
            }
            $("#futureDue > .cardContainer")
              .append("<div class='actCard board-" + futureDue[i].idBoard +
              "' id='act-" + futureDue[i].id + "'><a href='" + futureDue[i].url +
              "' target='_blank'><div class='cardDue'>" + iDate + "</div>" +
              "<div class='cardDesc'>" + futureDue[i].name + "</div>" +
              "<div class='cardSrc'><div class='cardSrcBoard'>" +
              "board\u003A\u2002" + iBoard + "</div>" +
              "<div class='cardSrcList'>list\u003A\u2002" + iList + "</div>" +
              "<div class='cardLastAct'>last activity\u003A\u2002" + iDLA +
              "</div></div></a></div>");
          }
        }
        if (cmpDue.length === 0) {
          $("#cmpItemsContainer")
            .append("<div class='zeroResults'>No Completed Items</div>");
        }
        else {
          const len = cmpDue.length;
          for (let i = 0; i < len; i++) {
            let iDLA = new Date(cmpDue[i].dateLastActivity).toLocaleString(lang, dtYMDHM),
                iBoard = "", iList = "";
            for (let k = 0; k < brdLen; k++) {
              if (boardArr[k].id === cmpDue[i].idBoard) {
                iBoard = boardArr[k].name;
                break;
              }
            }
            for (let k = 0; k < lstLen; k++) {
              if (listArr[k].id === cmdDue[i].idList) {
                iList = listArr[i].name;
                break;
              }
            }
            $("#cmpItemsContainer")
              .append("<div class='cmpCard board-" + cmpDue[i].idBoard +
              "' id='cmp" + cmpDue[i].id + "'><a href='" + cmpDue[i].url +
              "' target='_blank'><div class='cardDesc'>" + cmpDue[i].name +
              "</div><div class='cardSrc'><div class='cardSrcBoard'>" +
              "board\u003A\u2002" + iBoard + "</div><div class='cardSrcList'>" +
              "list\u003A\u2002" + iList + "</div><div class='cardLastAct'>" +
              "last activity\u003A\u2002" + iDLA + "</div></div></a></div>");
          }
        }
        if (nullDue.length === 0) {
          $("#noDueDatesContainer")
            .append("<div class='zeroResults'>No Items Without Due Dates</div>");
        }
        else {
          const len = nullDue.length;
          for (let i = 0; i < len; i++) {
            let iDLA = new Date(nullDue[i].dateLastActivity).toLocaleString(lang, dtYMDHM),
                iBoard = "", iList = "";
            for (let k = 0; k < brdLen; k++) {
              if (boardArr[k].id === nullDue[i].idBoard) {
                iBoard = boardArr[k].name;
                break;
              }
            }
            for (var k = 0; k < lstLen; k++) {
              if (listArr[k].id === nullDue[i].idList) {
                iList = listArr[k].name;
                break;
              }
            }
            $("#noDueDatesContainer")
              .append("<div class='nddCard board-" + nullDue[i].idBoard +
              "' id='ndd-" + nullDue[i].id + "'><a href='" + nullDue[i].url +
              "' target='_blank'><div class='cardDesc'>" + nullDue[i].name +
              "</div><div class='cardSrc'><div class='cardSrcBoard'>" +
              "board\u003A\u2002" + iBoard + "</div><div class='cardSrcList'>" +
              "list\u003A\u2002" + iList + "</div><div class='cardLastAct'>" +
              "last activity\u003A\u2002" + iDLA + "</div></div></a></div>");
          }
        }
      }
    }
  }
});
