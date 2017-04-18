import mongoose from 'mongoose'

const comissionPaidSchema = new mongoose.Schema({
  broker: String,
  account: String,
  value: Number,
  paidAt: { type: Date, default: Date.now }
});

const CommissionPaid = mongoose.model("CommissionPaid", comissionPaidSchema);

export default CommissionPaid;
