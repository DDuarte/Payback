//var crypto = require('crypto-js');
var restify = require("restify");
var orm = require("orm");
var database = require("./database");

var server = restify.createServer({ name: "payback" });
server.use(orm.express("pg://abhihnahgxvxim:WTaDQYg7roQaOx0ieKNDoKZ-V-@ec2-54-197-238-242.compute-1.amazonaws.com:5432/d4ielacnr2v55l?ssl=true&pool=true", {
    define: database
}));

// handle the Accept request header
server.use(restify.acceptParser(server.acceptable));

// handle GET queries, data available in res.query
server.use(restify.queryParser({ mapParams: false }));

// if possible compress with gzip
server.use(restify.gzipResponse());

// parse the HTTP entity body, data available in res.body
server.use(restify.bodyParser({
    maxBodySize: 65535,
    mapParams: false
}));

// GET /
server.get("/", function (req, res, next) {
    res.send(204);
    return next();
});

// GET /users/{id}
server.get("/users/:id", function (req, res, next) {
    // TODO: send 403 when not logged in or not current user
    // TODO: implement checksum ( crypto.HmacSHA1( message , encryptionKey ).toString() )
    req.models.user.get(req.params.id, function (err, user) {

        if (err) {
            res.json(404, { "error": "User " + req.params.id + " not found" });
        } else {
            res.json(200, {
               id: user.id,
               email: user.email
            });
        }

        return next();
    });
});

// DELETE /users/{id}
server.del("/users/:id", function (req, res, next) {

    req.models.user.get(req.params.id, function (err, user) {

        if (err)
            res.json(404, { "error": "User " + req.param.id + " does not exist" });
        else {

            user.remove(function (err) {
                if (err) {
                    res.json(500, err);
                    return next();
                }

                res.json(204);
                return next();
            });
        }
    });

});


// GET /users/{id}/debts/{debtId}
server.get("/users/:id/debts/:debtId", function (req, res, next) {

    req.models.user.get(req.params.id, function (err, user) {

        if (err || !user) {
            res.json(404, {error: "User '" + req.params.id + "' does not exist" });
            return next();
        }

        user.getDebts().find({ id: req.params.debtId }, function (err, debts) {

            if (err || debts.length === 0) {
                res.json(404, { error: "Debt '" + req.params.debtId + "' does not exist" });
                return next();
            }

            var debt = debts[0];
            res.json(200, {
                debtId: debt.id,
                user: debt.creditor_id,
                value: debt.value,
                date: debt.date,
                resolved: debt.resolved
            });

            return next();
        });
    });

});

// PATCH /users/{id}/debts/{debtId}
server.patch("/users/:id/debts/:debtId", function (req, res, next) {

    if (req.body === undefined) {
        return next(new restify.InvalidContentError("No body defined."));
    }

    if (req.body.value === undefined && req.body.resolved === undefined) {
        return next(new restify.MissingParameterError("Can only change 'value' or 'resolved' attributes of debts."));
    }

    var obj = {
        "debtId": req.params.debtId,
        "user": "janeroe",
        "value": 100,
        "date": "2014-04-14T11:29Z",
        "resolved": false
    };

    if (req.body.value !== undefined) {
        obj.value = req.body.value;
    }

    if (req.body.resolved !== undefined) {
        obj.resolved = req.body.resolved;
    }

    res.send(200, obj);
    return next();

});

// DELETE /users/{id}/debts/{debtId}
server.del("/users/:id/debts/:debtId", function (req, res, next) {

    req.models.user.exists({ id: req.params.id }, function (err, exists) {

        if (err || !exists) {
            res.json(404, { error: "User '" + req.params.id +"' does not exist"});
            return next();
        }

        req.models.debt.remove({ id: req.params.debtId }, function (err) {

            if (err) {
                res.json(404, { error: "Debt '" + req.params.debtId +"' does not exist" });
                return next();
            }

            res.send(204);
            return next();
        });
    });

});

