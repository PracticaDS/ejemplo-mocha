import mongoose from 'mongoose'

const comissionTargetSchema = new mongoose.Schema({
  broker: String,
  account: String,
  value: Number
});

const CommissionTarget = mongoose.model("CommissionTarget", comissionTargetSchema);

export default CommissionTarget;
