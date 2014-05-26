// app/routes.js
var async = require("async");
var accounting = require("accounting");
var crypto = require('crypto-js');
var moment = require('moment');

module.exports = function (server, passport, fx, jwt) {

    /*server.all("/users", isLoggedIn);
    server.all("/users/*", isLoggedIn);*/

    //server.all("/", validChecksum);
    //server.all("/*", validChecksum);

    // GET /
    server.get("/", function (req, res) {
        res.send(204);
    });

    // POST /login/local
    server.post('/login/local', function (req, res) {

        passport.authenticate('local-login', function (err, user, info) {

            if (!user)
                return res.json(401, info);

            req.logIn(user, function (err) {

                if (err)
                    return res.send(401);

                var expires = moment().add('days', 7).valueOf();
                var token = generateToken(user.id, expires);
                res.send(200, {
                    access_token: token,
                    exp: expires,
                    user: {
                        id: user.id,
                        email: user.email
                    }
                });
            });
        })(req, res);

    });

    // POST /signup/local
    server.post("/signup/local", function (req, res) {

        passport.authenticate('local-signup', function (err, user, info) {

            if (!user)
                return res.json(401, info);

            req.logIn(user, function (err) {

                if (err)
                    return res.send(401);

                var expires = moment().add('days', 7).valueOf();
                var token = generateToken(user.id, expires);
                res.send(200, {
                    access_token: token,
                    exp: expires,
                    user: {
                        id: user.id,
                        email: user.email
                    }
                });
            });
        })(req, res);

    });

    // GET /login/facebook
    server.get("/login/facebook", function (req, res, next) {
        passport.authenticate('facebook-login', { scope: 'email' })(req, res, next);
    });

    // GET /login/facebook/callback
    server.get("/login/facebook/callback", function (req, res) {

        passport.authenticate('facebook-login', function (err, user, info) {

            if (err)
                return res.json(500, err);

            if (!user)
                return res.json(401, info);

            req.logIn(user, function (err) {

                if (err)
                    return res.send(401);

                res.send(200);
            });
        })(req, res);

    });

    // GET /signup/facebook/{id}
    server.get("/signup/facebook/:id", function (req, res, next) {

        if (!req.params.id)
            return next("Attribute 'id' is missing.");

        req.models.user.exists({ id: req.params.id }, function (err, exists) { // check if userID already exists

            if (err || exists)
                return res.json(403, "User '" + req.params.id + "' already exists.");

            passport.authenticate('facebook-signup', { scope: 'email', state: req.params.id })(req, res, next);
        });

    });

    // GET /signup/facebook/callback
    server.get('/signup/facebook/callback', function (req, res) {

        passport.authenticate('facebook-signup', function (err, user, info) {

            if (err)
                return res.json(500, err);

            if (!user)
                return res.json(401, info);

            req.logIn(user, function (err) {

                if (err)
                    return res.send(401);

                res.send(200);
            });
        })(req, res);

    });

    // GET /connect/facebook
    server.get('/connect/facebook', passport.authorize('facebook-connect', { scope : 'email' }));

    // GET /connect/facebook/callback
    server.get('/connect/facebook/callback', function (req, res) {

        passport.authorize('facebook-connect', function (err, user, info) {

            if (err)
                return res.json(500, err);

            if (!user)
                return res.json(401, info);

            req.logIn(user, function (err) {

                if (err)
                    return res.send(401);

                res.send(200);
            });
        })(req, res);
    });

    // GET /login/google
    server.get("/login/google", function (req, res, next) {
        passport.authenticate('google-login')(req, res, next);
    });

    // GET /login/google/callback
    server.get("/login/google/callback", function (req, res, next) {

        passport.authenticate('google-login', function (err, user, info) {

            if (err)
                return res.json(500, err);

            if (!user)
                return res.json(401, info);

            req.logIn(user, function (err) {

                if (err)
                    return res.send(401);

                res.send(200);
            });
        })(req, res, next);

    });

    // GET /signup/google/{id}
    server.get('/signup/google/:id', function (req, res, next) {

        if (!req.params.id)
            return next("Attribute 'id' is missing.");

        req.models.user.exists({ id: req.params.id }, function (err, exists) { // check if userID already exists

            if (err || exists)
                return res.json(403, "User '" + req.params.id + "' already exists.");

            passport.authenticate('google-signup', {state: req.params.id })(req, res, next);
        });
    });

    // GET /signup/google/callback
    server.get('/signup/google/callback', function (req, res) {

        passport.authenticate('google-signup', function (err, user, info) {

            if (err)
                return res.json(500, err);

            if (!user)
                return res.json(401, info);

            req.logIn(user, function (err) {

                if (err)
                    return res.send(401);

                res.send(200);
            });
        })(req, res);

    });

    // GET /connect/google
    server.get('/connect/google', passport.authorize('google-connect'));

    // GET /connect/google/callback
    server.get('/connect/google/callback', function (req, res) {

        passport.authorize('google-connect', function (err, user, info) {

            if (err)
                return res.json(500, err);

            if (!user)
                return res.json(401, info);

            req.logIn(user, function (err) {

                if (err)
                    return res.send(401);

                res.send(200);
            });
        })(req, res);
    });

    // GET /logout
    server.get('/logout', function (req, res) {
        req.logout();
        res.send(200);
    });

    // GET /exchangeRates
    server.get("/exchangeRates", function(req, res) {

        return res.json(200, {
            base: fx.base,
            rates: fx.rates
        });

    });

    // GET /users/{id}
    server.get("/users/:id", function (req, res) {

        req.models.user.get(req.params.id, function (err, user) {

            if (err || !user) {
                res.json(404, { "error": "User " + req.params.id + " not found" });
                return;
            }

            res.json(200, {
                id: user.id,
                email: user.email,
                currency: user.currency
            });
        });

    });

    // PATCH /users/{id}
    server.patch("/users/:id", function (req, res, next) {

        if (req.body === undefined) {
            return next("No body defined.");
        }

        if (req.body.email === undefined) {
            return next("Can only change 'email' attribute of the user.");
        }

        req.models.user.get(req.params.id, function (err, user) {
            if (err || !user) {
                res.json(404, { "error": "User " + req.params.id + " not found" });
                return;
            }

            user.save({ email: req.body.email }, function (err) {
                if (err || !user) {
                    res.json(403, err);
                    return;
                }

                res.json(200, {
                    id: user.id,
                    email: req.body.email
                });
            });
        });

    });

    // DELETE /users/{id}
    server.del("/users/:id", function (req, res) {

        req.models.user.get(req.params.id, function (err, user) {

            if (err || !user) {
                res.json(404, { "error": "User " + req.param.id + " does not exist" });
                return;
            }

            user.remove(function (err) {

                if (err) {
                    res.json(500, err);
                    return;
                }

                res.json(204);
            });
        });

    });

    // GET /users/{id}/facebook
    server.get("/users/:id/facebook", function (req, res) {

        req.models.user.get(req.params.id, function (err, user) {

            if (err || !user)
                return res.json(404, { error: "User '" + req.params.id + "' does not exist" });

            user.getFacebookAccount(function (err, facebookAccount) {

                if (err)
                    return res.json(500, err);

                if (!facebookAccount)
                    return res.json(404, { error: "User '" + req.params.id + "' does not have a linked facebook account" });

                return res.json(200, {
                    provider: "facebook",
                    email: facebookAccount.email,
                    displayName: facebookAccount.displayName
                });
            })
        })
    });

    // GET /users/{id}/google
    server.get("/users/:id/google", function (req, res) {

        req.models.user.get(req.params.id, function (err, user) {

            if (err || !user)
                return res.json(404, { error: "User '" + req.params.id + "' does not exist" });

            user.getGoogleAccount(function (err, googleAccount) {

                if (err)
                    return res.json(500, err);

                if (!googleAccount)
                    return res.json(404, { error: "User '" + req.params.id + "' does not have a linked google account" });

                return res.json(200, {
                    provider: "google",
                    email: googleAccount.email,
                    displayName: googleAccount.displayName
                });
            })
        })
    });

    // GET /users/{id}/debts/{debtId}
    server.get("/users/:id/debts/:debtId", function (req, res) {

        req.models.user.get(req.params.id, function (err, user) {

            if (err || !user) {
                res.json(404, {error: "User '" + req.params.id + "' does not exist" });
                return;
            }

            user.getDebts().find({ id: req.params.debtId }, function (err, debts) {

                if (err || debts.length === 0) {
                    res.json(404, { error: "Debt '" + req.params.debtId + "' does not exist" });
                    return;
                }

                var debt = debts[0];
                var ret = {
                    debtId: debt.id,
                    creditor: debt.creditor_id,
                    debtor: debt.debtor_id,
                    created: debt.created,
                    modified: debt.modified
                };

                var currency = req.query.currency || debt.currency;

                ret.originalValue = convertMoney(debt.originalValue, debt.currency, currency);
                ret.value = convertMoney(debt.value, debt.currency, currency);
                ret.currency = req.query.currency;

                res.json(200, ret);
            });
        });

    });

    // PATCH /users/{id}/debts/{debtId}
    server.patch("/users/:id/debts/:debtId", function (req, res, next) {

        if (req.body === undefined) {
            return next("No body defined.");
        }

        if (req.body.value === undefined && req.body.currency == undefined) {
            return next("Attributes value and currency are required.");
        }

        if (isNaN(req.body.value)) {
            return next("Attribute 'value' needs to be a number.");
        }

        req.models.user.exists({ id: req.params.id }, function (err, exists) {

            if (err || !exists) {
                res.json(404, { error: "User '" + req.params.id + "' does not exist" });
                return;
            }

            req.models.debt.get(req.params.debtId, function (err, debt) { // get the debt instance

                if (err || !debt) {
                    return res.json(404, {error: "User '" + req.params.debtId + "' does not exist"});
                }

                debt.value = req.body.value;
                debt.currency = req.body.currency;

                debt.save(function (err) { // update the debt instance

                    if (err)
                        return res.json(500, err);

                    res.json(200, {
                        debtId: debt.id,
                        creditor: debt.creditor_id,
                        debtor: debt.debtor_id,
                        originalValue: debt.originalValue,
                        value: debt.value,
                        currency: debt.currency,
                        created: debt.created,
                        modified: debt.modified
                    });
                });
            });
        });

    });

    // DELETE /users/{id}/debts/{debtId}
    server.del("/users/:id/debts/:debtId", function (req, res) {

        req.models.user.exists({ id: req.params.id }, function (err, exists) {

            if (err || !exists) {
                res.json(404, { error: "User '" + req.params.id + "' does not exist"});
                return;
            }

            req.models.debt.remove({ id: req.params.debtId }, function (err) {

                if (err)
                    return res.json(404, { error: "Debt '" + req.params.debtId + "' does not exist" });

                res.send(204);
            });
        });

    });

    // GET /users/{id}/debts
    server.get("/users/:id/debts", function (req, res) {

        var currency = req.query.currency ? req.query.currency : "EUR";

        req.models.user.get(req.params.id, function (err, user) {

            if (err || !user)
                return res.json(404, { error: "User '" + req.params.id + "' does not exist" });

            user.getCredits(function (err, credits) {
                if (err || !credits)
                    return res.json(500, err);

                user.getDebts(function (err, debts) {

                    if (err || !debts)
                        return res.json(500, err);

                    debts = credits.concat(debts);

                    async.reduce(debts, { credit: 0, debit: 0}, function (memo, debt, cb) {
                        var val = convertMoney(debt.value, debt.currency, currency);
                        if (user.id === debt.creditor_id) {
                            memo.credit += val;
                        } else {
                            memo.debit += val;
                        }

                        cb(null, memo);
                    }, function (err, values) {

                        var balance = values.credit - values.debit;

                        async.map(debts, asyncDebtConversion.bind(undefined, req.query.currency), function (err, result) {

                            if (err)
                                return res.json(500, err);

                            res.json(200, {
                                total: result.length,
                                balance: balance,
                                credit: values.credit,
                                debit: values.debit,
                                currency: currency,
                                debts: result
                            });

                        });

                    });
                });
            });


        });

    });

    // POST /users/{id}/debts
    server.post("/users/:id/debts", function (req, res, next) {

        if (req.body === undefined) {
            return next("No body defined.");
        }

        if (req.body.user === undefined) {
            return next("Attribute 'user' is missing.");
        }

        if (req.body.value === undefined) {
            return next("Attribute 'value' is missing.");
        }

        if (!req.body.currency)
            return next("Attribute 'currency' is missing");

        if (isNaN(req.body.value)) {
            return next("Attribute 'value' needs to be a number.");
        }

        req.models.user.exists({ id: req.params.id }, function (err, exists) {

            if (err) {
                res.json(500, err);
                return;
            }

            if (!exists) {
                res.json(404, {error: "User '" + req.params.id + "' does not exist" });
                return;
            }

            req.models.user.exists({ id: req.body.user }, function (err, exists) {

                if (err)
                    return res.json(500, err);

                if (!exists)
                    return res.json(404, {error: "User '" + req.body.user + "' does not exist" });

                req.models.debt.create({

                    creditor_id: req.params.id,
                    debtor_id: req.body.user,
                    originalValue: req.body.value,
                    value: req.body.value,
                    currency: req.body.currency

                }, function (err, debt) {

                    if (err || !debt)
                        return res.json(500, err);

                    res.json(201, {
                        debtId: debt.id,
                        creditor: debt.creditor_id,
                        debtor: debt.debtor_id,
                        originalValue: debt.originalValue,
                        value: debt.value,
                        currency: debt.currency,
                        created: debt.created,
                        modified: debt.modified
                    });

                });
            });
        });

    });

    // GET /users/{id}/friends/{friendId}
    server.get("/users/:id/friends/:friendId", function (req, res) {

        req.models.user.get(req.params.id, function (err, user) {
            if (err) {
                res.json(404, { error: "User '" + req.params.id + "' does not exist" });
                return;
            }

            user.getFriends({ id: req.params.friendId }, function (err, friends) {

                if (err || friends.length === 0) {
                    res.json(404, { error: "User '" + req.params.friendId + "' is not a friend" });
                    return;
                }

                res.json(200, { id: friends[0].id });
            });
        });

    });

    // DELETE /users/{id}/friends/{friendId}
    server.del("/users/:id/friends/:friendId", function (req, res) {

        req.models.user.get(req.params.id, function (err, me) {

            if (err) {
                res.json(500, err);
                return;
            } else if (!me) {
                res.json(404, { error: "User (me) '" + req.body.id + "' does not exist." });
                return;
            }

            // check if the friend exists
            req.models.user.get(req.params.friendId, function (err, friend) {

                if (err) {
                    res.json(500, err);
                    return;
                } else if (!friend) {
                    res.json(404, { error: "User (friend) '" + req.body.id + "' does not exist." });
                    return;
                }

                me.removeFriends([friend], function (err) {
                    if (err) {
                        res.json(500, err);
                        return;
                    }

                    res.send(204);
                });
            });
        });

    });

    // GET /users/{id}/friends
    server.get("/users/:id/friends", function (req, res) {

        req.models.user.get(req.params.id, function (err, me) {
            if (err) {
                res.json(500, err);
                return;
            } else if (!me) {
                res.json(404, { error: "User (me) '" + req.body.id + "' does not exist." });
                return;
            }

            me.getFriends(function (err, friends) {
                if (err) {
                    res.json(500, err);
                    return;
                } else if (!friends) {
                    res.json(404, { error: "Friends does not exist." });
                    return;
                }

                friends = friends.map(function (user) {
                    return { id: user.id };
                });

                var obj = {
                    "total": friends.length,
                    "friends": friends
                };

                res.json(200, obj);
            });
        });

    });

    // POST /users/{id}/friends
    server.post("/users/:id/friends", function (req, res, next) {

        if (req.body === undefined) {
            return next("No body defined.");
        }

        if (req.body.id === undefined) {
            return next("Attribute 'id' is missing.");
        }

        req.models.user.get(req.params.id, function (err, me) {

            if (err) {
                res.json(500, err);
                return;
            } else if (!me) {
                res.json(404, { error: "User (me) '" + req.body.id + "' does not exist." });
                return;
            }

            // check if the friend exists
            req.models.user.get(req.body.id, function (err, friend) {

                if (err) {
                    res.json(500, err);
                    return;
                } else if (!friend) {
                    res.json(404, {error: "User (friend) '" + req.body.id + "' does not exist."});
                    return;
                }

                me.addFriends([friend], { date: new Date() }, function (err) {
                    if (err) {
                        res.json(500, err);
                        return;
                    }

                    res.json(201, { id: friend.id });
                });
            });
        });

    });

    // DELETE /users/{id}/friends
    server.del("/users/:id/friends", function (req, res) {

        req.models.user.get(req.params.id, function (err, me) {
            if (err) {
                res.json(500, err);
                return;
            } else if (!me) {
                res.json(404, { error: "User (me) '" + req.body.id + "' does not exist." });
                return;
            }

            me.setFriends([], function (err) {
                if (err) {
                    res.json(500, err);
                    return;
                }

                res.send(204);
            });
        });

    });

    // GET /users
    server.get("/users", function (req, res) {

        req.models.user.find({}).run(function (err, users) {

            if (err) {
                res.json(500, err);
                return;
            }

            users = users.map(function (user) {
                return {id: user.id};
            });

            if (!req.query.search)
                res.json(200, {
                    total: users.length,
                    users: users
                });
            else {
                var fuzzyTest = asyncFuzzyTest.bind(undefined, req.query.search);
                async.filter(users, fuzzyTest, function (results) { // asynchronous search
                    res.json(200, {
                        total: results.length,
                        users: results
                    });
                });
            }
        });

    });

    // POST /users
    server.post("/users", function (req, res, next) {

        if (req.body === undefined) {
            return next("No body defined");
        }

        if (req.body.id === undefined) {
            return next("Attribute 'id' is missing.");
        }

        if (req.body.email === undefined) {
            return next("Attribute 'email' is missing.");
        }

        if (!/\S+@\S+\.\S+/.test(req.body.email)) {
            return next("Attribute 'email' is not a valid email address.");
        }

        if (req.body.passwordHash === undefined) {
            return next("Attribute 'passwordHash' is missing");
        }

        req.models.user.create({
            id: req.body.id,
            passwordHash: req.body.passwordHash,
            email: req.body.email
        }, function (err, item) {

            if (err) {

                if (err.code == 23505) { // unique_violation
                    return next("Already exists");
                } else if (err.msg == "invalid-password-length" || err.msg == "invalid-email-format") {
                    return next(err.msg);
                }
                else {
                    res.json(500, err);
                }
            }

            res.json(201, {id: item.id, email: item.email });
        });

    });

    // make sure user is authenticated
    function isLoggedIn(req, res, next) {

        // if user is authenticated in the session, carry on
        if (req.isAuthenticated())
            return next();

        // if not, then stop the chain flow
        res.json(403, { error: "No permission" });
    }

    // asynchronous version of the fuzzy evaluation function defined above
    function asyncFuzzyTest(searchTerm, user, callback) {
        var hay = user.id.toLowerCase(), i = 0, n = -1, l;
        searchTerm = searchTerm.toLowerCase();
        for (; l = searchTerm[i++];) {
            if (!~(n = hay.indexOf(l, n + 1))) {
                return callback(false);
            }
        }
        return callback(true);
    }

    function asyncDebtConversion(currency, debt, callback) {

        if (!currency)
            currency = debt.currency;

        return callback(null, {
            debtId: debt.id,
            creditor: debt.creditor_id,
            debtor: debt.debtor_id,
            originalValue: convertMoney(debt.originalValue, debt.currency, currency),
            value: convertMoney(debt.value, debt.currency, currency),
            currency: currency,
            created: debt.created,
            modified: debt.modified
        });
    }

    function validChecksum(req, res, next) {

        var checksum = req.get("X-Checksum");
        if (!checksum) {
            return next("Missing X-Checksum header");
        }

        var obj = { url: req.params[0] || "/", query: req.query, body: req.body };

        var sign = crypto.HmacSHA1(JSON.stringify(obj), "all your base are belong to us").toString();
        if (sign !== checksum) {
            return next("Wrong X-Checksum");
        }

        return next();
    }

    function convertMoney(value, srcCurrency, destCurrency) {
        // TODO: remove use of parseFloat
        return parseFloat(accounting.toFixed(fx(value).from(srcCurrency).to(destCurrency), 4));
    }

    function generateToken(userId, expirationDate) {
        var token = jwt.encode({
            iss: userId,
            exp: expirationDate
        }, server.get('jwtTokenSecret'));

        return token;
    }
};
