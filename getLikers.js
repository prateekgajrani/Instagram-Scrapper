const instagram = require("./instagram.js");
const fs = require("fs");

instagram.getLikers('Bgz2RjyHWQO', 500).then((data) => {
    fs.writeFileSync(`./json/likers.json`, JSON.stringify(data, undefined, 2));
    console.log(JSON.stringify(data, undefined, 2));
});