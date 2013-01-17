var http = require('http'),
	xml2js = require('xml2js'),
	mongoose = require('mongoose'),
	async = require('async'),
	Schema = mongoose.Schema,
	request = require('request');

LocationSchema = new Schema({
	id: {
		type: Number,
		required: true,
		unique: true
	},
	name: {
		type: String,
		required: true
	},
});

mongoose.connect('mongodb://localhost/locations');
mongoose.model('Location', LocationSchema);
var Location = mongoose.model('Location');

var parser = new xml2js.Parser();

var failedRequests = [];
var i = 1,
	j = 501,
	k = 1001,
	l = 1501;

function crawl(index) {
	var url = getUrl(index);
	process.stdout.write('=');
	request(url, function(error, response, body) {
		if(!error && response.statusCode == 200) {
			parseLocation(body);
		} else {
			process.stdout.write('X');
			failedRequests.push(index);
		}
		crawlNext(index);
	})
}

function parseLocation(body) {
	try {
		parser.parseString(body, function(err, result) {
			var locationTitle = result.rss.channel[0].title;
			var locationString = result.rss.channel[0].item[0].link[0];
			var location = new Location({
				id: locationString.split('/')[2],
				name: locationTitle
			});
			location.save();
		});
	} catch(err) {
		process.stdout.write('X');
	}
}

function crawlNext(index) {
	if(index < 500) {
		crawl(i++);
	} else if(index < 1000) {
		crawl(j++);
	} else if(index < 1500) {
		crawl(k++);
	} else if(index < 2000) {
		crawl(l++);
	}
}

function getUrl(i) {
	return 'http://magicseaweed.com/syndicate/rss/index.php?id=' + i + '&unit=uk';
}

var start = new Date().getTime();
crawl(i);
crawl(j);
crawl(k);
crawl(l);