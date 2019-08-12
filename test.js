const instagram = require("./instagram.js");

var account = {
    "email": "lidiaharlems7700@gmail.com",
    "password": "kartik748976#",
    "username": "playwin101",
    "name": "Lidia Harlem"
  };

instagram.login_Mention(account, "7363835613", "1728869353207745234_3681787327", "Amazing").then((data1) => {
    if(data1 != "Error"){
        if(data1.status == "ok"){
            console.log("Done till: ");
            k++;
            // setTimeout(commentAgain,30000);
        }else{
            // commentAgain();
        }
    }else{
        // commentAgain();
    }
});