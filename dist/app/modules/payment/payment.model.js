"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Payment = void 0;
const mongoose_1 = require("mongoose");
const payment_interface_1 = require("./payment.interface");
const paymentSchema = new mongoose_1.Schema({
    ride: { type: mongoose_1.Schema.Types.ObjectId, ref: "Ride", required: true },
    user: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    paymentStatus: {
        type: String,
        enum: Object.values(payment_interface_1.PAYMENT_STATUS)
    },
    transactionId: { type: String },
}, {
    timestamps: true
});
exports.Payment = (0, mongoose_1.model)("Payment", paymentSchema);
