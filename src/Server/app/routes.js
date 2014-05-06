// app/routes.js

module.exports = function (server, passport) {

    server.all("/users", isLoggedIn);
    server.all("/users/*", isLoggedIn);

    // POST /signup
    server.post('/signup', function (req, res) {

        passport.authenticate('local-signup', function (err, user, info) {

            if (!user)
                return res.json(401, info);

            req.logIn(user, function (err) {

                if (err)
                    return res.send(401);

                res.send(200);
            });
        })(req, res);

    });

    // POST /login
    server.post('/login', function (req, res) {

        passport.authenticate('local-login', function (err, user, info) {

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

    // GET /
    server.get("/", function (req, res) {
        res.send(204);
    });

    // GET /users/{id}
    server.get("/users/:id", isLoggedIn, function (req, res) {

        req.models.user.get(req.params.id, function (err, user) {

            if (err || !user) {
                res.json(404, { "error": "User " + req.params.id + " not found" });
                return;
            }

            res.json(200, {
                id: user.id,
                email: user.email
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
                res.json(200, {
                    debtId: debt.id,
                    user: debt.creditor_id,
                    value: debt.value,
                    date: debt.date,
                    resolved: debt.resolved
                });
            });
        });

    });

    // PATCH /users/{id}/debts/{debtId}
    server.patch("/users/:id/debts/:debtId", function (req, res, next) {

        if (req.body === undefined) {
            return next("No body defined.");
        }

        if (req.body.value === undefined && req.body.resolved === undefined) {
            return next("Can only change 'value' or 'resolved' attributes of debts.");
        }

        if (isNaN(req.body.value)) {
            return next("Attribute 'value' needs to be a number.");
        }

        var valueStr = req.body.value.toString();
        var splitValueStr = valueStr.split(".");

        if (splitValueStr.length > 1 && splitValueStr[1].length > 2) { // more than 2 decimal digits
            return next("Attribute 'value' can't exceed 2 decimal digits.");
        }

        req.models.user.exists({ id: req.params.id }, function (err, exists) {

            if (err || !exists) {
                res.json(404, { error: "User '" + req.params.id + "' does not exist" });
                return;
            }

            req.models.debt.get(req.params.debtId, function (err, Debt) { // get the debt instance

                if (err) {
                    res.json(404, {error: "User '" + req.params.debtId + "' does not exist"});
                    return;
                }

                if (req.body.value)
                    Debt.value = req.body.value;

                if (req.body.resolved)
                    Debt.resolved = req.body.resolved;

                Debt.save(function (err) { // update the debt instance

                    if (err) {
                        res.json(500, err);
                    }
                    res.json(200, {
                        debtId: Debt.id,
                        user: Debt.creditor_id,
                        value: Debt.value,
                        date: Debt.date,
                        resolved: Debt.resolved
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

                if (err) {
                    res.json(404, { error: "Debt '" + req.params.debtId + "' does not exist" });
                    return;
                }

                res.send(204);
            });
        });

    });

    // GET /users/{id}/debts
    server.get("/users/:id/debts", function (req, res) {

        req.models.user.get(req.params.id, function (err, user) {

            if (err || !user) {
                res.json(404, { error: "User '" + req.params.id + "' does not exist" });
                return;
            }

            user.getDebts(function (err, debts) {

                if (err || !debts) {
                    res.json(500, err);
                    return;
                }

                var debts = debts.map(function (debt) {

                    return {
                        debtId: debt.id,
                        user: debt.creditor_id,
                        value: debt.value,
                        date: debt.date,
                        resolved: debt.resolved
                    };

                });

                var ret = {
                    total: debts.length,
                    debts: debts
                };

                res.json(200, ret);
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

        if (isNaN(req.body.value)) {
            return next("Attribute 'value' needs to be a number.");
        }

        var valueStr = req.body.value.toString();
        var splitValueStr = valueStr.split(".");

        if (splitValueStr.length > 1 && splitValueStr[1].length > 2) { // more than 2 decimal digits
            return next("Attribute 'value' can't exceed 2 decimal digits.");
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

                if (err) {
                    res.json(500, err);
                    return;
                }

                if (!exists) {
                    res.json(404, {error: "User '" + req.body.user + "' does not exist" });
                    return;
                }

                req.models.debt.create({

                    creditor_id: req.body.user,
                    debtor_id: req.params.id,
                    value: req.body.value

                }, function (err, debtItem) {

                    if (err || !debtItem) {
                        res.json(500, err);
                        return;
                    }

                    res.json(201, {
                        debtId: debtItem.id,
                        user: debtItem.creditor_id,
                        value: debtItem.value,
                        date: debtItem.date,
                        resolved: debtItem.resolved
                    });

                    return;
                });
            });
        });

    });

    // GET /users/{id}/balances
    server.get("/users/:id/balances", function (req, res, next) {
        // TODO
        var obj = {
            "total": 1,
            "balances": [
                {
                    "balanceId": 1,
                    "user": "janeroe",
                    "value": 100,
                    "history": [
                        { "debtId": 5, "user": "janeroe", "value": 150, "date": "2014-04-14T11:29Z" },
                        { "debtId": 6, "user": "smith", "value": -50, "date": "2014-04-15T08:30Z" }
                    ]
                }
            ]
        };

        res.json(200, obj);
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
            });

            res.send(204);
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
                res.json(200, users);
            else {

                var filteredUsers = users.filter(function (user) {
                    return fuzzy(user.id, req.query.search);
                });

                res.json(200, filteredUsers);
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
};

// make sure user is authenticated
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if not, then stop the chain flow
    res.json(403, { error: "No permission" });
}

// from StackOverflow, example fuzzy test
// "loop through needle letters and check if they occur in the same order in the haystack"
function fuzzy(what, s) {
    var hay = what.toLowerCase(), i = 0, n = -1, l;
    s = s.toLowerCase();
    for (; l = s[i++];) {
        if (!~(n = hay.indexOf(l, n + 1))) {
            return false;
        }
    }
    return true;
}