// GET /users/{id}/debts
server.get("/users/:id/debts", function (req, res, next) {

    req.models.user.get(req.params.id, function (err, user) {

        if (err || !user) {
            res.json(404, { error: "User '" + req.params.id + "' does not exist" });
            return next();
        }

        user.getDebts(function (err, debts) {

            if (err || !debts) {
                res.json(500, err);
                return next();
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
            return next();
        });
    });

});

// POST /users/{id}/debts
server.post("/users/:id/debts", function (req, res, next) {

    if (req.body === undefined) {
        return next(new restify.InvalidContentError("No body defined."));
    }

    if (req.body.user === undefined) {
        return next(new restify.MissingParameterError("Attribute 'user' is missing."));
    }

    if (req.body.value === undefined) {
        return next(new restify.MissingParameterError("Attribute 'value' is missing."));
    }

    if (isNaN(req.body.value)) {
        return next(new restify.InvalidArgumentError("Attribute 'value' needs to be a number."));
    }

    var valueStr = req.body.value.toString();
    var splitValueStr = valueStr.split(".");

    if (splitValueStr.length > 1 && splitValueStr[1].length > 2) { // more than 2 decimal digits
        return next(new restify.InvalidArgumentError("Attribute 'value' can't exceed 2 decimal digits."));
    }

    req.models.user.exists({ id: req.params.id }, function (err, exists) {

        if (err) {
            res.json(500, err);
            return next();
        }

        if (!exists) {
            res.json(404, {error: "User '" + req.params.id + "' does not exist" });
            return next();
        }

        req.models.user.exists({ id: req.body.user }, function (err, exists) {

            if (err) {
                res.json(500, err);
                return next();
            }

            if (!exists) {
                res.json(404, {error: "User '" + req.body.user + "' does not exist" });
                return next();
            }

            req.models.debt.create({

                creditor_id: req.body.user,
                debtor_id: req.params.id,
                value: req.body.value

            }, function (err, debtItem) {

                if (err || !debtItem) {
                    res.json(500, err);
                    return next();
                }

                res.json(201, {
                    debtId: debtItem.id,
                    user: debtItem.creditor_id,
                    value: debtItem.value,
                    date: debtItem.date,
                    resolved: debtItem.resolved
                });

                return next();
            });
        });
    });

});

// GET /users/{id}/balances
server.get("/users/:id/balances", function (req, res, next) {
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
    return next();
});

// GET /users/{id}/friends/{friendId}
server.get("/users/:id/friends/:friendId", function (req, res, next) {

    req.models.user.get(req.params.id, function (err, user) {
        if (err) {
            res.json(404, { error: "User '" + req.params.id + "' does not exist" });
            return next();
        }

        user.getFriends({ id: req.params.friendId }, function (err, friends) {

            if (err || friends.length === 0) {
                res.json(404, { error: "User '" + req.params.friendId + "' is not a friend" });
                return next();
            }

            res.json(200, { id: friends[0].id });
            return next();
        });
    });

});

// DELETE /users/{id}/friends/{friendId}
server.del("/users/:id/friends/:friendId", function (req, res, next) {

    req.models.user.get(req.params.id, function (err, me) {

        if (err) {
            res.json(500, err);
            return next();
        } else if (!me) {
            res.json(404, { error: "User (me) '" + req.body.id + "' does not exist." });
            return next();
        }

        // check if the friend exists
        req.models.user.get(req.params.friendId, function (err, friend) {

            if (err) {
                res.json(500, err);
                return next();
            } else if (!friend) {
                res.json(404, { error: "User (friend) '" + req.body.id + "' does not exist." });
                return next();
            }

            me.removeFriends([friend], function (err) {
                if (err) {
                    res.json(500, err);
                    return next();
                }

                res.send(204);
                return next();
            });
        });
    });

});

// GET /users/{id}/friends
server.get("/users/:id/friends", function (req, res, next) {

    req.models.user.get(req.params.id, function (err, me) {
        if (err) {
            res.json(500, err);
            return next();
        } else if (!me) {
            res.json(404, { error: "User (me) '" + req.body.id + "' does not exist." });
            return next();
        }

        me.getFriends(function (err, friends) {
            if (err) {
                res.json(500, err);
                return next();
            } else if (!friends) {
                res.json(404, { error: "Friends does not exist." });
                return next();
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
        return next(new restify.InvalidContentError("No body defined."));
    }

    if (req.body.id === undefined) {
        return next(new restify.MissingParameterError("Attribute 'id' is missing."));
    }

    req.models.user.get(req.params.id, function (err, me) {

        if (err) {
            res.json(500, err);
            return next();
        } else if (!me) {
            res.json(404, { error: "User (me) '" + req.body.id + "' does not exist." });
            return next();
        }

        // check if the friend exists
        req.models.user.get(req.body.id, function (err, friend) {

            if (err) {
                res.json(500, err);
                return next();
            } else if (!friend) {
                res.json(404, {error: "User (friend) '" + req.body.id + "' does not exist."});
                return next();
            }

            me.addFriends([friend], { date: new Date() }, function (err) {
                if (err) {
                    res.json(500, err);
                    return next();
                }

                res.json(201, { id: friend.id });
                return next();
            });
        });
    });

});

// DELETE /users/{id}/friends
server.del("/users/:id/friends", function (req, res, next) {

    req.models.user.get(req.params.id, function (err, me) {
        if (err) {
            res.json(500, err);
            return next();
        } else if (!me) {
            res.json(404, { error: "User (me) '" + req.body.id + "' does not exist." });
            return next();
        }

        me.setFriends([], function (err) {
            if (err) {
                res.json(500, err);
                return next();
            }
        });

        res.send(204);
        return next();
    });

});

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

// GET /users
server.get("/users", function (req, res, next) {

    req.models.user.find({}).run(function (err, users) {

        if (err) {
            res.json(500, err);
            return next();
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

        return next();
    });

});

// POST /users
server.post("/users", function (req, res, next) {

    if (req.body === undefined) {
        return next(new restify.InvalidContentError("No body defined."));
    }

    if (req.body.id === undefined) {
        return next(new restify.MissingParameterError("Attribute 'id' is missing."));
    }

    if (req.body.email === undefined) {
        return next(new restify.MissingParameterError("Attribute 'email' is missing."));
    }

    if (!/\S+@\S+\.\S+/.test(req.body.email)) {
        return next(new restify.InvalidArgumentError("Attribute 'email' is not a valid email address."));
    }

    if (req.body.passwordHash === undefined) {
        return next(new restify.InvalidArgumentError("Attribute 'passwordHash' is missing"));
    }

    req.models.user.create({
        id: req.body.id,
        passwordHash: req.body.passwordHash,
        email: req.body.email
    }, function (err, item) {

        if (err) {

            if (err.code == 23505) { // unique_violation
                return next(new restify.InvalidArgumentError("Already exists"));
            } else if (err.msg == "invalid-password-length" || err.msg == "invalid-email-format") {
                return next(new restify.InvalidArgumentError(err.msg));
            }
            else {
                res.json(500, err);
                return next();
            }
        }

        res.json(201, {id: item.id, email: item.email });
        return next();
    });

});

var port = process.env.PORT || 1337;

server.listen(port, function () {
    console.log("%s listening at %s", server.name, server.url);
});
