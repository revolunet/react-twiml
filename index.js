var http = require('http');
var express = require('express');
var twilio = require('twilio');
var giphy = require('giphy-api')();

var app = express();

app.get('/sms', function(req, res) {
  var twiml = new twilio.TwimlResponse();
  var query = req.body.Body;
  giphy.search(query).then(function(giphyRes) {
    twiml.message(function() {
      this.body(`Results for "${query}"`);
      this.media(giphyRes.data[0].images.fixed_height.url);
    });
    res.writeHead(200, {'Content-Type': 'text/xml'});
    res.end(twiml.toString());
  }).catch(e => {
    console.log('error', e);
    res.writeHead(500, {'Content-Type': 'text'});
    res.end("error");
  })
});

http.createServer(app).listen(process.env.PORT || 1337, function () {
  console.log("Express server listening on port 1337");
});

