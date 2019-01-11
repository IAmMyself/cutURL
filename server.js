'use strict';

var express = require('express');
var mongo = require('mongodb');
var Base62 = require("base62");
var path = require("path");
var bodyParser = require('body-parser');
var dns = require('dns');
var nextId = "1";
var url = process.env.MONGOLAB_URI;

mongo.connect(url, function(err, db) {

    if (err != undefined) {

        throw err;

    }

    db.collection("links").find().sort({
        _id: -1
    }).toArray(function(err, data) {

        if (data[0] != undefined) {

            nextId = Base62.encode(Base62.decode(data[0]["_id"]) + 1);

        }

    })

})

var cors = require('cors');

var app = express();

// Basic Configuration 
var port = process.env.PORT || 3000;

/** this project needs a db !! **/
// mongoose.connect(process.env.MONGOLAB_URI);

app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here
app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({ // to support URL-encoded bodies
    extended: true
}));

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
});

app.get("/api/shorturl/:id", function(req, res) {

    var id = req.params.id;

    mongo.connect(url, function(err, db) {

        if (err != undefined) {

            throw err;

        }

        db.collection("links").find({

            "_id": id

        }).toArray(function(err, data) {

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



app.post("/api/shorturl/new", function(req, res) {

    var uRL = req.body.url;
    var comPosition = uRL.search(".com");
    var hasHttp = uRL.search("http://");
    var beginPosition = 7;
    
    if (hasHttp == -1) {
      var hasHttp = uRL.search("https://");
      beginPosition++;
    }


    if (hasHttp == 0 && comPosition != -1) {
        dns.lookup(uRL.slice(beginPosition, comPosition + 4), function(err) {
            if (err == undefined) {
                mongo.connect(url, function(err, db) {

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

                            "short_url": nextId

                        };

                        res.send(response);

                        res.end()

                        nextId = Base62.encode(Base62.decode(nextId) + 1)

                    }



                    db.collection("links").find({

                        "link": uRL

                    }).toArray(function(err, data) {

                        if (err != undefined) {

                            throw err;

                        }

                        if (data[0] != undefined) {

                            var response = {

                                "original_url": uRL,

                                "short_url": data[0]["_id"]

                            };

                            res.send(response);

                            res.end();

                        } else {

                            insert();

                        }

                    })

                })

            } else {
                console.log(err);
                res.send({

                    "error": "Improper URL"

                });

                res.end();

            }

        })
    } else {
        res.send({

            "error": "Improper URL"

        });

        res.end();
    }
});

app.listen(port || 3000, function() {
    console.log('Node.js listening ...');
});