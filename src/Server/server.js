// server.js

// set up ======================================================================
// get all the tools we need
//var crypto = require('crypto-js');

var express = require('express'),
    morgan  = require('morgan'),
    compress = require('compression'),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    session = require('express-session');

var passport = require('passport');

var orm = require("orm");
var database = require("./app/database");


// create and configure server =================================================
var server = express();

server.use(morgan({ format: 'dev', immediate: true }));

// database connection
server.use(orm.express("pg://abhihnahgxvxim:WTaDQYg7roQaOx0ieKNDoKZ-V-@ec2-54-197-238-242.compute-1.amazonaws.com:5432/d4ielacnr2v55l?ssl=true&pool=true", {
    define: database
}));

// if possible compress with gzip
server.use(compress());

// read cookies (needed for auth)
server.use(cookieParser());

// parse the HTTP entity body, data available in res.body
server.use(bodyParser({
    maxBodySize: 65535,
    mapParams: false
}));

// static
server.use(express.static(__dirname + '/public'));

// session secret
server.use(session({ secret: 'ilovekittiessomuch' }));

// pass passport for configuration
require('./config/passport')(passport);

// setup passport
server.use(passport.initialize());

// persistent login sessions
server.use(passport.session());

// routes ==========================================
// TODO: send 403 when not logged in or not current user
// TODO: implement checksum ( crypto.HmacSHA1( message , encryptionKey ).toString() )

// load our routes and pass in our server and fully configured passport
require('./app/routes.js')(server, passport);

// launch ==========================================
var port = process.env.PORT || 1337;

server.listen(port, function () {
    console.log("listening at %s", port);
});
