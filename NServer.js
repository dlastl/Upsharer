var express = require('express');
var request = require('request');
var bodyParser = require("body-parser");
var fs = require('fs');
var google = require('googleapis');
var drive = google.drive('v3');
var googleAuth = require('google-auth-library');
var busboy = require('connect-busboy');

var app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(busboy());

app.get('/', function(req, res){
	fs.readFile('index.html',function (err, data){
		res.writeHead(200, {'Content-Type': 'text/html','Content-Length':data.length});
		res.write(data);
		res.end(); 
	});
});

app.post('/use_token', function(req, res){
	var fileid = req.body.fileID;
	var name = req.body.fileN;
	a_t1 = req.body.oauthT;
	console.log("\nposted token --> "+a_t1+"\n");
	console.log("\nposted name --> "+name+"\n");
	console.log("\nposted id -->"+fileid+"\n");
	//res.send('Thank you for sharing');
    var client = buildClient();
	var dest = fs.createWriteStream('/home/alessandro/Documenti/'+name);
	drive.files.get({
      auth: client,
      fileId: fileid,
      alt:"media"
    })
		.on('end', function () {
		  console.log('Done\n');
		  res.send("Done! '"+name+"' was shared successfully");
		})
		.on('error', function (err) {
		  console.log('Error during download', err);
		})
		.pipe(dest);
});

app.post('/upload', function(req, res) {
    var fstream;
    req.pipe(req.busboy);
    req.busboy.on('file', function (fieldname, file, filename) {
        console.log("Uploading: " + filename + '\n'); 
        fstream = fs.createWriteStream('/home/alessandro/Documenti/'+ filename);
        file.pipe(fstream);
        fstream.on('close', function () {
            //res.redirect('back');
            //res.send('Thank you for sharing');
            res.send("Done! '"+filename+"' was shared successfully");
        });
    });
});

function buildClient() {
  var client = new google.auth.OAuth2(
    'your client id',
    'your client secret',
    //config.redirect_url
  );
  client.setCredentials({
    access_token: a_t1,
    expiry_date: false
  });
  return client;
}

app.listen(3000);
