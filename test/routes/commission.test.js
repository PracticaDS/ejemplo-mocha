import chai from "chai"
import sinon from "sinon"
import chaiAsPromised from "chai-as-promised"

import request from "supertest"
import app from "../../app"

import { setupMocha, setupUserService } from "../setup"

const should = chai.should()
chai.use(chaiAsPromised)

describe("Commission router", () => {

	setupMocha();
	setupUserService();

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
