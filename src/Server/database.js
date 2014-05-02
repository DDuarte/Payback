
var orm = require('orm');

function init(db, models) {
    var _this = this;

    /** user table **/
    models["user"] = db.define("user", {
        id: { type: "text", size: 20, required: true, unique: true },
        passwordHash: { type: "text", size: 64, required: true },
        email: { type: "text", size: 254, required: true, unique: true }
    }, {
        validations: {
            passwordHash: orm.enforce.ranges.length(64, 64, "invalid-password-length")
        }
    });

    /** **/
    /** debt table **/
    models["debt"] = db.define("debt", {
        date: { type: "date", time: false },
        value: Number,
        resolved: { type: "boolean", default: false }
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

    models.debt.hasOne("creditor", models.user, { required: true }); // idCreditor
    models.debt.hasOne("debtor", models.user, { required: true }); // idDebtor

    /** **/
    /** friendship table **/
    models["friendship"] = db.define("friendship", {
        date: { type: "date", time: true }
    }, {
        hooks: {
            beforeCreate: function (next) {
                this.date = +(new Date()); // fancy way of converting a date to a timestamp
                next();
            }
        }
    });

    models.friendship.hasOne("member1", models.user, { required: true }); // idMember1
    models.friendship.hasOne("member2", models.user, { required: true }); // idMember2

    /** **/

    db.sync(function (err) {
        if (err)
            console.log("sync: %s", err);
    });
};

module.exports = init;
