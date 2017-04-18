"use strict";
import express from "express"
import CommissionPaid from "../models/CommissionPaid"
import CommissionTarget from "../models/CommissionTarget"

const api = {
	payCommission(data) {
		const commission = new CommissionPaid(data);
		return commission.save();
	},

	setAnnualTarget(data) {
		const target = new CommissionTarget(data);
		return target.save();
	}
}

function addAccountData(data, entitlement) {
	if (data.account && data.account !== entitlement.account) {
		throw new Error("Cannot submit data for different account");
	}
	if (!data.account) {
		data.account = entitlement.account;
	}
	return data;
}

const router = express.Router();

router.post("/commission/pay", (req, res) => {
	const data = addAccountData(req.body, req.auth.entitlement);
	api.payCommission(data)
		.then(paid => res.status(200).json(paid));
});

router.post("/commission/target", (req, res) => {
	const data = addAccountData(req.body, req.auth.entitlement);
	api.setAnnualTarget(data)
		.then(target => res.status(200).json(target));
});

export default router;
