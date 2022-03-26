"use strict";

const mongoose = require("mongoose");

module.exports = function(MONGO_URI) {
    const connection = mongoose.connect(MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    connection.close = () => connection.then((client) => client.close());
    return connection;
};