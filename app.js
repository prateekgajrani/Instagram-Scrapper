const instagram = require("./instagram.js");
const fs = require("fs");
var random_name = require('node-random-name');
const proxyScrapper = require('./proxyScrapper.js');
var usernames = fs.readFileSync(`./json/likers-user.json`, 'utf-8');
var colors = require('colors');
var figures = require('figures');
usernames = JSON.parse(usernames);
var comments = [];
var ids = fs.readFileSync(`./json/ids.json`, 'utf-8');;
ids = JSON.parse(ids);
var allGlobalProxies = [];
var usedProxies = [];
var globalProxy = undefined;

var mediaId = ["1821029907158576714"];

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
k = 10;

var start = () => {
    var tempUser = {
        email: `${random_name().replace(/ /g,"").toLowerCase()}s${Math.floor(Math.random() * 10000)}@gmail.com`,
        password: "instagram123#",
        username: `${random_name().replace(/ /g,"").toLowerCase()}s${Math.floor(Math.random() * 10000)}`,
        name: random_name()
    }
        instagram.mentioner(tempUser, ids[Math.floor(Math.random() * ids.length)], mediaId[Math.floor(Math.random()*3)], comments[k], globalProxy).then((data1) => {
            if(data1 != "Error"){
                if(data1.status == "ok"){
                    console.log("Done till: ",k);
                    k++;
                    setTimeout(changeIp,30000);
                }else{
                    // commentAgain();
                }
            }else{
                // commentAgain();
            }
        });
}

const getProxies = async() => {
    console.log(`Getting Proxy`,colors.green(figures.tick));
    usedProxies = [];
    // usedProxies = JSON.parse(fs.readFileSync('usedProxies.json'));
    allGlobalProxies = await proxyScrapper.grapProxy();
    console.log('Got Proxies');
    // allGlobalProxies = JSON.parse(fs.readFileSync('validatedProxy.json'));
    return changeIp();
}

const changeIp = async () => {
    var i = 0;
    var flag = false;
    while(i<allGlobalProxies.length){
        var tempProxy = allGlobalProxies[i];
        if(!usedProxies.includes(tempProxy)){
            i = allGlobalProxies.length;
            globalProxy = tempProxy;
            console.log(`Proxy -> ${globalProxy}`,colors.green(figures.tick));
            usedProxies.push(tempProxy);
            flag = true; 
        }else{
            i++;
        }
    }
    // fs.writeFileSync('usedProxies.json',JSON.stringify(usedProxies, undefined, 2));
    if(!flag) return getProxies();
    else return start();
};

changeIp();