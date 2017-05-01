"use strict";

import app from "./app"

// Connect here
import mongoose from 'mongoose'
mongoose.connect('mongodb://localhost/commissions')

// Start server
const port = 8888;
const host = "localhost";
app.server = app.listen(port, host, function() {
	logger.info("Express server listening on port %d, host %s", port, host);
});
