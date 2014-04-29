/// <reference path="Scripts/typings/node-orm2/orm.d.ts" />

import orm = require('orm');

export class DebtsModel {
    public static init(db: orm.ORM, models:{ [key: string]: orm.Model }) {

        models["user"] = db.define('user', {
            id: String,
            passwordHash: String,
            email: String
        });

        models["debt"] = db.define('debt', {
            id: Number,
            idCreditor: String,
            idDebtor: String,
            date: Date,
            value: Number,
            resolved: Boolean
        });

        models["friendship"] = db.define('friendship', {
            idMember1: Number,
            idMember2: Number,
            date: Date
        });

        db.sync((err) => { console.log("sync: %s", err)});
    }
}
