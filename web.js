var http = require('http'),
	eyes = require('eyes'),
	xml2js = require('xml2js'),
	async = require('async'),
	mongoose = require('mongoose'),
 	Schema = mongoose.Schema;

LocationSchema = new Schema({
	id: {
		type : Number,
		required: true,
		unique: true
	},
	name: {
		type : String,
		required: true
	},
});

mongoose.connect('mongodb://localhost/locations');
mongoose.model('Location', LocationSchema);
var Location = mongoose.model('Location');

var parser = new xml2js.Parser();

function crawl(url, id){
	http.get(url, function(res) {
		console.log(res.statusCode);
		res.on('data', function (body) {
			parseLocation(body, url, id);
		});		
	})	
}

function parseLocation(body, url, id){
	try{
		parser.parseString(body, function(err, result) {
			var locationTitle = result.rss.channel[0].title;
			var locationString = result.rss.channel[0].item[0].link[0];
			var location = new Location({
				id: locationString.split('/')[2],
				name: locationTitle
			});
			location.save();
		});
	}
	catch(err){
		console.log('parseError : ' + err + ' id : ' + id);
	}
}


N = 1 //# of simultaneous tasks
var q = async.queue(function (task, callback) {
    	crawl(task.url, task.id);
	callback();
}, N);


q.drain = function() {
    console.log('Tasks queued.');
}

for(var i = 1000; i < 2000; i++){
   q.push({url: 'http://magicseaweed.com/syndicate/rss/index.php?id='+i+'&unit=uk', id : i});
}
