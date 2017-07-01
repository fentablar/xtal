$(function() {
  "use strict";

  const trelloAuthFail = () => {
    $(".loadHeading").html("Trello did not authorize");
    $(".loadSubHeading").html("please ensure you click \u0022Allow\u0022 " +
      "so the app can connect to Trello\u003B you may need to clear your " +
      "browser cache before attempting to reauthenticate");
  };
  const trelloAuthSuccess = () => {
    $(".loadHeading").html("Fetching Data");
    $(".loadSubHeading").html("one moment please\u2026");
    getAllData();
  };

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

    const getBoards = Trello.get("members/me/boards").then(data => {
                        boardArr.push(...data);
                        return boardArr;
                      });

    const getLists = getBoards.then(bdata =>
      Promise.all(bdata.map(brd =>
        Trello.get("boards/" + brd.id + "/lists")
          .then(data => listArr.push(...data)))));

    const getCards = getBoards.then(bdata =>
      Promise.all(bdata.map(brd =>
        Trello.get("boards/" + brd.id + "/cards")
          .then(data => cardArr.push(...data)))));

    Trello.get("members/me").then(data => Object.assign(me, data));

    Trello.get("members/me/organizations").then(data => teamArr.push(...data));

    Promise.all([getBoards, getLists, getCards]).then(() => {
      $(".loadNotice").css("display", "none");
      $("#viewDash").css("display", "block");
      $("#headerMain > .headerNav, .pageCopy").css("visibility", "visible");
      reapBoards();
      reapLists();
      reapCards();
    });

    function reapBoards() {
      for (let brd of boardArr) {
        $("#viewBoards").append("<div class='board' id='" + brd.id + "'>" +
        "<h1><a href='" + brd.url + "' target='_blank'>" + brd.name + "</a></h1>" +
        "<div class='board-lists'></div></div>");

        $(".selector").append("<option value='" + brd.id + "'>" +
        brd.name + "</option>");
      }
    }

    function reapLists() {
      for (let lst of listArr) {
        $("#" + lst.idBoard + " > .board-lists")
          .append("<div class='list' id='" + lst.id + "'>" +
          "<h2>" + lst.name + "</h2><div class='list-cards'></div></div>");
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
        for (let crd of cardArr) {
          let labels = "", due = "";
          if (crd.labels.length > 0) {
            for (let lbl of crd.labels) {
              labels += "<div class='crdLbl' style='background-color:" +
              lbl.color + "'></div>";
            }
          }
          if (crd.due !== null) {
            due += "Due\u003A\u2002" + new Date(crd.due)
              .toLocaleString(lang, dtYMDHM);
          }
          $("#" + crd.idList + " > .list-cards")
            .append("<a href='" + crd.url + "' target='_blank'>" +
            "<div class='card' id='" + crd.id + "'>" +
            "<div class='crdLabels'>" + labels + "</div>" +
            "<div class='crdName'>" + crd.name + "</div>" +
            "<div class='crdDue'>" + due + "</div></div></a>");
          if (crd.due === null) nullDue.push(crd);
          else {
            let dueLocale = new Date(crd.due).toLocaleDateString(),
                nowLocale = dtNow.toLocaleDateString();
            if (crd.dueComplete) cmpDue.push(crd);
            else if (dueLocale === nowLocale) todayDue.push(crd);
            else if (crd.due < dtNow.toISOString()) pastDue.push(crd);
            else futureDue.push(crd);
          }
        }
      }

      function ddView() {
        const actionSort = (a, b) => {
          if (a.due < b.due) return -1;
          if (a.due > b.due) return 1;
          return 0;
        }
        pastDue.sort(actionSort);
        todayDue.sort(actionSort);
        futureDue.sort(actionSort);
        cmpDue.sort((a, b) => {
          if (a.dateLastActivity < b.dateLastActivity) return -1;
          if (a.dateLastActivity > b.dateLastActivity) return 1;
          return 0;
        });
        if (!pastDue.length) {
          $("#pastDue > .cardContainer")
            .append("<div class='zeroResults'>No Past Due Items</div>");
        }
        else {
          for (let pst of pastDue) {
            let dt = new Date(pst.due).toLocaleString(lang, dtYMD)
                dla = new Date(pst.dateLastActivity).toLocaleString(lang, dtYMDHM),
                pboard = "", plist = "";
            for (let brd of boardArr) {
              if (brd.id === pst.idBoard) {
                pboard = brd.name;
                break;
              }
            }
            for (let lst of listArr) {
              if (lst.id === pst.idList) {
                plist = lst.name;
                break;
              }
            }
            $("#pastDue > .cardContainer")
              .append("<div class='actCard board-" + pst.idBoard +
              "' id='act-" + pst.id + "'><a href='" + pst.url +
              "' target='_blank'><div class='cardDue'>" + dt + "</div>" +
              "<div class='cardDesc'>" + pst.name + "</div>" +
              "<div class='cardSrc'><div class='cardSrcBoard'>" +
              "board\u003A\u2002" + pboard + "</div>" +
              "<div class='cardSrcList'>list\u003A\u2002" + plist + "</div>" +
              "<div class='cardLastAct'>last activity\u003A\u2002" + dla +
              "</div></div></a></div>");
          }
        }
        if (!todayDue.length) {
          $("#todayDue > .cardContainer")
            .append("<div class='zeroResults'>No Items Due Today</div>");
        }
        else {
          for (let tdy of todayDue) {
            let dt = new Date(tdy.due).toLocaleString(lang, dtHM)
                dla = new Date(tdy.dateLastActivity).toLocaleString(lang, dtYMDHM),
                tboard = "", tlist = "";
            for (let brd of boardArr) {
              if (brd.id === tdy.idBoard) {
                tboard = brd.name;
                break;
              }
            }
            for (let lst of listArr) {
              if (lst.id === tdy.idList) {
                tlist = lst.name;
                break;
              }
            }
            $("#todayDue > .cardContainer")
              .append("<div class='actCard board-" + tdy.idBoard +
              "' id='act-" + tdy.id + "'><a href='" + tdy.url +
              "' target='_blank'><div class='cardDue'>" + dt + "</div>" +
              "<div class='cardDesc'>" + tdy.name + "</div>" +
              "<div class='cardSrc'><div class='cardSrcBoard'>" +
              "board\u003A\u2002" + tboard + "</div>" +
              "<div class='cardSrcList'>list\u003A\u2002" + tlist + "</div>" +
              "<div class='cardLastAct'>last activity\u003A\u2002" + dla +
              "</div></div></a></div>");
          }
        }
        if (!futureDue.length) {
          $("#futureDue > .cardContainer")
            .append("<div class='zeroResults'>No Upcoming Items</div>");
        }
        else {
          for (let fut of futureDue) {
            let dt = new Date(fut.due).toLocaleString(lang, dtYMDHM)
                dla = new Date(tdy.dateLastActivity).toLocaleString(lang, dtYMDHM),
                fboard = "", flist = "";
            for (let brd of boardArr) {
              if (brd.id === fut.idBoard) {
                fboard = brd.name;
                break;
              }
            }
            for (let lst of listArr) {
              if (lst.id === fut.idList) {
                flist = lst.name;
                break;
              }
            }
            $("#futureDue > .cardContainer")
              .append("<div class='actCard board-" + fut.idBoard +
              "' id='act-" + fut.id + "'><a href='" + fut.url +
              "' target='_blank'><div class='cardDue'>" + dt + "</div>" +
              "<div class='cardDesc'>" + fut.name + "</div>" +
              "<div class='cardSrc'><div class='cardSrcBoard'>" +
              "board\u003A\u2002" + fboard + "</div>" +
              "<div class='cardSrcList'>list\u003A\u2002" + flist + "</div>" +
              "<div class='cardLastAct'>last activity\u003A\u2002" + dla +
              "</div></div></a></div>");
          }
        }
        if (!cmpDue.length) {
          $("#cmpItemsContainer")
            .append("<div class='zeroResults'>No Completed Items</div>");
        }
        else {
          for (let cmp of cmpDue) {
            let dla = new Date(cmp.dateLastActivity).toLocaleString(lang, dtYMDHM),
                cboard = "", clist = "";
            for (let brd of boardArr) {
              if (brd.id === cmp.idBoard) {
                cboard = brd.name;
                break;
              }
            }
            for (let lst of listArr) {
              if (lst.id === cmp.idList) {
                clist = lst.name;
                break;
              }
            }
            $("#cmpItemsContainer")
              .append("<div class='cmpCard board-" + cmp.idBoard +
              "' id='cmp" + cmp.id + "'><a href='" + cmp.url +
              "' target='_blank'><div class='cardDesc'>" + cmp.name +
              "</div><div class='cardSrc'><div class='cardSrcBoard'>" +
              "board\u003A\u2002" + cboard + "</div><div class='cardSrcList'>" +
              "list\u003A\u2002" + clist + "</div><div class='cardLastAct'>" +
              "last activity\u003A\u2002" + dla + "</div></div></a></div>");
          }
        }
        if (!nullDue.length) {
          $("#noDueDatesContainer")
            .append("<div class='zeroResults'>No Items Without Due Dates</div>");
        }
        else {
          for (let n of nullDue) {
            let dla = new Date(n.dateLastActivity).toLocaleString(lang, dtYMDHM);
                nboard = "", nlist = "";
            for (let brd of boardArr) {
              if (brd.id === n.idBoard) {
                nboard = brd.name;
                break;
              }
            }
            for (let lst of listArr) {
              if (lst.id === n.idList) {
                nlist = lst.name;
                break;
              }
            }
            $("#noDueDatesContainer")
              .append("<div class='nddCard board-" + n.idBoard +
              "' id='ndd-" + n.id + "'><a href='" + n.url +
              "' target='_blank'><div class='cardDesc'>" + n.name +
              "</div><div class='cardSrc'><div class='cardSrcBoard'>" +
              "board\u003A\u2002" + nboard + "</div><div class='cardSrcList'>" +
              "list\u003A\u2002" + nlist + "</div><div class='cardLastAct'>" +
              "last activity\u003A\u2002" + dla + "</div></div></a></div>");
          }
        }
      }
    }
  }
});
