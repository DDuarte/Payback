// config/passport.js

var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var GoogleStrategy = require('passport-google').Strategy;
var TwitterStrategy = require('passport-twitter').Strategy;

// load the auth variables
var configAuth = require('./auth');

module.exports = function (passport) {

    passport.serializeUser(function (user, done) {
        done(null, user);
    });

    passport.deserializeUser(function (req, user, done) {

        req.models.user.get(user.id, function (err, user) {
            done(err, user);
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
                    return done(null, false, { error: "Attribute 'email' is missing." });

                req.models.user.exists({ id: id }, function (err, exists) {

                    if (err)
                        return done(err);

                    if (exists)
                        return done(null, false, { error: "That id is already taken." });

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

                if (err || !user)
                    return done(null, false, { error: "No user ID was found."});

                if (user.passwordHash !== password)
                    return done(null, false, { error: "Wrong password."});

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

                req.models.user.create({
                        id: req.body.id,
                        email: req.body.email
                    },
                    function (err, newLocalUser) {

                        if (err)
                            return done(err);

                        req.models.twitter.create({
                                id: profile.id,
                                token: token,
                                displayName: profile.username,
                                localAccount_id: newLocalUser.id
                            },
                            function (err, newTwitterUser) {

                                if (err)
                                    return done(err);

                                newLocalUser.setTwitterAccount(newTwitterUser, function (err) {

                                    if (err)
                                        return done(err);

                                    return done(null, newLocalUser);
                                });

                            });
                    });
            });

        }));


    // Facebook strategies =============================================================================================

    // signup with facebook account
    passport.use("facebook-signup", new FacebookStrategy({
            clientID: configAuth.facebookAuth.clientID,
            clientSecret: configAuth.facebookAuth.clientSecret,
            callbackURL: configAuth.facebookAuth.signupCallbackURL,
            passReqToCallback: true
        },
        function (req, token, refreshToken, profile, done) {

            // asynchronous
            process.nextTick(function () {

                if (req.query.state) { // if set, it's a signup request

                    req.models.user.create({
                            id: req.query.state
                        },
                        function (err, newLocalUser) {

                            if (err) {
                                return done(err);
                            }

                            req.models.facebook.exists({ id: profile.id }, function (err, exists) {

                                if (err)
                                    return done(err);

                                if (exists)
                                    return done(null, false);

                                req.models.facebook.create({
                                        id: profile.id,
                                        token: token,
                                        displayName: profile.displayName,
                                        email: profile.emails[0].value,
                                        localaccount_id: newLocalUser.id
                                    },
                                    function (err, newFacebookUser) {

                                        if (err) {
                                            return done(err);
                                        }

                                        newLocalUser.setFacebookAccount(newFacebookUser, function (err) {
                                            if (err) {
                                                return done(err);
                                            }

                                            return done(null, newLocalUser);
                                        });

                                    });
                            });
                        });
                }});
    }));

    // login with facebook account
    passport.use("facebook-login", new FacebookStrategy({
            clientID: configAuth.facebookAuth.clientID,
            clientSecret: configAuth.facebookAuth.clientSecret,
            callbackURL: configAuth.facebookAuth.loginCallbackURL,
            passReqToCallback: true
        },
        function (req, token, refreshToken, profile, done) {

            req.models.facebook.get(profile.id, function (err, facebookUser) { // login attempt

                if (err)
                    return done(err);

                if (!facebookUser)
                    return done(null, false);

                facebookUser.getLocalAccount(function (err, localUser) {

                    if (err)
                        return done(err);

                    return done(null, localUser);
                });
            });

    }));

    // connect with facebook account
    passport.use("facebook-connect", new FacebookStrategy({
                clientID: configAuth.facebookAuth.clientID,
                clientSecret: configAuth.facebookAuth.clientSecret,
                callbackURL: configAuth.facebookAuth.connectCallbackURL,
                passReqToCallback: true
            },
            function (req, token, refreshToken, profile, done) {

                if (!req.user)
                    return done(null, false);

                var user = req.user;

                req.models.facebook.create({
                    id: profile.id,
                    token: token,
                    displayName: profile.displayName,
                    email: profile.emails[0].value,
                    localaccount_id: user.id

                }, function (err, newFacebookUser) {

                    if (err) {
                        return done(err);
                    }

                    user.setFacebookAccount(newFacebookUser, function (err) {
                        if (err) {
                            return done(err);
                        }

                        return done(null, user);
                    });

                });
            })
    );

    // Google strategies ===============================================================================================

    // signup with google account
    passport.use("google-signup", new GoogleStrategy({
            returnURL: configAuth.googleAuth.signupCallbackURL,
            realm: configAuth.googleAuth.realm,
            passReqToCallback: true
        },
        function (req, identifier, profile, done) {

            // asynchronous
            process.nextTick(function () {

                req.models.user.create({
                        id: req.query.state
                    },
                    function (err, newLocalUser) {

                        if (err) {
                            return done(err);
                        }

                        req.models.google.create({
                                id: identifier,
                                displayName: profile.displayName,
                                email: profile.emails[0].value,
                                localaccount_id: newLocalUser.id
                            },
                            function (err, newGoogleUser) {

                                if (err) {
                                    return done(err);
                                }

                                newLocalUser.setGoogleAccount(newGoogleUser, function (err) {
                                    if (err) {
                                        return done(err);
                                    }

                                    return done(null, newLocalUser);
                                });

                            });
                    });
            });
    }));

    // login with google account
    passport.use("google-login", new GoogleStrategy({
            returnURL: configAuth.googleAuth.loginCallbackURL,
            realm: configAuth.googleAuth.realm,
            passReqToCallback: true
        },
        function (req, identifier, profile, done) {

            req.models.google.get(identifier, function (err, googleUser) {

                if (err)
                    return done(err);

                if (!googleUser)
                    return done(null, false);

                googleUser.getLocalAccount(function (err, localUser) {

                    if (err)
                        return done(err);

                    return done(null, localUser);
                });
            });
    }));

    // connect google account
    passport.use("google-connect", new GoogleStrategy({
            returnURL: configAuth.googleAuth.connectCallbackURL,
            realm: configAuth.googleAuth.realm,
            passReqToCallback: true
        },
        function (req, identifier, profile, done) {

            if (!req.user)
                return done(null, false);

            var user = req.user;
            console.log(user.id);

            req.models.google.create({
                id: identifier,
                displayName: profile.displayName,
                email: profile.emails[0].value,
                localaccount_id: user.id
            },
            function (err, newGoogleUser) {

                if (err)
                    return done(err);

                user.setGoogleAccount(newGoogleUser, function (err) {

                    if (err)
                        return done(err);

                    return done(null, user);
                });
            });
    }));
};
