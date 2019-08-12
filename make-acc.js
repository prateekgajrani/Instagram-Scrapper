const instagram = require("./instagram.js");
const fs = require("fs");
var random_name = require('node-random-name');

var users = fs.readFileSync("./json/accounts.json");
users = JSON.parse(users);

var make_account = () => {
    var tempUser = {
        email: `${random_name().replace(/ /g,"").toLowerCase()}s${Math.floor(Math.random() * 10000)}@gmail.com`,
        password: "instagram123#",
        username: `${random_name().replace(/ /g,"").toLowerCase()}s${Math.floor(Math.random() * 10000)}`,
        name: random_name()
    }
    instagram.changeIp().then((data) => {
        console.log("IP Change",data);
        instagram.register(tempUser).then((data) => {
            if(data == "Error"){
                throw new Error("Account not created");
            }
            if(!data.account_created){
                throw new Error("Account not created");
            }else{
                users.push(tempUser);
                console.log("Account Created: ",users.length);
                fs.writeFileSync("./json/accounts.json",JSON.stringify(users, undefined, 2));
                make_account();
            } 
        }).catch((e) => {
            console.log("Account not created!");
            make_account();
        });
    }).catch((e) => {
        console.log(e);
        make_account();
    });
}

make_account();