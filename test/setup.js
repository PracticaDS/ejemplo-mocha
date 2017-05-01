import sinon from "sinon"

import mongoose from "mongoose"
import mockgoose from "mockgoose"

import httpRequest from "request-promise-native"

/**
 * @return {Function} a function that when invoked will prepare mockgoose
 *                    mocks
 */
export function setupMocha() {
	before("Mock mongoose", async() => {
		await mockgoose(mongoose)
		mongoose.connect('mongodb://localhost/commissions')
	})

	after("Restore mongoose", done => {
  	mongoose.unmock(done);
	})

	afterEach("Reset mock mongo database", done => {
	  mockgoose.reset(done);
	})
}

/**
 * @return {Function} a function that when invoked will prepare external
 *                    http user service mocks
 */
export function setupUserService() {
	before("Mock external service", () => {
		sinon.stub(httpRequest, "get").resolves(JSON.stringify({
			username: "claudio",
			role: "executionTrader",
			account: "TG01"
		}))
	})

	after("Restore external service", () => {
		httpRequest.get.restore();
	})
}
