// config/passport.js

var LocalStrategy = require('passport-local').Strategy;

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
                        return done(null, false,  { message: "That id is already taken." });

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
    function(req, id, password, done) {

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
};
