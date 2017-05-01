import chai from "chai"
import sinon from "sinon"
import chaiAsPromised from "chai-as-promised"

import request from "supertest"
import httpRequest from "request-promise-native";
import app from "../../app"

import mongoose from 'mongoose'
import mockgoose from 'mockgoose'

const should = chai.should()
chai.use(chaiAsPromised)

describe("Commission router", () => {

	before("Mock mongoose", async() => {
		await mockgoose(mongoose)
		mongoose.connect('mongodb://localhost/commissions')
	})

	before("Mock external service", () => {
		sinon.stub(httpRequest, "get").resolves(JSON.stringify({
			username: "claudio",
			role: "executionTrader",
			account: "TG01"
		}));
	})

	after("Restore external service", () => {
		httpRequest.get.restore();
	})

	after("Restore mongoose", done => {
  	mongoose.unmock(done);
	});

	afterEach("Reset mock mongo database", done => {
	  mockgoose.reset(done);
	});

	describe("POST /commission/pay", () => {

		it("La commission es asociada a la cuenta del usuario", async() => {
			const response = await request(app)
				.post("/commission/pay?username=claudio")
				.send({ "broker": "RBS", "value": 100	})
				.expect(200);

			const body = response.body
			body.should.have.property("broker", "RBS")
			body.should.have.property("value", 100)
			body.should.have.property("account", "TG01")
			body.should.have.property("_id")
		})

		//Needs more tests!

	})

});
