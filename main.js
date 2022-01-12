const Construct    =   require('./constructs');
var http = require('http');
var fs = require('fs');

var app = http.createServer(function(req,res){
    if(req.url === '/favicon.ico'){
        res.end();
        return;
    }
    res.setHeader('Content-Type', 'application/json');

    let construct   =   new Construct();

    res.end(construct.generateUniqData(JSON.parse(fs.readFileSync(__dirname+'/example.json', 'utf8'))));
});
app.listen(3000);
