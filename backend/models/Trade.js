const mongoose = require("mongoose");

const tradeSchema = new mongoose.Schema(
  {
    user:        { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    symbol:      { type: String, required: true, uppercase: true },
    companyName: { type: String, default: "" },
    type:        { type: String, enum: ["BUY", "SELL"], required: true },
    quantity:    { type: Number, required: true, min: 1 },
    price:       { type: Number, required: true },        // price per share at time of trade
    total:       { type: Number, required: true },        // quantity * price
    cashBefore:  { type: Number, required: true },
    cashAfter:   { type: Number, required: true },
    status:      { type: String, enum: ["EXECUTED", "FAILED"], default: "EXECUTED" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Trade", tradeSchema);