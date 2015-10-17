var express = require('express');
var app = express();
var bodyParser = require('body-parser');
app.use(express.static('public'));
app.use(bodyParser.json());
var http = require('http').Server(app);
var fs = require('fs');
var io = require('socket.io')(http);
var GCMPush = require('gcm-push');
var gcm = new GCMPush('AIzaSyCdDZj8GxAl-_LUhjH7u-Mb4nW0t5019xI');













var reg_ids = [];


var opt = {
    root: __dirname + '/public/',
    dotfiles: 'deny'
  };

app.get('/pushData', function (request,response) {

	var notificationObj = {
		title:"Kunal",
		message:"Hey"
	};

	response.send({notification:notificationObj});
})


app.get('/', function (request, response) {
    
response.writeHead(200, {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*", 
  "Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Origin, Access-Control-Allow-Headers"});
response.sendFile('index.html',opt);
response.end();

});



function ArrNoDupe(a) {
    var temp = {};
    for (var i = 0; i < a.length; i++)
        temp[a[i]] = true;
    var r = [];
    for (var k in temp)
        r.push(k);
    return r;
}


io.on('connection', function(socket){
	
  console.log('a user connected');

  socket.on('disconnect', function(){
    console.log('user disconnected');
  });

  socket.on('new', function(msg){
    reg_ids.push(msg);
    var reg_id = ArrNoDupe(reg_ids); 
    
    gcm.notifyDevices(reg_id, 'notification_title', 'my_message');

    

  });


});

http.listen(process.env.PORT || 7000);
console.log("Server Running on 7000.");