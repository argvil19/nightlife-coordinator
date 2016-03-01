var twitterStrategy = require('passport-twitter').Strategy;

var User = require('../models/user');
var twitterConfig = require('../config/oauth');

module.exports = function(passport) {
    
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });
    
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });
    
    passport.use(new twitterStrategy(twitterConfig.twitter, function(token, token_secret, profile, done) {
        process.nextTick(function() {
            User.findOne({
                id:profile.id
            }, function(err, user) {
                if (err) {
                    return done(err);
                }
                
                if (user) {
                    return done(null, user);
                } else {
                    
                    var newUser = new User();
                    
                    newUser.idAcc = profile.id;
                    newUser.token = token;
                    newUser.username = profile.username;
                    newUser.displayName = profile.displayName;
                    newUser.photos = profile.photos;
                    
                    newUser.save(function(err) {
                        if (err) {
                            throw err;
                        }
                        return done(null, newUser);
                    });
                }
            });
        });
    }));
};