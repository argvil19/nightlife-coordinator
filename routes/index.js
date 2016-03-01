var Yelp = require('yelp');
var yelp = new Yelp({
    consumer_key: 'wj3Zo7mnwqTht7C-1TvNzQ',
    consumer_secret: 'II9Oz3-erVbweUvFWhuvEWKnmKA',
    token: 'sAHH-Lkix2HEsjcxSLSPiBvxpWrYyhz3',
    token_secret: '_6KoQQbIYuLDCP2SmbhQ90DIHXw',
});
var Bars = require('../models/bars');

module.exports = function(app, passport) {
    
    /* GET REQUEST */
    
    app.get('/', function(req, res) {
        var sendParam = {};
        if (req.isAuthenticated()) {
            sendParam.user = req.user;
        }
        return res.render('index', sendParam);
    });
    
    app.get('/search?', function(req, res) {
        var sendParam = {};
        var place = req.query.place;
        yelp.search({
            term:'bar',
            location:place
        }).then(function(data) {
            sendParam.bars = [];
            sendParam.data = data;
            var count = 0;
            if (req.isAuthenticated()) {
                var user = req.user;
                sendParam.user = user.username;
                for (var i=0; i<data.businesses.length;i++) {
                    Bars.findOrCreate({name:data.businesses[i].name},{name:data.businesses[i].name}, function(err, bar, created) {
                        if (err) {
                            throw err;
                        }
                        if (!created && bar.going.indexOf(user.username) != -1) {
                            sendParam.data.businesses[count].markActive = 1;
                        }
                        sendParam.data.businesses[count].going = bar.going.length;
                        count++;
                        if (count === 20) {
                            return res.send(sendParam);
                        }
                    });
                }
            } else {
                return res.send(sendParam);
            }
        });
    });
    
    app.get('/auth/twitter', passport.authenticate('twitter'));
    
    app.get('/auth/twitter/callback', passport.authenticate('twitter', {
        successRedirect:'/popup',
        failureRedirect:'/'
    }));
    
    app.get('/auth/twitter/info', function(req, res) {
        return res.send(req.user);
    });
    
    app.get('/popup', function(req, res) {
        return res.render('popup');
    });
    
    app.post('/going', function(req, res) {
        var user = req.user.username;
        var name = req.body.name;
        var notGoing = req.body.notGoing || 0;
        var response;
        Bars.findOne({name:name}, function(err, data) {
            if (err) {
                throw err;
            } 
            if (notGoing || data.going.indexOf(user) != -1) {
                return Bars.update({name:name}, {$pull:{'going':user}}, function(err, msg) {
                    if (err) {
                        throw err;
                    }
                    Bars.findOne({name:name}, function(err, data) {
                        if (err) {
                            throw err;
                        }
                        res.send({total:data.going.length});
                    });
                });
            }
            if (data) {
                Bars.update({name:name}, {$push:{'going':user}}, function(err, msg) {
                    if (err) {
                        throw err;
                    }
                    Bars.findOne({name:name}, function(err, data) {
                        if (err) {
                            throw err;
                        }
                        res.send({total:data.going.length});
                    });
                })
            } else {
                res.redirect('/')
            }
        });
    });
    
};