const request = require("request");
const fs = require("fs");
const shell = require('shelljs');
var cookies = '';
var crfToken = '';
var mid = '';
var globalProxy = undefined;

const proxy = true;

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

const makeReq = (url, type, postData, token) => {
    if (url[0] == '/') url = "https://www.instagram.com" + url;
    if(!type) type = "GET";
    let req_opt = {
        method: type,
        url: url,
        headers: {
            'Accept': '*/*',
            'content-type': 'application/x-www-form-urlencoded',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36'
        }
    };
    if(proxy) req_opt.proxy = 'http://127.0.0.1:8888';
    if(postData) req_opt.body = postData;
    if(globalProxy) req_opt.proxy = globalProxy;

    if(cookies != "") req_opt.headers['Cookie'] = cookies.toString();
    if(token){
        req_opt.headers['X-CSRFToken'] = crfToken;
        req_opt.headers['X-Instagram-AJAX'] = '1';
        req_opt.headers['X-Requested-With'] = 'XMLHttpRequest';
        req_opt.headers['Referer'] = 'https://www.instagram.com/';
    }

    return new Promise((resolve, reject) => {
        request(req_opt, (err, res, body) => {
            try{
                setTimeout(() => reject('break'),20000);
                if(err) reject(err);
                // resolve(res);
                if (res.headers.hasOwnProperty('set-cookie')) {
                    let newCookie = {};
                    if(cookies != ""){
                        cookies = cookies.replace(/; /g,";").split(";");
                        cookies.forEach((cookie) => {
                            cookie = cookie.split("=");
                            newCookie[cookie[0]] = cookie[1];
                        });
                    }
                    tempCookie = res.headers['set-cookie'];
                    tempCookie.forEach((cookie) => {
                        cookie = cookie.split(";")[0].split("=");
                        newCookie[cookie[0]] = cookie[1];
                    });
                    crfToken = newCookie["csrftoken"];
                    mid = newCookie["mid"];
                    let arr = Object.keys(newCookie).map((key) => key + "=" + newCookie[key]);
                    cookies = arr.join("; ");
                }
                resolve(body);
            }catch(e){reject('break')}
        });
    });
};

const register = async (user) => {
    cookies = '';

    var data = await makeReq("/", "POST");

    data = await makeReq("/accounts/web_create_ajax/", "POST", `email=${user.email}&password=${user.password}&username=${user.username}&first_name=${user.name}&seamless_login_enabled=1`, true);

    if(data.includes("Oops, an error occurred")){
        return "Error";
    }

    data = JSON.parse(data);

    fs.writeFileSync(`./cookies/${user.username}.txt`, cookies);

    return data;
};

const mentioner = async (user, userId, mediaId, comment, proxy) => {
    try{
        if(proxy) globalProxy = proxy;
        var data = await register(user);
        if(data == "Error"){
            throw new Error("Account not created");
        }
        if(!data.account_created){
            throw new Error("Account not created");
        }

        data = await makeReq(`/web/friendships/${userId}/follow/`, "POST", undefined, true);

        data = await makeReq(`/web/comments/${mediaId}/add/`, "POST", `comment_text=${encodeURIComponent(comment)}`, true);

        // await makeReq(`/web/friendships/${userId}/unfollow/`, "POST", undefined, true);

        data = JSON.parse(data);

        return data;
    } catch(e) {
        return "Error";
    }
};

const login_Mention = async (user, userId, mediaId, comment) => {
    try{
        var data = await login(user);

        data = await makeReq(`/web/friendships/${userId}/follow/`, "POST", undefined, true);

        data = await makeReq(`/web/comments/${mediaId}/add/`, "POST", `comment_text=${encodeURIComponent(comment)}`, true);

        await makeReq(`/web/friendships/${userId}/unfollow/`, "POST", undefined, true);

        data = JSON.parse(data);

        return data;
    } catch(e) {
        return "Error";
    }
};

const login = async (user) => {
    var data = await makeReq("/", "POST");

    data = await makeReq("/accounts/login/ajax/", "POST", `username=${user.username}&password=${user.password}&next=%2F`, true);

    fs.writeFileSync(`./cookies/${user.username}.txt`, cookies);

    data = JSON.parse(data);
    return data;
};

