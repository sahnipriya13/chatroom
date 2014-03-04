var http=require('http'),
fs=require('fs');
var app=http.createServer(function(reuqest,response)
{
fs.readFile("chatroom.html",'utf-8',function(error,data){
response.writeHead(200,{'Content-type':'text/html'});
response.write(data);
response.end();
});
}).listen(80);
var usernames={};
var rooms=['room1'];
var io=require('socket.io').listen(app);
io.sockets.on('connection',function(socket){
socket.on('adduser',function(username){
if(username)
{
socket.username=username;
socket.room='room1';
usernames[username]=username;
socket.join('room1');
socket.emit('update_chat','SERVER','you have connected to room1');
socket.broadcast.to('room1').emit('update_chat','SERVER',socket.username+' has connected to this room');
socket.emit('updaterooms',rooms,'room1');
io.sockets.to('room1').emit('updateusers',usernames,username);
}
else 
{
username = 'guest'+'_'+Math.round(Math.random()*10);
socket.username=username;
socket.room='room1';
usernames[username]=username;
socket.join('room1');
socket.emit('update_chat','SERVER','you have connected to room1');
socket.broadcast.to('room1').emit('update_chat','SERVER',socket.username+' has connected to this room');
socket.emit('updaterooms',rooms,'room1');
socket.emit('updateusers',usernames,username);
io.sockets.to('room1').emit('updateusers',usernames,username);
}

});
socket.on('create', function(room) {
        rooms.push(room);
        socket.emit('updaterooms', rooms, socket.room);
    });
socket.on('sendchat',function(data)
{
io.sockets.in(socket.room).emit('update_chat',socket.username,data);
});
socket.on('switchRoom',function(newroom)
{
var oldroom;
oldroom=socket.room;
socket.leave(socket.room);
socket.join(newroom);
socket.emit('update_chat','SERVER','you have now connected to '+newroom);
socket.broadcast.to(oldroom).emit('update_chat','SERVER',socket.username+' has left this room');
delete usernames[socket.username];
io.sockets.to(oldroom).emit('updateusers', usernames,socket.username);
socket.room = newroom;
socket.broadcast.to(newroom).emit('update_chat', 'SERVER', socket.username+' has joined this room');
socket.emit('updaterooms', rooms, newroom);
usernames[socket.username]=socket.username;
io.sockets.to(newroom).emit('updateusers',usernames,socket.username);
	});
	socket.on('disconnect', function(){
		delete usernames[socket.username];
		io.sockets.emit('updateusers', usernames,socket.username);
		if(socket.username)
		{
		socket.broadcast.emit('update_chat', 'SERVER', socket.username + ' has disconnected');
		}
		socket.leave(socket.room);
	});
});



