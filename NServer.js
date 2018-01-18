var express = require('express');
var request = require('request');
var bodyParser = require("body-parser");
var fs = require('fs');
var google = require('googleapis');
var drive = google.drive('v3');
var googleAuth = require('google-auth-library');
var auth = new googleAuth();
var busboy = require('connect-busboy');
//var https = require('https');

var port = 3000;
var app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(busboy());

/*var options = {
    key: fs.readFileSync('./key.pem', 'utf8'),        
    cert: fs.readFileSync('./cert.pem', 'utf8')
};
var server = https.createServer(options, app).listen(port, function(){
  console.log("Express server listening on port " + port + '\n');
});*/


app.get('/', function(req, res){
	fs.readFile('index.html',function (err, data){
		res.writeHead(200, {'Content-Type': 'text/html','Content-Length':data.length});
		res.write(data);
		res.end(); 
	});
});

app.post('/shared', function(req, res){
        var Subject = req.body.Subject.toLowerCase();
        var Professor = req.body.Professor.toLowerCase();
        var name = req.body.Name1;
        var dict = {"Subject" : Subject,
                   "Professor" : Professor};
        var jsonData = JSON.stringify(dict);
	fs.writeFile("/path/to/storage/"+name+".json", jsonData, function(err) {
	    if(err) {
		return console.log(err);
	    }
	});
        res.write('<p> Subject: <strong>'+Subject+'</strong></p><p> Professor: <strong>'+Professor+'</strong></p>');
        res.write('<p> Thank you for sharing <strong>'+name+'<strong/> !<p/>');
        var body = '<button onclick="goBack()">Go back</button><script>function goBack() {window.history.go(-2);}</script>'
        res.write(body);
        res.end();
});

app.post('/use_token', function(req, res){
	var fileid = req.body.fileID;
	var name = req.body.fileN.replace(/\s/g, '');;
	a_t1 = req.body.oauthT;
        var fileName = name.replace(/\s/g, "");
	console.log("\nposted token --> "+a_t1+"\n");
	console.log("\nposted name --> "+name+"\n");
	console.log("\nposted id -->"+fileid+"\n");
        var body = '<p><strong> Tag your note... </p></strong><form id="IdTags" action="/shared" method ="post"><input type="hidden" name="Name1" value='+fileName+'><p>Subject:</p><input type="text" name="Subject"><br><p>Professor:</p><input type="text" name="Professor"><br></br><input type="submit" value="Submit"></form>'
        res.write(body);
        res.end();
    var client = buildClient();
	var dest = fs.createWriteStream('/path/to/storage/'+name);
	drive.files.get({
      auth: client,
      fileId: fileid,
      alt:"media"
    })
		.on('end', function () {
		  console.log('Done\n');
		})
		.on('error', function (err) {
		  console.log('Error during download: ', err);
		})
		.pipe(dest);
});

app.post('/upload', function(req, res) {
        var fstream;
        req.pipe(req.busboy);
        req.busboy.on('file', function (fieldname, file, filename) {
        if(filename == "") { res.redirect("/"); 
        } else {
        var fileName = filename.replace(/\s/g, "");
        var body = '<p><strong> Tag your note... </p></strong><form id="IdTags" action="/shared" method ="post"><input type="hidden" name="Name1" value='+fileName+'><p>Subject:</p><input type="text" name="Subject"><br><p>Professor:</p><input type="text" name="Professor"><br></br><input type="submit" value="Submit"></form>'
        res.write(body);
        res.end();
        console.log("Uploading: " + filename + '\n'); 
        fstream = fs.createWriteStream('/path/to/storage/'+ filename);
        file.pipe(fstream);
        fstream.on('close', function () {
            console.log('Done\n');
        });
        fstream.on('error',function(err){
            console.log('Error during upload: ', err);
        })
        }
        });

});

function buildClient() {
  var client = new auth.OAuth2(
    'your client id',
    'yout client secret'
  );
  client.credentials={
    access_token: a_t1,
    expiry_date: false
  };
  return client;
}

app.listen(port, function(){
  console.log("Express server listening on port " + port + '\n');
});


