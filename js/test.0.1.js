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

var myList = "INSERT YOUR IDLIST HERE"
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

Trello.post('/cards/', newCard, creationSuccess);
