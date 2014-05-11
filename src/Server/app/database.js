var orm = require('orm');

function init(db, models) {

    var user = db.define("user", {
        id: { type: "text", size: 20, required: true },
        passwordHash: { type: "text", size: 64 },
        email: { type: "text", size: 254, required: false, unique: true }
    }, {
        validations: {
            passwordHash: orm.enforce.ranges.length(64, 64, "invalid-password-length"),
            email: orm.enforce.patterns.email("invalid-email-format")
        }
    });

    user.hasMany('friends', user, { date: Date });

    var facebook = db.define("facebook", {
        id: { type: "text", required: true },
        token: { type: "text", required: true, unique: true },
        email: { type: "text", size: 254, required: true, unique: true },
        displayName: { type: "text", required: true }
    }, {
        validations: {
            email: orm.enforce.patterns.email("invalid-email-format")
        }
    });

    user.hasOne("facebookAccount", facebook);
    facebook.hasOne("localAccount", user, { required: true }); // every facebook account has to be linked to a local account

    var twitter = db.define("twitter", {
        id: {type: "text", required: true },
        token: { type: "text", required: true, unique: true },
        displayName: { type: "text", required: true }
    });

    user.hasOne("twitterAccount", twitter);
    twitter.hasOne("localAccount", user, { required: true }); // every twitter account has to be linked to a local account

    var google = db.define("google", {
        id: { type: "text", required: true },
        token: { type: "text", unique: true }, // we're using OpenID instead of OAuth 2.0, tokens are not provided :(
        email: { type: "text", size: 254, required: true, unique: true },
        displayName: { type: "text", required: true }
    }, {
        validations: {
            email: orm.enforce.patterns.email("invalid-email-format")
        }
    });

    user.hasOne("googleAccount", google);
    google.hasOne("localAccount", user, { required: true }); // every google account has to be linked to a local account

    var debt = db.define("debt", {
        date: { type: "date", time: false },
        value: Number,
        resolved: { type: "boolean", defaultValue: false },
        currency: { type: "text", required: true}
    }, {
        hooks: {
            beforeCreate: function (next) {
                this.date = new Date();
                next();
            }
        },
        validations: {
            value: orm.enforce.ranges.number(0, undefined, "negative-value"),
            currency: orm.enforce.lists.inside([

                "AUD",
                "BGN",
                "BRL",
                "CAD",
                "CHF",
                "CNY",
                "CZK",
                "DKK",
                "GBP",
                "HKD",
                "HRK",
                "HUF",
                "IDR",
                "ILS",
                "INR",
                "JPY",
                "KRW",
                "LTL",
                "MXN",
                "MYR",
                "NOK",
                "NZD",
                "PHP",
                "PLN",
                "RON",
                "RUB",
                "SEK",
                "SGD",
                "THB",
                "TRY",
                "USD",
                "ZAR"

            ], "invalid-currency")
        }
    });

    debt.hasOne("creditor", user, { reverse: "credits", required: true });
    debt.hasOne("debtor", user, { reverse: "debts", required: true });

    models.user = user;
    models.debt = debt;
    models.facebook = facebook;
    models.twitter = twitter;
    models.google = google;

    db.sync(function (err) {
        if (err)
            console.log("Error when syncing db: %s", err);
    });
}

module.exports = init;
