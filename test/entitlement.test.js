import chai from "chai"
import chaiAsPromised from "chai-as-promised"

import {Entitlement, entitlementFactory} from "../entitlement"
import request from "request-promise-native";

const should = chai.should()
chai.use(chaiAsPromised)

describe("Entitlement module", () => {

	describe("An entitlement object", () => {
		context("When there are restricted fields configured", () => {

			const report = [
					{
						commissionValue: 32,
						commissionRate: 14,
						projection: 10000
					},
					{
						commissionValue: 42,
						commissionRate: 54
					},
					{
						commissionValue: 42,
						commissionRate: 54,
						otherStuff: {
							projection: 1203
						}
					}
			];

			it("Should not show restricted fields", () => {
				const ent = new Entitlement("claudio", {}, [
					"projection"
				]);

				const restrictedReport = ent.restrict(report);
				restrictedReport.should.be.deep.equal([
					{
						commissionValue: 32,
						commissionRate: 14
					},
					{
						commissionValue: 42,
						commissionRate: 54
					},
					{
						commissionValue: 42,
						commissionRate: 54,
						otherStuff: {
							projection: 1203
						}
					}
				]);
			})

			it("Should not show nested restricted fields", () => {
				const ent = new Entitlement("claudio", {}, [
					"projection", "otherStuff.projection"
				]);

				const restrictedReport = ent.restrict(report);
				restrictedReport.should.be.deep.equal([
					{
						commissionValue: 32,
						commissionRate: 14
					},
					{
						commissionValue: 42,
						commissionRate: 54
					},
					{
						commissionValue: 42,
						commissionRate: 54,
						otherStuff: {}
					}
				]);
			})

		})

	})

	describe("The entitlementFactory object", () => {
		let originalGet;

		before(() => {
			originalGet = request.get;
			request.get = url => {
				return Promise.resolve(JSON.stringify({
					username: "claudio",
					role: "executionTrader",
					account: "TG00"
				}))
			}
		})

		after(() => {
			request.get = originalGet;
		})

		it("Should create an entitlement object", () => {
			const promise = entitlementFactory.create("claudio")
			return promise.should.eventually.have.property("username").equal("claudio")
		})

		it("Should create an entitlement object with right account", () => {
			const promise = entitlementFactory.create("claudio")
			return promise.should.eventually.have.property("account").equal("TG00")
		})



	})


});
