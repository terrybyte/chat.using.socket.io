var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var ejs = require('ejs');
var fs = require('fs');

http.listen(3000, function (){
	console.log('Server is Ready!');
});

app.use(express.static('public'));

app.get('/', function (req,res){
	console.log('Get - /');
	fs.readFile('Lobby.html', function (err,data){
		res.send(data.toString());
	});	
});

app.get('/secret', function (req,res){
	//namespace
	fs.readFile('talk.html', 'utf8', function (err,data){
		res.send(ejs.render(data, {
			seq: req.param('seq'),
			room: req.param('room')
		}));
	});
});

app.get('/room', function (req,res){
	console.log(rooms);
	res.send(rooms);
});

io.set('log level', 2);

var rooms = {};
var conns = {};
var seq = 0;

io.on('connect', function (socket){

	console.log('connect : ' + socket.id);

	var room = null;

	console.log('connect');
	
	socket.on('join', function(data){
		
		console.log('Welcome to ' + data.room + ' Chat Room!');
		
		socket.join(data.seq);
		
		room = data.seq;
		rooms[data.seq] = data.room;

		console.log(JSON.stringify(conns));
		conns[data.seq].push(socket.id);
		
		console.log(JSON.stringify(rooms));
		console.log(JSON.stringify(conns));
	});

	socket.on('leave', function (){
		console.log('leave connCnt : ' + connCnt);
	});

	socket.on('create_room', function (data){
		console.log('create_room');
		seq++;
		//room = data;
		rooms[seq] = data;	//room count
		conns[seq] = [];	//connections entering a room
		io.emit('create_room', {
			seq:seq, 
			room:data.toString()
		});
		console.log(JSON.stringify(rooms));
	});
	
	socket.on('chat message', function (data){
		
		console.log('chat message : ' + data.nick + ' > ' + data.m);

		io.to(room).emit('chat message', {
			nick: data.nick,
			m: data.m
		});
	});

	socket.on('disconnect', function (){

		console.log('disconnect >> ' + socket.id);
		
		if(room !== null) {

			console.log('room       >> ' + room);
			
			socket.leave(room);

			conns[room].pop(socket.id);
			
			console.log('conns[room].length : ' + conns[room].length);

			if(conns[room].length === 0) {
				delete conns[room];
				delete rooms[room];
				console.log('JSON.stringify(rooms) > ' + JSON.stringify(rooms));
				console.log('JSON.stringify(conns) > ' + JSON.stringify(conns));
			}


			io.emit('remove_room', room.toString());
		} else {
			return false;
		}

	});

});