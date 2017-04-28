// Start Building with Trello documentation:
// https://developers.trello.com/get-started/start-building

// Define Success and Failure

var authenticationSuccess = function()
  { console.log('Successful authentication'); 
};

var authenticationFailure = function()
  { console.log('Failed authentication');
};

// Authenticate and Authorize your user

Trello.authorize({
  type: 'popup',
  name: 'Getting Started Application',
  scope: {
    read: 'true',
    write: 'true' },
  expiration: 'never',
  success: authenticationSuccess,
  error: authenticationFailure
});

// Creating a Card (Added my card IDLIST to var myList.)

var myList = "58d282edc3e7513f7fe3d3c4";
var creationSuccess = function(data) {
  console.log('Card created successfully. Data returned:' + JSON.stringify(data));
};

var newCard = {
  name: 'New Test Card', 
  desc: 'This is the description of our new card.',
  // Place this card at the top of our list 
     idList: myList,
     pos: 'top'
};

// Load boards for dropdown select.

var loadedBoards = function(boards) {
  $.each(boards, function(index, value) {
    $('#boardSelect')
      .append($("<option></option>")
      .attr("value",value.id)
      .text(value.name)); 
  });
};

// Get the users boards

var loadBoards = function() {
  Trello.get(
    '/members/me/boards/',
    loadedBoards,
    function() { console.log("Failed to load boards"); }
  );
};

// Submit the Trello card.
$("#submitCard").submit( function() {
    Trello.post('/cards/', newCard, creationSuccess);
});
