process.env.TZ = 'Australia/Sydney';

var express = require('express');
var fs = require('fs');
var app = express();

app.set('port', process.env.PORT || 8001);
app.set('views', __dirname + '/views');
app.use(express.logger('dev'));
app.use(express.static(__dirname + '/static'));
app.engine('html', require('hjs').__express);
app.set('view engine', 'hjs');

app.get('/timetest', function (req, res) {
    var now = new Date();
    var content = "<h1>Server</h1><p>Rel: " + now.toString() + "</p><p>Abs: " + now.toUTCString() + "</p>";
    res.charset = 'utf8';
    res.send(content);
});

app.get('/', function (req, res) {
    res.render('index.html', getNextMeeting());
});

// Admin section
app.get('/admin', function (req, res) {
    res.render('admin.html', getNextMeeting());
});

app.post("/admin", function(req, res){
    res.render("admin-auth.html", getNextMeeting());
});

app.use(function (req, res, next) {
    res.charset = 'utf8';
    res.send(404, '<!doctype html><html lang=en><meta charset=utf-8><title>Not Found</title><style>body{background:#22252a;color:#fff;font:300 100.01% "Helvetica Neue",Helvetica,"Arial Unicode MS",Arial,sans-serif;}h1{font-weight:300;text-align:center;padding:5em;color:#ccf;}</style><body><h1>404<br>Page not found');
});

app.use(function (err, req, res, next) {
    res.charset = 'utf8';
    res.send(500, '<!doctype html><html lang=en><meta charset=utf-8><title>Internal Error</title><style>body{background:#22252a;color:#fff;font:300 100.01% "Helvetica Neue",Helvetica,"Arial Unicode MS",Arial,sans-serif;}h1{font-weight:300;text-align:center;padding:5em;color:#fcc;}</style><body><h1>500<br>Internal Error<p>');
});

app.listen(app.get('port'), function(){
    console.log('Server listening on port ' + app.get('port'));
});

function getNextMeeting() {
    var meetings = JSON.parse(fs.readFileSync(__dirname + "/data/meetings.json")).meetings; //Need to convert this to an async call
    var index = meetings.length,
        data, meeting,
        startTime,
        current = meetings[index - 1],
        now = new Date(),
        prevMidnight = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
        );
    while (index--) {
        meeting = meetings[index];
        startTime = new Date(meeting.date);
        if (startTime < prevMidnight) {
            break;
        }
        current = meeting;
    }
    startTime = new Date(current.date);
    data = {
        title: current.title || '',
        datetime: startTime.toString(),
        datevalue: current.date + '+' + (-startTime.getTimezoneOffset() * 10 / 6),
        presentations: []
    };
    current.speakers.forEach(function (speaker, i) {
        data.presentations.push({
            n: i + 1,
            speaker: speaker.name,
            speakerurl: speaker.twitter ? 'https://twitter.com/' + speaker.twitter : '',
            topic: speaker.topic,
            topicurl: speaker.link || ''
        });
    });
    return data;
}
