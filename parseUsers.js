const fs = require("fs");

var commenters = fs.readFileSync(`./json/likers.json`, 'utf-8')
commenters = JSON.parse(commenters);
var usernames = [];
commenters.forEach((array) => {
    array.forEach((commenter) => {
        username = commenter.node.username;
        if(!usernames.includes(username)){
            usernames.push(username);
        }
    })
});

fs.writeFileSync(`./json/likers-user.json`, JSON.stringify(usernames, undefined, 2));