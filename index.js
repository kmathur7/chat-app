var express = require('express');
var app = express();
var bodyParser = require('body-parser');
app.use(express.static('public'));
app.use(bodyParser.json());
var http = require('http').Server(app);
var fs = require('fs');
var io = require('socket.io')(http);
//var GCMPush = require('gcm-push');
//var gcm = new GCMPush('AIzaSyCdDZj8GxAl-_LUhjH7u-Mb4nW0t5019xI');
var gcm = require('node-gcm');
var message1 = new gcm.Message();
var Q = require('q');

message1.addData('key1', 'msg1');


/*-- DB Connection -- */
var mongoose = require('mongoose');
mongoose.connect('mongodb://heroku_j3swk10r:9q50icdk7o0t6p66o36u1ca168@ds041154.mongolab.com:41154/heroku_j3swk10r');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function (callback) {
  console.log("db connected!!");
});

/* -- Defining Schemas -- */
var Schema = mongoose.Schema;
var notificationSchema = new Schema({
  subscriptionId:  String,
  title: String,
  body: String,
  sent: {type: Boolean, default:false}
});

var Notification = mongoose.model('Notification', notificationSchema);


/*-- certail required variables -- */
var reg_ids = [];
var reg_id = [];
var options = {
    root: __dirname + '/public/',
    dotfiles: 'deny'
  };



/*--- API ---*/

app.get('/pushData', function (request,response) {

	var notificationObj = {
		title:"Kunal",
		message:"Hey"
	};

	response.send({notification:notificationObj});
});


app.get('/', function (request, response) {
    
response.writeHead(200, {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*", 
  "Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Origin, Access-Control-Allow-Headers"});
response.sendFile('index.html',options);
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
  	io.sockets.connected[socket.id].emit("id", socket.id);
  	//socket.send(socket.id);

	socket.on('disconnect', function(){
		console.log(socket.id);
    	console.log('user disconnected');
  	});

  	socket.on('new', function(msg){
  		var reg = msg.endpoint.toString().slice(40);
    	reg_ids.push(reg);
    	reg_id = ArrNoDupe(reg_ids); 
    	//gcm.notifyDevices(reg_id, 'notification_title', 'my_message');
	});

	socket.on('chat message', function(msg){
    	console.log(msg.message);
    	reg_ids.push(msg.regid);
    	reg_id = ArrNoDupe(reg_ids); 
    	var messageToBeSent = remainingIds(msg.regid,reg_id);
    	Q.all([storeToDb(msg,reg_id),sendToGcm(reg_id)]).done(console.log("promise resolved"));
    	//storeToDb(msg,messageToBeSent);
    	//gcm.notifyDevices(messageToBeSent, 'notification_title', 'my_message');
    	io.emit('newmsg', msg);
  	});


});
function sendToGcm (arrayTobeSent){
	
	console.log(arrayTobeSent);
	//gcm.notifyDevices(arrayTobeSent, 'notification_title', 'my_message');
	var sender = new gcm.Sender('AIzaSyCdDZj8GxAl-_LUhjH7u-Mb4nW0t5019xI');
	sender.send(message1, { registrationIds: arrayTobeSent }, function (err, result) {
    if(err) console.error(err);
    else    console.log(result);
});
	
}
function storeToDb (message,arr) {
	console.log("message" + message.message);
	console.log("array" + arr);
	

	for(var i=0;i<arr.length;i++){
		var newNotification = new Notification({subscriptionId:arr[i],title:message.username,body:message.message});

		newNotification.save(function (err) {
    		if (err) {
    			console.log(err);
    		}
    		else{
    			console.log("saved");
    		}
  			// saved!
  		});
	}
	

}


function remainingIds (id,array) {
	var idx = array.indexOf(id);
	if (idx > -1) {
    	array.splice(idx,1);
	}
	return array;

}

http.listen(process.env.PORT || 7000);
console.log("Server Running on 7000.");