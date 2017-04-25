import chai from "chai"
import chaiAsPromised from "chai-as-promised"

import sinon from "sinon"
import sinonChai from "sinon-chai"

import {Entitlement, entitlementFactory} from "../entitlement"
import request from "request-promise-native";

const should = chai.should()
chai.use(sinonChai)
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
			});

			it("Should notify restrictedFieldsObserver when restricted fields change", () => {
				const observer = sinon.spy();

				const ent = new Entitlement("claudio", {}, [
					"projection"
				], observer);

				ent.restrictedFields = ["stuff"];
				ent.restrictedFields = ["banana", "frutilla"];

				observer.should.have.been.calledTwice;
				observer.firstCall.should.have.been.calledWith(["projection"], ["stuff"])
				observer.secondCall.should.have.been.calledWith(["stuff"], ["banana", "frutilla"])
			});
		})

	})

	describe("The entitlementFactory object", () => {
		let originalGet;

		before(() => {
			sinon.stub(request, "get").resolves(JSON.stringify({
				username: "claudio",
				role: "executionTrader",
				account: "TG00"
			}));
		})

		after(() => {
			request.get.restore();
		})

		it("Should create an entitlement object", () => {
			const promise = entitlementFactory.create("claudio")
			return promise.should.eventually.have.property("username").equal("claudio")
		})

		it("Should create an entitlement object with right account", () => {
			const promise = entitlementFactory.create("claudio")
			return promise.should.eventually.have.property("account").equal("TG00")
		})

		it("If i call it twice with the same user it should return two entitlements with the same username", async() => {
			const entitlement1 = await entitlementFactory.create("claudio");
			const entitlement2 = await entitlementFactory.create("claudio");
			entitlement1.username.should.be.equal(entitlement2.username);
			entitlement1.username.should.be.equal("claudio");
		})

	})


});
