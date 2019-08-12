const instagram = require("./instagram.js");
const fs = require("fs");
var random_name = require('node-random-name');

var tempUser = {
    password: "password",
    username: `lovers_stage`,
};

instagram.getFollowers(tempUser, '665517159', 500);