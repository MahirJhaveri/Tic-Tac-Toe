const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http, {'pingInterval': 6000, 'pingTimeout': 5000});
const fs = require('fs');
const cookieParser = require('cookie-parser');
const ioCookieParser = require('socket.io-cookie');
const pug = require('pug');

const PORT = 3000

app.use(express.static('Assets'));
app.use(express.static('Src'));
app.use(express.static('styles'));
app.use(cookieParser());
app.set('view engine', 'pug');
io.use(ioCookieParser);

// Features -
// Repeated names supported.
// Multiple windows supported.


//TODO -
// Use better matchmaking algorithms
// Give limited time for players to play
// Improve code quality. Possibly use OOP

//NOTE -
// Disconnect fires immidiately
// Error occurs when client disconnects immidiately after connecting,
// while connection code is still under action


// Varaible for keeping track of players
// Keys are player uid(the socket id)
var active_players = {};
var ready_players = [];

// Array helper methods
// Put into a separate module later...
function val_in_arr(val, arr){
  for(var i = 0; i < arr.length; i++){
    if(arr[i] === val){
      return true;
    }
  }
  return false;
}

// Socket, Player Management Methods
// Put in separate module later...
function handle_new_connection(socket){
  var cookies = socket.request.headers.cookie;
  if(!cookies){ //If the cookies do not exist then disconnect immidiately
    socket.disconnect()
  }
  var name = cookies.name;
  var uid = socket.id; //Can be used as a unique id for a player as it is unique for each session. Name is not unique.
  active_players[uid] = {
    socket : socket,      // The Socket connection
    status : "waiting",   // Status of the game
    opponent_uid : null,  // UId of the opponent
    opponent_name : null, // Opponents name
    name : name           // Players name
  };
  console.log(name + " connected. UID = " + uid);
  socket.emit("waiting", "Waiting for an opponent...");
  return uid;
}

// Make sure player is in waiting state before assigning new opponent
function assign_new_opponent(name, uid){
  if(active_players[uid]['status'] === 'waiting'){
    if(ready_players.length == 0){
      ready_players.push(uid);
    }
    else{
      var opponent_uid = ready_players.pop();
      active_players[uid]['status'] = "in-game";
      active_players[opponent_uid]['status'] = "in-game";
      active_players[uid]['opponent_uid'] = opponent_uid;
      active_players[opponent_uid]['opponent_uid'] = uid;
      active_players[uid]['opponent_name'] = active_players[opponent_uid]['name'];
      active_players[opponent_uid]['opponent_name'] = active_players[uid]['name'];
      var name = active_players[uid]['name'];
      var opponent_name = active_players[opponent_uid]['name'];
      active_players[uid]['socket'].emit("opponent", opponent_name);
      active_players[opponent_uid]['socket'].emit("opponent", name);
      assign_symbols(uid, opponent_uid);
    }
  }
}

// Function that assigns symbols to each of the two opponents.
function assign_symbols(player1_uid, player2_uid){
  active_players[player1_uid]['symbol'] = 'X';
  active_players[player2_uid]['symbol'] = 'O';
  active_players[player1_uid]['socket'].emit("symbol", 'X');
  active_players[player2_uid]['socket'].emit("symbol", 'O');
  active_players[player1_uid]['socket'].emit("your move");
  active_players[player2_uid]['socket'].emit("opponent playing");
}

// EDIT - removed reassigning opponents part
function handle_disconnection(uid, name, reason){
  if(active_players[uid]['status'] === "in-game"){
    var opponent_uid = active_players[uid]['opponent_uid'];
    active_players[opponent_uid]['status'] = "game over";
    active_players[opponent_uid]['opponent_uid'] = null;
    active_players[opponent_uid]['opponent_name'] = null;
    active_players[opponent_uid]['socket'].emit("opponent disconnected", "Your opponent disconnected...");
  }
  if(val_in_arr(uid, ready_players)){
    ready_players.pop();
  }
  active_players[uid] = undefined;
  console.log(name + " disconnected. Reason - " + reason);
}

// Routing Methods
app.get('/', function(req, res){
  var cookies = req.cookies;
  if(!cookies.name){
    res.redirect('/signup');
  }
  else{
    res.redirect('/game');
  }
});

app.get('/signup', function(req, res){
  var file = fs.readFileSync('./views/signup.html');
  res.type('html');
  res.send(file);
});

app.get('/game', function(req, res){
  var cookies = req.cookies;
  if(!cookies.name){
    res.redirect('/signup');
  }
  else{
    res.render('game.pug', {message:"Welcome, " + cookies.name + "."});
  }
})

app.get('/check_name', function(req, res){
  var name = req.query.name;
  /*if(names[name]){
  res.json({
  "messageStatus" : "0",
  "message" : "This name is already in use"
});
}*/
res.cookie('name', name);
res.json({
  "messageStatus" : "1"
});
});

io.on("connection", function(socket){
  var player_uid = handle_new_connection(socket);
  var player_name = active_players[player_uid]['name'];
  assign_new_opponent(player_name, player_uid);
  socket.on("move", function(move){
    var opponents_uid = active_players[player_uid]['opponent_uid'];
    active_players[opponents_uid]['socket'].emit("opponent move", move);
    socket.emit("opponent playing");
    active_players[opponents_uid]['socket'].emit("your move");
  });
  socket.on("victory", function(move){
    var opponents_uid = active_players[player_uid]['opponent_uid'];
    active_players[opponents_uid]['socket'].emit("you lose", move);
  });
  socket.on("draw", function(move){
    var opponents_uid = active_players[player_uid]['opponent_uid'];
    active_players[opponents_uid]['socket'].emit("draw", move);
  })
  socket.on("disconnect", function(reason){
    socket.emit("holy shit");
    handle_disconnection(player_uid, player_name, reason);
  });
})

http.listen(PORT, function(){
  console.log("App listening on port " + PORT);
})
