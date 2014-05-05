
var orm = require('orm');

function init(db, models) {

    var user = db.define("user", {
        id: { type: "text", size: 20, required: true },
        passwordHash: { type: "text", size: 64, required: true },
        email: { type: "text", size: 254, required: true, unique: true }
    }, {
        validations: {
            passwordHash: orm.enforce.ranges.length(64, 64, "invalid-password-length"),
            email: orm.enforce.patterns.email("invalid-email-format")
        }
    });

    user.hasMany('friends', user, { date: Date });

    var debt = db.define("debt", {
        date: { type: "date", time: false },
        value: Number,
        resolved: { type: "boolean", defaultValue: false }
    }, {
        hooks: {
            beforeCreate: function (next) {
                this.date = new Date();
                next();
            }
        },
        validations: {
            value: orm.enforce.ranges.number(0, undefined, "negative-value")
        }
    });

    debt.hasOne("creditor", user, { reverse: "credits", required: true });
    debt.hasOne("debtor", user, { reverse: "debts", required: true });

    models["user"] = user;
    models["debt"] = debt;

    db.sync(function (err) {
        if (err)
            console.log("Error when syncing db: %s", err);
    });
};

module.exports = init;
