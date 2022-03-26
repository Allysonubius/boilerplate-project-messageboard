"use strict";

module.exports = function (err, req, res, next) {
  if (process.env.NODE_ENV !== "production") {
    console.error(err.name, {
      message: err.message,
    });
  }
  next();
};
