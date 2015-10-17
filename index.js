var express = require('express');
var app = express();
app.use(express.static('public'));
var http = require('http');
var fs = require('fs');
url = require('url');


var options = {
  pfx: fs.readFileSync('aa34f6b8-f1c5-4e32-afd7-7a5f9f0b659c.pfx'),
  passphrase: 'password'
};

var opt = {
    root: __dirname + '/public/',
    dotfiles: 'deny'
  };

var httpsServer = http.createServer(app);

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

httpsServer.listen(process.env.PORT || 7000);
console.log("Server Running on 7000.");