const getCommenters = async (mediaId, length) => {
    var commenters = [];
    var data = await makeReq(`https://www.instagram.com/graphql/query/?query_hash=33ba35852cb50da46f5b5e889df7d159&variables={"shortcode":"${mediaId}","first":1000}`);
    data = JSON.parse(data);
    if(data.hasOwnProperty("data")){
        data = data.data.shortcode_media.edge_media_to_comment;
        totalComments = data.count;
        if(data.page_info.end_cursor != (null)) endCursor = data.page_info.end_cursor;

        commenters.push(data.edges);
        i=length;
        console.log("Getting Users",i);
        while (i<totalComments){
            var data = await makeReq(`https://www.instagram.com/graphql/query/?query_hash=33ba35852cb50da46f5b5e889df7d159&variables={"shortcode":"${mediaId}","first":${length},"after":"${endCursor}"}`);
            data = JSON.parse(data);
            if(data.hasOwnProperty("data")){
                data = data.data.shortcode_media.edge_media_to_comment;
                if(data.page_info.end_cursor != (null)) endCursor = data.page_info.end_cursor;
                commenters.push(data.edges);
                fs.writeFileSync(`./json/commenters.json`, JSON.stringify(commenters, undefined, 2));
                i += length;
                console.log("Getting Users",i);
            }
        }
        return commenters;
    }
};

const getLikers = async (mediaId, length) => {
    var commenters = [];
    var data = await makeReq(`https://www.instagram.com/graphql/query/?query_hash=1cb6ec562846122743b61e492c85999f&variables={"shortcode":"${mediaId}","first":1000}`);
    data = JSON.parse(data);
    if(data.hasOwnProperty("data")){
        data = data.data.shortcode_media.edge_liked_by;
        totalComments = data.count;
        if(data.page_info.end_cursor != (null)) endCursor = data.page_info.end_cursor;

        commenters.push(data.edges);
        i=length;
        console.log("Getting Users",i);
        while (i<totalComments){
            var data = await makeReq(`https://www.instagram.com/graphql/query/?query_hash=1cb6ec562846122743b61e492c85999f&variables={"shortcode":"${mediaId}","first":${length},"after":"${endCursor}"}`);
            data = JSON.parse(data);
            if(data.hasOwnProperty("data")){
                data = data.data.shortcode_media.edge_liked_by;
                if(data.page_info.end_cursor != (null)) endCursor = data.page_info.end_cursor;
                commenters.push(data.edges);
                fs.writeFileSync(`./json/likers.json`, JSON.stringify(commenters, undefined, 2));
                i += length;
                console.log("Getting Users",i);
            }
        }
        return commenters;
    }
};

const getFollowers = async (user, id, length) => {
    await login(user);
    var followers = [];
    var data = await makeReq(`https://www.instagram.com/graphql/query/?query_hash=37479f2b8209594dde7facb0d904896a&variables={"id":"${id}","first":${length}}`, "GET", undefined, true);
    data = JSON.parse(data);
    if(data.hasOwnProperty("data")){
        data = data.data.user.edge_followed_by;
        totalComments = data.count;
        if(data.page_info.end_cursor != (null)) endCursor = data.page_info.end_cursor;

        followers.push(data.edges);
        fs.writeFileSync(`./json/followers.json`, JSON.stringify(followers, undefined, 2));
        i=length;
        console.log("Getting Users",i);
        while (i<totalComments){
            var data = await makeReq(`https://www.instagram.com/graphql/query/?query_hash=37479f2b8209594dde7facb0d904896a&variables={"id":"${id}","first":${length},"after":"${endCursor}"}`, "GET", undefined, true);
            data = JSON.parse(data);
            if(data.hasOwnProperty("data")){
                data = data.data.user.edge_followed_by;
                if(data.page_info.end_cursor != (null)) endCursor = data.page_info.end_cursor;
                followers.push(data.edges);
                fs.writeFileSync(`./json/followers.json`, JSON.stringify(followers, undefined, 2));
                i += length;
                console.log("Getting Users",i);
            }
        }
        return followers;
    }
}

const changeIp = async () => {
    var ipAddress = await request('https://ipv4.icanhazip.com/', (err, res, body) => body);
    await shell.exec('rasdial "Idea Dongal" /disconnect');
    await shell.exec('rasdial "Idea Dongal"');
    // await setTimeout(3000);
    return new Promise((resolve, reject) => {
        request('https://ipv4.icanhazip.com/', (err, res, body) => {
            if(ipAddress == body){
                reject("Error while changing IP");
            }else{
                resolve(body);
            }
        });
    });
};

module.exports = {
    login,
    mentioner,
    getCommenters,
    changeIp,
    getLikers,
    getFollowers,
    register,
    login_Mention
};