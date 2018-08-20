// First implementing without phaser...
var game = null;
var board = [null,null,null,null,null,null,null,null,null];
var game_inprogress = false;
var symbol = '';

function generate_game(socket){
  // to implement...
  $('#grid').css("visibility", "visible");
  clear_board();
  board = [null,null,null,null,null,null,null,null,null];
  game_inprogress = true;
}

function play_move(game, symbol){
  // to implement...
  // move object to be broadcasted...
  return {
    cellID : cellID,
    symbol : symbol
  }
}

function opponents_move(game, move){
  // to implement...
  board[move.cellID - 1] = 0;
  document.getElementById(move.cellID).innerHTML = move.symbol;
}

// Called after game is over
function game_over(){
  disable_button(true);
  $("#play-again").css("visibility", "visible");
  game_inprogress = false;
}

// Called to hide the entire grid
function destroy_game(game, socket){
  //code that destroys the game
  $('#grid').css("visibility", "hidden");
  return false;
}


// function to reload page
function reload_page(){
  location.reload();
}

// val must be boolean
function disable_button(val){
  $('#1').prop('disabled', val);
  $('#2').prop('disabled', val);
  $('#3').prop('disabled', val);
  $('#4').prop('disabled', val);
  $('#5').prop('disabled', val);
  $('#6').prop('disabled', val);
  $('#7').prop('disabled', val);
  $('#8').prop('disabled', val);
  $('#9').prop('disabled', val);
}

function clear_board(){
  $('#1').text(" ");
  $('#2').text(" ");
  $('#3').text(" ");
  $('#4').text(" ");
  $('#5').text(" ");
  $('#6').text(" ");
  $('#7').text(" ");
  $('#8').text(" ");
  $('#9').text(" ");
}

function changeState(element){
  var id = element.id;
  if (board[id-1] == null && game_inprogress == true)
  {
    board[id-1] = 1;
    document.getElementById(id).innerHTML = symbol;
    var move = {
      cellID : id,
      symbol : symbol
    };
    checkGameState(move);
    disable_button(true);
  }
}

// Function to check if the game is a draw...
function isDraw(){
  for(var i = 0; i < 9; i++){
    if(board[i] == null){
      return false;
    }
  }
  return true;
}

function checkGameState(last_move){
  if(board[0] == board[1] && board[1] == board[2] && board[0] == 1){
    //Victory...
    socket.emit("victory", last_move);
    update_game_status("You Won! You're Awesome!");
    game_over();
  }
  else if(board[3] == board[4] && board[4] == board[5] && board[3] == 1){
    socket.emit("victory", last_move);
    update_game_status("You Won! You're Awesome!");
    game_over();
  }
  else if(board[6] == board[7] && board[7] == board[8] && board[6] == 1){
    socket.emit("victory", last_move);
    update_game_status("You Won! You're Awesome!");
    game_over();
  }
  else if(board[0] == board[3] && board[3] == board[6] && board[0] == 1){
    socket.emit("victory", last_move);
    update_game_status("You Won! You're Awesome!");
    game_over();
  }
  else if(board[1] == board[4] && board[4] == board[7] && board[1] == 1){
    socket.emit("victory", last_move);
    update_game_status("You Won! You're Awesome!");
    game_over();
  }
  else if(board[2] == board[5] && board[5] == board[8] && board[2] == 1){
    socket.emit("victory", last_move);
    update_game_status("You Won! You're Awesome!");
    game_over();
  }
  else if(board[0] == board[4] && board[4] == board[8] && board[0] == 1){
    socket.emit("victory", last_move);
    update_game_status("You Won! You're Awesome!");
    game_over();
  }
  else if(board[2] == board[4] && board[4] == board[6] && board[2] == 1){
    socket.emit("victory", last_move);
    update_game_status("You Won! You're Awesome!");
    game_over();
  }
  else if(isDraw()){
    //Emit draw status...
    socket.emit("draw", last_move);
    update_game_status("It's a Tie.");
    game_over();
  }
  else{
    socket.emit("move", last_move);
  }
}

function change_connect_status(connected){
  if(connected){
    $('.status-bar').text("Connected to Server");
    $('.status-bar').css("background-color", "#42f01a");
  }
  else{
    $('.status-bar').text("Not Connected to Server");
    $('.status-bar').css("background-color", "#df4151");
  }
}

function update_game_status(msg){
  if(msg == null){
    $('.game-status').text("");
  }
  else{
    $('.game-status').text(msg);
  }
}

function set_opponent_name(name){
  $('.opponent-name').text(name);
}

var socket = io();
var symbol = null;
socket.on("connect", function(){
  console.log("Connected to Game Server.");
  change_connect_status(true);
  set_opponent_name("null");
});
socket.on("disconnect", function(){
  console.log("Disconnected from Game Server.");
  change_connect_status(false);
  set_opponent_name("null");
  destroy_game(game, socket);
  game = null;
  update_game_status(null);
});
socket.on("waiting", function(msg){
  console.log(msg);
  set_opponent_name("null");
  destroy_game(game, socket);
  game = null;
  update_game_status("Matching with opponent");
});
socket.on("opponent", function(opponent){
  console.log(opponent);
  set_opponent_name(opponent);
});
socket.on("symbol", function(msg){
  console.log("symbol - " + msg);
  symbol = msg;
  game = generate_game(socket);
});
socket.on("your move", function(){
  console.log("Your turn!");
  update_game_status("Your turn. Play!");
  disable_button(false);
});
socket.on("opponent playing", function(){
  console.log("Waiting for opponent to play");
  update_game_status("Opponent's turn");
});
socket.on("opponent move", function(move){
  console.log("Opponent's move");
  opponents_move(game, move);
});
socket.on("draw", function(move){
  opponents_move(game, move);
  update_game_status("It's a Tie.");
  game_over();
});
socket.on("you lose", function(move){
  opponents_move(game, move);
  update_game_status("Too bad, You lost.");
  game_over();
});
socket.on("opponent disconnected", function(msg){
  console.log(msg);
  if(game_inprogress){
    set_opponent_name("null");
    game_over();
    destroy_game(game, socket);
    update_game_status("Opponent disconnected");
  }
});
socket.on("clearNameCookie", function(){ //Clear name cookie and go back to signup page
  console.log("Clearing the Name cookie");
  document.cookie = "";
  location.href = "/signup";
});
