var fs = require('fs'),
	http = require('http'),
	xml2js = require('xml2js'),
	mongoose = require('mongoose'),
	async = require('async'),
	Schema = mongoose.Schema,
	request = require('request');

var parser = new xml2js.Parser();
var failedRequests = [];

function requestLocation(index) {
	index++;
	var url = getUrl(index);
	request(url, function(error, response, body) {
		if(!error && response.statusCode == 200) {
			parseLocation(body);
		}
		requestLocation(index);
	})
}

function getUrl(i) {
	return 'http://magicseaweed.com/syndicate/rss/index.php?id=' + i + '&unit=uk';
}

function parseLocation(body) {
	try {
		parser.parseString(body, function(err, result) {
			var locationTitle = result.rss.channel[0].title[0];
			var locationString = result.rss.channel[0].item[0].link[0];

			var id = locationString.split('/')[2];
			var name = locationTitle.replace("Latest", "").replace(" Surf Forecast", "");
			console.log(id, name);
			if (id && name) {
				fs.appendFile('spots.txt', id + ',' + name + '\n', function (err) {
			  		if (err) throw err;
				});
			}
		});
	} catch(err) {
		process.stdout.write('P');
	}
}

exports.crawl = function() {
	var index = 0
	requestLocation(index);
}