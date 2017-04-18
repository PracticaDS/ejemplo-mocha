"use strict";
import express from "express"

import CommissionPaid from "../models/CommissionPaid"
import CommissionTarget from "../models/CommissionTarget"

const api = {
	aggregateCommissions(account) {
		return CommissionPaid.aggregate([
			{ $project: {
					_id: 0,
					account: 1,
					broker: 1,
					value: 1,
					accountValue: {$cond: [{$eq: ["$account", account]}, "$value", 0]}
			}},
			{ $group: { _id: "$broker", accountTotal: {$sum: "$accountValue"}, firmTotal: {$sum: "$value"}}}
		]);
	},

	createBrokerCommission(brokerData, targets) {
		const target = targets.find(eachTarget => eachTarget.broker === brokerData._id);
		return {
			broker: brokerData._id,
			comission: {
				paid: brokerData.accountTotal,
				target: (target ? target.value : 0)
			},
			projection: {
				holistic: brokerData.firmTotal,
				participation: brokerData.accountTotal / brokerData.firmTotal
			}
		};
	},

	byBroker(account) {
		const commissionsPromise = this.aggregateCommissions(account);
		const targetsPromise = CommissionTarget.find({ account })

		return Promise.all([commissionsPromise, targetsPromise])
			.then(([commissions, targets]) => commissions.map(eachBroker => this.createBrokerCommission(eachBroker, targets)));
	}
}


const router = express.Router();

router.get("/by-broker", (req, res) => {
	api.byBroker(req.auth.entitlement.account)
		.then(report => res.status(200).json(report));
});

export default router;
