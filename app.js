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

	// seq++;
	// var connId = "id"+seq;
	// socket.connId = connId;
	// rooms[connId] = socket;

	var room = null;
	// var connCnt = 0;
	// socket.connCnt = 0;

	console.log('connect');

	socket.on('disconnect', function(data){
		console.log('user disconnected');
		// // delete rooms[seq];
		// connCnt--;
		// if(connCnt == 0){
		// 	console.log('remove_room');
		// 	io.emit('remove_room', data);
		// }
	});
	
	socket.on('join', function(data){
		
		//socket.connCnt = connCnt++;
		console.log('Welcome to ' + data.room + ' Chat Room!');
		// console.log('join connCnt : ' + connCnt);
		
		socket.join(data.seq);
		
		room = data.seq;
		rooms[data.seq] = data.room;

		// if (conns[data.seq].length === 0) {
		// }

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
		io.emit('create_room', {seq:seq, room:data.toString()});
		console.log(JSON.stringify(rooms));
	});
	
	socket.on('chat message', function (data){
		
		console.log('chat message : ' + data.nick + ' > ' + data.m);

		io.to(room).emit('chat message', {
			nick: data.nick,
			m: data.m
		});
	});

});