/// <reference path="Scripts/typings/restify/restify.d.ts"/>
/// <reference path="Scripts/typings/node-orm2/orm.d.ts" />
/// <reference path="database.ts" />
var restify = require("restify");
var orm = require("orm");
var database = require("./database");

var server = restify.createServer({ name: "payback" });

server.use(orm.express("pg://abhihnahgxvxim:WTaDQYg7roQaOx0ieKNDoKZ-V-@ec2-54-197-238-242.compute-1.amazonaws.com:5432/d4ielacnr2v55l?ssl=true&pool=true", {
    define: database.DebtsModel.init
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
    req["models"]["user"].get(req.params.id, function (err, user) {
        if (err && err.code == orm.ErrorCodes.NOT_FOUND) {
            res.json(404, { "error": "User " + req.params.id + " not found" });
        } else {
            res.json(200, user);
        }

        return next();
    });
    //res.json(200, user);
    //return next();
});

// DELETE /users/{id}
server.del("/users/:id", function (req, res, next) {
    res.send(204);
    return next();
});

// GET /users/{id}/debts/{debtId}
server.get("/users/:id/debts/:debtId", function (req, res, next) {
    var obj = {
        "debtId": req.params.debtId,
        "user": "janeroe",
        "value": 100,
        "date": "2014-04-14T11:29Z",
        "resolved": false
    };

    res.json(200, obj);
    return next();
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
    res.send(204);
    return next();
});

// GET /users/{id}/debts
server.get("/users/:id/debts", function (req, res, next) {
    var obj = {
        "total": 2,
        "debts": [
            {
                "debtId": 1,
                "user": "janeroe",
                "value": 100,
                "date": "2014-04-14T11:29Z",
                "resolved": true
            },
            {
                "debtId": 2,
                "user": "smith",
                "value": -5.51,
                "date": "2014-04-16T08:30Z",
                "resolved": false
            }
        ]
    };

    res.json(200, obj);
    return next();
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

    var obj = {
        "debtId": 2,
        "user": req.body.user,
        "value": req.body.value,
        "date": new Date().toISOString(),
        "resolved": true
    };

    res.json(201, obj);
    return next();
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
    var obj = {
        "id": req.params.friendId
    };

    res.json(200, obj);
    return next();
});

// GET /users/{id}/friends/{friendId}
server.del("/users/:id/friends/:friendId", function (req, res, next) {
    res.send(204);
    return next();
});

// GET /users/{id}/friends
server.get("/users/:id/friends", function (req, res, next) {
    var obj = {
        "total": 2,
        "friends": [
            { "id": "janeroe" },
            { "id": "smith" }
        ]
    };

    res.json(200, obj);
    return next();
});

// POST /users/{id}/friends
server.post("/users/:id/friends", function (req, res, next) {
    if (req.body === undefined) {
        return next(new restify.InvalidContentError("No body defined."));
    }

    if (req.body.id === undefined) {
        return next(new restify.MissingParameterError("Attribute 'user' is missing."));
    }

    var obj = {
        "id": req.body.id
    };

    res.json(201, obj);
    return next();
});

// DELETE /users/{id}/friends
server.del("/users/:id/friends", function (req, res, next) {
    res.send(204);
    return next();
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
    var users = ["johndoe", "janeroe", "smith"];

    if (req.query.search !== undefined) {
        users = users.filter(function (val) {
            return fuzzy(val, req.query.search);
        });
    }

    var obj = {
        "total": users.length,
        "users": []
    };

    for (var i = 0; i < users.length; ++i) {
        obj.users.push({ "id": users[i] });
    }

    res.json(200, obj);
    return next();
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

    var obj = {
        "id": req.body.id,
        "email": req.body.email
    };

    res.json(201, obj);
    return next();
});

var port = process.env.PORT || 1337;

server.listen(port, function () {
    console.log("%s listening at %s", server.name, server.url);
});
//# sourceMappingURL=server.js.map
