// 0.0.1
// Start Building with Trello documentation:
// https://developers.trello.com/get-started/start-building

// Define Success and Failure

//var authenticationSuccess = function()
  //{ console.log('Successful authentication'); 
//};

//var authenticationFailure = function()
  //{ console.log('Failed authentication');
//};

//// Authenticate and Authorize your user

//Trello.authorize({
  //type: 'popup',
  //name: 'Getting Started Application',
  //scope: {
    //read: 'true',
    //write: 'true' },
  //expiration: 'never',
  //success: authenticationSuccess,
  //error: authenticationFailure
//});

//// Creating a Card (Added my card IDLIST to var myList.)

//var myList = "58d282edc3e7513f7fe3d3c4";
//var creationSuccess = function(data) {
  //console.log('Card created successfully. Data returned:' + JSON.stringify(data));
//};

//var newCard = {
  //name: 'New Test Card', 
  //desc: 'This is the description of our new card.',
  //// Place this card at the top of our list 
     //idList: myList,
     //pos: 'top'
//};

//// Load boards for dropdown select.

//var loadedBoards = function(boards) {
  //$.each(boards, function(index, value) {
    //$('#selectBoard')
      //.append($("<option></option>")
      //.attr("value",value.id)
      //.text(value.name)); 
  //});
//};

//// Get the users boards

//var loadBoards = function() {
  //Trello.get(
    //'/members/me/boards/',
    //loadedBoards,
    //function() { console.log("Failed to load boards"); }
  //);
//};

//// Submit the Trello card.
//$("#submitCard").click(function() {
    //Trello.post('/cards/', newCard, creationSuccess);
//});

var onAuth = function() {
  updateLoggedIn();
  $("#chooseLists").empty();
  
  Trello.members.get("me", function(member){
      $("#fullName").text(member.fullName);
  
      var $boards = $("<select>")
	  .text("Loading Boards...")
	  .appendTo("#chooseLists");

      // List all boards. 
      Trello.get("members/me/boards", function(boards) {
	  $boards.empty();
	  $.each(boards, function(ix, board) {
	      $("<option>")
	      .attr({href: board.url, target: "trello"})
	      .addClass("board")
	      .text(board.name)
	      .appendTo($boards);
	  });  
      });
      
      var $cards = $("<div>")
	  .text("Loading Boards...")
	  .appendTo("#displayCards");

      // Show board based on selection.  
      Trello.get("members/me/cards", function(cards) {
	  $cards.empty();
	  $.each(cards, function(ix, card) {
	      $("<a>")
	      .attr({href: card.url, target: "trello"})
	      .addClass("card")
	      .text(card.name)
	      .appendTo($cards);
	  });  
      });
  });
};

var updateLoggedIn = function() {
    var isLoggedIn = Trello.authorized();
    $("#loggedOut").toggle(!isLoggedIn);
    $("#loggedIn").toggle(isLoggedIn);        
};
    
var logout = function() {
    Trello.deauthorize();
    updateLoggedIn();
};
                          
Trello.authorize({
    interactive:false,
    success: onAuth
});

$("#syncTrello")
.click(function(){
    Trello.authorize({
        type: "popup",
        success: onAuth
    })
});
    
$("userLogOut").click(logout);

