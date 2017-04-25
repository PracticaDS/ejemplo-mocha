"use strict";

import objectPath from "object-path";

import request from "request-promise-native";
import fsp from "fs-promise";
import path from "path";

export class Entitlement {

	constructor(username, profile, restrictedFields, restrictedFieldsObserver) {
		this.username = username;
		this.profile = profile;
		this._restrictedFields = restrictedFields || [];
		this.restrictedFieldsObserver = restrictedFieldsObserver;
	}

	get account() {
		return this.profile.account;
	}

	set restrictedFields(fields) {
		this.restrictedFieldsObserver && this.restrictedFieldsObserver(this._restrictedFields, fields);
		this._restrictedFields = fields;
	}
	get restrictedFields() {
		return this._restrictedFields;
	}

	/**
	 * Restricts data out of the incoming object according to the
	 * configured restrict rules (restrictedFields paths). If data if
	 * an array each element on such array is individually processed.
	 *
	 * @param {Object} data - the unrestricted data object.
	 * @return {Object} the data object, without the restricted fields.
	 */
	restrict(data) {
		Array.isArray(data) ?
			data.forEach(each => this.restrict(each)) :
			this.restrictedFields.forEach(field => objectPath.del(data, field));

		return data;
	}

}

export const entitlementFactory = {

	/**
	 * Creates an Entitlement object from a given username. It relies on an
	 * external REST service to find the associated user role.
	 *
	 * @param {string} username - the username of the user
	 * @return {Promise} a promise that will resolve to an Entitlement object or
	 *                   fail.
	 */
	create(username) {
		const host = process.env.ROLE_SERVICE_HOST || "localhost";
		const port = process.env.ROLE_SERVICE_PORT || 9999;

		return request.get(`http://${host}:${port}/user/${username}`)
			.then(response => JSON.parse(response))
			.then(profile => Promise.all([profile, this.readRestrictedColums(profile.role)]) )
			.then(([profile, restricted]) => new Entitlement(username, profile, restricted));
	},

	/**
	 * Finds a set of restricted columns from the role name.
	 *
	 * @param {string} role - the role
	 * @return {Promise} a promise that will resolve to an array of restricted
	 *                     columns or fail.
	 */
	readRestrictedColums(role) {
		const file = path.join(__dirname, "roles", role + ".json");
		return fsp.readFile(file)
			.then(json => JSON.parse(json))
			.then(data => data.restrictedColumns);
	}

}

export const entitlementMiddleware = function(req, res, next) {
	const username = req.query.username;
	if (! username) {
		throw new Error("Username must be specified");
	}

	entitlementFactory.create(username).then(entitlement => {
		req.auth = req.auth || {};
		req.auth.entitlement = entitlement;

		// intercepts original res.json() function to restrict data before
		const originalJsonFn = res.json;
		res.json = data => {
			const restricted = entitlement.restrict(data);
			return originalJsonFn.apply(res, [restricted]);
		};

		next();
	});
}
