/// <reference path="Scripts/typings/node-orm2/orm.d.ts" />

import orm = require('orm');

export class DebtsModel {
    public static init(db:orm.ORM, models:{ [key: string]: orm.Model }) {

        models["user"] = db.define('user', {
            id: { type: "text", size: 20, required: true, unique: true },
            passwordHash: { type: "text", size: 64, required: true },
            email: { type: "text", size: 254, required: true, unique: true }
        }, {
            validations: {
                passwordHash: orm.enforce["ranges"].length(64, 64, "invalid-password-length")
            }
        });

        models["debt"] = db.define('debt', {
            date: { type: "date", time: false }, // time: false, represents a DATE
            value: Number,
            resolved: { type: "boolean", default: false}
        }, {
            validations: {
                value: orm.enforce["ranges"].number(0, undefined, "negative-value")
            }
        });

        models["debt"]["hasOne"]("creditor", models["user"], { required: true });
        models["debt"]["hasOne"]("debtor", models["debtor"], { required: true });

        models["friendship"] = db.define('friendship', {
            idMember1: Number,
            idMember2: Number,
            date: Date
        });

        db.sync((err) => {
            if (err) console.log("sync: %s", err)
        });
    }
}
