// config/passport.js

var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var GooglePlusStrategy = require('passport-google-plus');
var TwitterStrategy = require('passport-twitter').Strategy;

// load the auth variables
var configAuth = require('./auth');

module.exports = function (passport) {

    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function (req, id, done) {

        req.models.user.get(id, function (err, user) {
            done(err, user.id);
        });

    });

    passport.use('local-signup', new LocalStrategy({
            usernameField: 'id',
            passwordField: 'password',
            passReqToCallback: true
        },
        function (req, id, password, done) {

            process.nextTick(function () {

                if (!req.body.email)
                    return done(null, false, { message: "Attribute 'email' is missing." });

                req.models.user.exists({ id: id }, function (err, exists) {

                    if (err)
                        return done(err);

                    if (exists)
                        return done(null, false, { message: "That id is already taken." });

                    req.models.user.create({
                            id: id,
                            passwordHash: password,
                            email: req.body.email
                        },
                        function (err, userItem) {

                            if (err)
                                return done(err);

                            return done(null, userItem);
                        });
                });

            });
        }));

    passport.use('local-login', new LocalStrategy({
            usernameField: 'id',
            passwordField: 'password',
            passReqToCallback: true
        },
        function (req, id, password, done) {

            req.models.user.get(id, function (err, user) {

                if (err)
                    return done(err);

                if (!user)
                    return done(null, false, { message: "No user found."});

                if (user.passwordHash !== password)
                    return done(null, false, { message: "Wrong password."});

                return done(null, user);
            });
        }));

    passport.use(new TwitterStrategy({

            consumerKey: configAuth.twitterAuth.consumerKey,
            consumerSecret: configAuth.twitterAuth.consumerSecret,
            callbackURL: configAuth.twitterAuth.callbackURL,
            passReqToCallback: true
        },
        function (req, token, refreshToken, profile, done) {
            // asynchronous
            process.nextTick(function () {

                req.models.user.find({ idProvider: profile.id }, function (err, users) {

                    if (err) {
                        return done(err);
                    }

                    // if a user is found
                    if (users.length > 0) {
                        return done(null, users[0]);
                    }

                    req.models.user.create({
                            provider: "twitter",
                            idProvider: profile.id,
                            token: token,
                            id: profile.username,
                            email: "test-email@something.com"
                        },
                        function (err, newUser) {

                            if (err) {
                                console.log(err);
                                return done(err);
                            }

                            return done(null, newUser);
                        });
                });
            });

}));

    passport.use(new FacebookStrategy({
            clientID: configAuth.facebookAuth.clientID,
            clientSecret: configAuth.facebookAuth.clientSecret,
            callbackURL: configAuth.facebookAuth.callbackURL,
            passReqToCallback: true
        },
        function (req, token, refreshToken, profile, done) {

            // asynchronous
            process.nextTick(function () {

                req.models.user.find({ idProvider: profile.id }, function (err, users) {

                    if (err) {
                        return done(err);
                    }

                    // if a user is found
                    if (users.length > 0) {
                        return done(null, users[0]);
                    }

                    req.models.user.create({
                            provider: "facebook",
                            idProvider: profile.id,
                            token: token,
                            id: profile.displayName,
                            email: profile.emails[0].value
                        },
                        function (err, newUser) {

                            if (err) {
                                console.log(err);
                                return done(err);
                            }

                            return done(null, newUser);
                        });
                });
            });

        }));

    passport.use(new GoogleStrategy({
            clientID: configAuth.googleAuth.clientID,
            clientSecret: configAuth.googleAuth.clientSecret,
            callbackURL: configAuth.googleAuth.callbackURL,
            passReqToCallback: true,
            realm: configAuth.googleAuth.realm // set to: http://localhost:8080
        }),
        function (req, token, refreshToken, profile, done) {

            console.log("here1");
            // asynchronous
            process.nextTick(function () {

                req.models.user.find({ idProvider: profile.id }, function (err, users) {
                    console.log("here2");

                    if (err)
                        return done(err);

                    if (users.length > 0)
                        return done(null, users[0]);

                    req.models.user.create({
                            provider: "google",
                            idProvider: profile.id,
                            token: token,
                            id: profile.displayName,
                            email: profile.emails[0].value
                        },
                        function (err, newUser) {

                            if (err) {
                                console.log(err);
                                return done(err);
                            }

                            return done(null, newUser);
                        });
                });

            });
        });
};
