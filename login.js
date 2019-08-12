const instagram = require("./instagram.js");
const fs = require("fs");
var random_name = require('node-random-name');

var usernames = fs.readFileSync(`./json/likers-user.json`, 'utf-8');
usernames = JSON.parse(usernames);
var comments = [];
var accounts = fs.readFileSync(`./json/accounts.json`, 'utf-8');;
accounts = JSON.parse(accounts);

var mediaId = ["1744143493906565559","1744143410708468124","1744143172866341182"];

// console.log(Math.floor(Math.random()*427));

var prefix = ["Hi ","See this -> ","Hola ","Oi ","See ","Friend ","OP ","TI ","Sola ","Hey "];

for(i=0;i<usernames.length;i+=5){
    var tempComment = `${prefix[Math.floor(Math.random() *9)]} `;
    for(j=0;j<10;j++){
        tempComment += `@${usernames[i+j]} `;
    }
    comments.push(tempComment);
}


// console.log(comments[1]);
k = 0;

var comment = () => {
    instagram.changeIp().then((data) => {
        console.log("IP Change",data);
        if(data != "False"){
            instagram.login_Mention(accounts[k], "7363835613", mediaId[Math.floor(Math.random()*2)], comments[k]).then((data1) => {
                if(data1 != "Error"){
                    if(data1.status == "ok"){
                        console.log("Done till: ",k);
                        k++;
                        setTimeout(commentAgain,30000);
                    }else{
                        commentAgain();
                    }
                }else{
                    commentAgain();
                }
            });
        }
    }).catch((e) => {
        console.log(e);
        commentAgain();
    });
}
var commentAgain = () => {
    comment();
}

commentAgain();