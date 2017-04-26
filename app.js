"use strict";
import express from "express";
import bodyParser from "body-parser";
import path from "path";
import fs from "fs";

import { logger, loggerMiddleware } from "./logging";
import { entitlementMiddleware } from "./entitlement";

import mongoose from 'mongoose'
mongoose.connect('mongodb://localhost/commissions')

const app = express();
app.use(loggerMiddleware);
app.use(entitlementMiddleware);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Bootstrap api
const routesPath = path.join(__dirname, "routes");
fs.readdirSync(routesPath).forEach(file => {
	const routeModule = require(`${routesPath}/${file}`);
	app.use("/", routeModule.default);
});

// Setup Express error handling
app.use((err, req, res, next) => {
	logger.error("Error processing request from %s (%s): " + err.stack, req.ip, req.originalUrl);
	res.sendStatus(500);
});

export default app;
