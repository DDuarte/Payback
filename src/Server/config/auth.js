// config/auth.js

module.exports = {

    facebookAuth: {
        clientID: "279961542177568",
        clientSecret: "72f23d486592a7af12a79c0020457a54",
        signupCallbackURL: "http://localhost:1337/signup/facebook/callback",
        loginCallbackURL: "http://localhost:1337/login/facebook/callback",
        connectCallbackURL: "http://localhost:1337/connect/facebook/callback"
    },

    twitterAuth : {
        consumerKey		: 'zd8XQbIzsoNC08hgPszaJyQwP',
        consumerSecret 	: 'yWtbYQdPwdn3rq2T8oZxT4C604cBFt2YANFGtXBd6O0GuSS0ys',
        callbackURL		: 'http://localhost:1337/auth/twitter/callback'
    },

    googleAuth: {
        clientID: "20245249929-c4vg5b8ejg10156llvdgiccr1lc6evtp.apps.googleusercontent.com",
        clientSecret: "THEioXacp0YhbX07ci37aFM2",
        signupCallbackURL: "http://localhost:1337/signup/google/callback",
        loginCallbackURL: "http://localhost:1337/login/google/callback",
        connectCallbackURL: "http://localhost:1337/connect/google/callback",
        realm: "http://localhost:1337/"
    }
};

