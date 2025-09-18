"use strict";
/**
 * name  Full name.
    email Must be unique.
    password Hashed using bcrypt.
    role  Enum: 'admin' | 'rider' | 'driver'.
    phone  Optional, but useful for ride communication.
    isBlocked  Boolean flag.If true, user cant access the system.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.IsActive = exports.Role = void 0;
var Role;
(function (Role) {
    Role["SUPER_ADMIN"] = "SUPER_ADMIN";
    Role["ADMIN"] = "ADMIN";
    Role["RIDER"] = "RIDER";
    Role["DRIVER"] = "DRIVER";
})(Role || (exports.Role = Role = {}));
var IsActive;
(function (IsActive) {
    IsActive["ACTIVE"] = "ACTIVE";
    IsActive["INACTIVE"] = "INACTIVE";
    IsActive["BLOCKED"] = "BLOCKED";
    IsActive["UNBLOCK"] = "UNBLOCK";
})(IsActive || (exports.IsActive = IsActive = {}));
