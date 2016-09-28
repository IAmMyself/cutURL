var mongo = require('mongodb').MongoClient,
	express = require('express'),
	Base62 = require("base62"),
	nextId = "1",
	url = process.env.MONGOLAB_URI,
	app = express();

mongo.connect(url, function(err, db) {
	if (err != undefined) {
		throw err;
	}
    db.collection("links").find().sort({ _id: -1}).toArray(function (err, data) {
    	if (data[0] != undefined) {
    		nextId = Base62.encode(Base62.decode(data[0]["_id"]) + 1);
    	}
    })
})


app.get("/:id", function (req, res) {
	var id = req.params.id;
	mongo.connect(url, function (err, db) {
		if (err != undefined) {
			throw err;
		}
		db.collection("links").find({
			"_id": id
		}).toArray(function (err, data) {
			if (err != undefined) {
				throw err;
			}
			if (data[0] == undefined) {
				res.send({
					"error": "Shortened URL not found in database."
				});
				res.end();
			} else {
				var theLink = data[0].link;
				res.redirect(theLink);
			}
		})
	});
});

app.get("/new/*", function (req, res) {
	var uRL = req.params[0],
		isHttp = uRL.slice(0, 11) == "http://www." && uRL.search(".com") != -1,
		isHttps = uRL.slice(0, 12) == "https://www." && uRL.search(".com") != -1;

	if (isHttp || isHttps) {
		mongo.connect(url, function (err, db) {
			if (err != undefined) {
				throw err;
			}

			function insert() {
				db.collection("links").insertOne({
					"_id": nextId,
					"link": uRL
				})
				var response = {
					"original_url": uRL,
					"new_url": "https://chopurl.herokuapp.com" + nextId
				};
				res.send(response);
				res.end()
				nextId = Base62.encode(Base62.decode(nextId) + 1)
			}

			db.collection("links").find({
				"link": uRL
			}).toArray(function (err, data) {
				if (err != undefined) {
					throw err;
				}
				if (data[0] != undefined) {
					var response = {
						"original_url": uRL,
						"new_url": "https://chopurl.herokuapp.com" + data[0]["_id"]
					};
					res.send(response);
					res.end();
				} else {
					insert();
				}
			})
		})
	} else {
		res.send({
			"error": "Improper URL"
		});
		res.end();
	}
});

app.listen(process.env.PORT);