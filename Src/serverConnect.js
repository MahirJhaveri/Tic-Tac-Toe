
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

function set_opponent_name(name){
  $('.opponent-name').text(name);
}

function connectToServer(){
  var socket = io();
  var game = null;
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
    //destroy_game(game, socket);
    game = null;
  })
  socket.on("waiting", function(msg){
    console.log(msg);
    set_opponent_name("null");
    //destroy_game(game, socket);
    game = null;
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
    var move = play_move(game, symbol);
    socket.emit("move", move);
  });
  socket.on("opponent playing", function(){
    console.log("Waiting for opponent to play");
  });
  socket.on("opponent move", function(move){
    console.log("Opponent's move");
    opponents_move(game, move);
  });
  socket.on("opponent disconnected", function(msg){
    console.log(msg);
    set_opponent_name("null");
    //destroy_game(game, socket);
    game = null;
  })
}

connectToServer();
