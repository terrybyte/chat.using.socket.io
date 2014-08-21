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
	// nsp = io.of('/');
	fs.readFile('Lobby.html', function (err,data){
		res.send(data.toString());
	});	
});

app.get('/canvas', function (req,res){
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
var seq = 0;

io.on('connect', function (socket){

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
		// 	//클라이언트 제거
		// 	console.log('remove_room');
		// 	io.emit('remove_room', data);
		// 	//서버 rooms에서 제거 
		// }
	});
	
	socket.on('join', function(data){
		//socket.connCnt = connCnt++;
		console.log('Welcome to ' + data.room + ' Chat Room!');
		// console.log('join connCnt : ' + connCnt);

		socket.join(data.room);
		room = data.room;
		rooms[data.seq] = data.room;
		// console.log(socket.conn);
	});

	socket.on('leave', function (){
		console.log('leave connCnt : ' + connCnt);
	});

	// socket.on('draw', function (data){
	// 	if(room != null) {
	// 		io.to(room).emit('line', data);
	// 	} else {
	// 		console.log('Not Room');
	// 	}
	// });

	socket.on('create_room', function (data){
		console.log('create_room');
		seq++;
		room = data;
		rooms[seq] = data;
		io.emit('create_room', {seq:seq, room:data.toString()});
		console.log(rooms);
	});
	
	socket.on('chat message', function (data){
		console.log('chat message');
		io.to(room).emit('chat message', {
			nick: data.nick,
			m: data.m
		});
	});

});