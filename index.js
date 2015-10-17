var express = require('express');
var app = express();
var bodyParser = require('body-parser');
app.use(express.static('public'));
app.use(bodyParser.json());
var http = require('http').Server(app);
var fs = require('fs');
var io = require('socket.io')(http);
var GCM = require('gcm').GCM;
var apiKey = 'AIzaSyCdDZj8GxAl-_LUhjH7u-Mb4nW0t5019xI';
var gcm = new GCM(apiKey);












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
    var body = "";

    request.on('data', function(chunk) {
      body += chunk;
    })

    request.on('end', function() {
      if (!body) return;
      var obj = JSON.parse(body);
      var bodyArray = [obj.statusType, obj.name, obj.endpoint];
      console.log('POSTed: ' + obj.statusType);

      if(obj.statusType === 'subscribe') {
        fs.appendFile('endpoint.txt', bodyArray + '\n', function (err) {
          if (err) throw err;
          fs.readFile("endpoint.txt", function (err, buffer) {
            var string = buffer.toString();
            var array = string.split('\n');
            for(i = 0; i < (array.length-1); i++) {
              var subscriber = array[i].split(',');
              console.log(subscriber[2]);
                
            };
          });
        });
      } else if(obj.statusType === 'unsubscribe') {
          fs.readFile("endpoint.txt", function (err, buffer) {
            var newString = '';
            var string = buffer.toString();
            console.log('My string is: ' + string);
            var array = string.split('\n');
            console.log('My array is: ' + array);
            for(i = 0; i < (array.length-1); i++) {
              var subscriber = array[i].split(',');
              console.log('Unsubscribe: ' + subscriber[1]);
              console.log(subscriber[2]);
              

              if(obj.endpoint === subscriber[2]) {
                console.log('subscriber found.');
              } else {
                newString += array[i] + '\n';
              }

              fs.writeFile('endpoint.txt', newString, function (err) {
                  if (err) throw err;
                  console.log('Subscriber unsubscribed');
              });
            }
              
          });

        
      }
    });

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
    console.log(reg_id);

    var message = {
    registration_id: msg, // required
    collapse_key: 'Collapse key', 
    'data.key1': 'value1',
    'data.key2': 'value2'
};

	gcm.send(message, function(err, messageId){
    if (err) {
        console.log("Something has gone wrong!");
    } else {
        console.log("Sent with message ID: ", messageId);
    }
});

    

  });


});

http.listen(process.env.PORT || 7000);
console.log("Server Running on 7000.");