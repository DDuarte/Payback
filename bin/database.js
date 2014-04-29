/// <reference path="Scripts/typings/node-orm2/orm.d.ts" />
var DebtsModel = (function () {
    function DebtsModel() {
    }
    DebtsModel.init = function (db, models) {
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

        db.sync(function (err) {
            console.log("sync: %s", err);
        });
    };
    return DebtsModel;
})();
exports.DebtsModel = DebtsModel;
//# sourceMappingURL=database.js.map
