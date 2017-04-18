import winston from "winston";
import expressWinston from "express-winston";

const logger = new winston.Logger({
    transports: [
			new winston.transports.Console({ level: "debug", handleExceptions: true, json: false, colorize: true })
    ]
});

export { logger as default };
export { logger as logger };

export const loggerMiddleware = expressWinston.logger({
	winstonInstance: logger,
	expressFormat: true,
	colorize: true,
	meta: false
});
