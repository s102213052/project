var express = require('express');  
var app = express();   
var cookieParser = require('cookie-parser')
//var session = require('express-session')
var fs = require('fs');
var bodyParser=require('body-parser');
var multer = require('multer'); // v1.0.5
var upload = multer(); // for parsing multipart/form-data
var authors = '';
var PostObj='';
var PostObj2='';
Date.prototype.toIsoString = function() {
    var tzo = -this.getTimezoneOffset(),
        dif = tzo >= 0 ? '+' : '-',
        pad = function(num) {
            var norm = Math.abs(Math.floor(num));
            return (norm < 10 ? '0' : '') + norm;
        };
    return this.getFullYear() +
        '-' + pad(this.getMonth() + 1) +
        '-' + pad(this.getDate()) +
        'T' + pad(this.getHours()) +
        ':' + pad(this.getMinutes()) +
        ':' + pad(this.getSeconds()) +
        dif + pad(tzo / 60) +
        ':' + pad(tzo % 60);
}

var date = new Date();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());


fs.readFile('Author.js', function(err,data){// read author file
    if(err) throw err;
        authors=JSON.parse(data); 
});
fs.readFile('Post.js', function(err,data){//read Posts file
    if(err) throw err;
        PostObj=JSON.parse(data); 
});
fs.readFile('Post.js', function(err,data){//read Posts file
if(err) throw err;
    PostObj2=JSON.parse(data); 
}); 
app.post('/login', upload.array(), function (req, res, next) {
    if (req.body.username == "test1" && req.body.password == "test123"){
        var user = req.body.username;
        res.cookie('username',user);
        res.cookie('login','ok');
    for(var i=0; i<authors.length; i++){
        if(req.body.username == authors[i].username)
            res.status(200).json(authors[i]);
        }
    }
    else
        res.json({message:"帳密錯誤"});
});
app.get('/',function(req,res){
    res.status(200).json(PostObj);
});
app.get('/author', function(req, res){
        res.status(200).json(authors);
});

app.get('/author/:id', function(req, res){
    var user = req.params.id;
    for(var i=0; i<authors.length; i++){
        if(user == authors[i].username)
            res.status(200).json(authors[i]);
        //else
            //res.status(404).json({error:"查無此人"});
    }
});

app.patch('/author/:id', upload.array(), function (req, res, next) {
    var user = req.params.id;
    if(req.cookies.login == 'ok'){
        for(var i=0; i<authors.length; i++){
            if(user == authors[i].username){
                authors[i].name=req.body.name;
                authors[i].gender=req.body.gender;
                authors[i].address=req.body.address;
                res.status(200).json(authors[i])
                fs.writeFile('Author.js', JSON.stringify(authors, null, 4) , 'utf-8', function(err) {
                    if (err) {
                        return console.error(err);
                    }
                })
            }
        }
    }
    else
        res.status(200).json('please login')
});

app.get('/posts', function(req, res){
    res.status(200).json(PostObj);
});

app.get('/posts/:id', function(req, res){
    var id = req.params.id;
    for(var i=0; i<PostObj.length; i++){
        if(id == PostObj[i].id){
            res.status(200).json(PostObj[i]);
        }
    }
});
app.patch('/posts/:id', upload.array(), function (req, res, next) {//修改文章
    var postId = req.params.id;
    if(req.cookies.login == 'ok'){
        for(var i=0; i<PostObj.length; i++){
            if(postId == PostObj[i].id){
                PostObj[i].title = req.body.title;
                PostObj[i].content = req.body.content;
                PostObj[i].updated_at = date.toIsoString();
                PostObj[i].tags = req.body.tags;
                res.status(200).json(PostObj[i]);
                fs.writeFile('Post.js', JSON.stringify(PostObj, null, 4) , 'utf-8', function(err) {
                    if (err) {
                        return console.error(err);
                    }
                });
            }
        }
    }
    else
        res.status(200).json('please login');
});
app.post('/posts', upload.array(), function (req, res, next) {//新增文章
    var i = PostObj.length-1;
    i = PostObj[i].id ;
    j = PostObj.length;
    if(req.cookies.login == 'ok'){
        PostObj2[0].id = i + 1;
        PostObj2[0].title = req.body.title;
        PostObj2[0].content = req.body.content;
        PostObj2[0].created_at = date.toIsoString();
        PostObj2[0].updated_at = date.toIsoString();
        PostObj2[0].tags = req.body.tags;
        PostObj.push(PostObj2[0]);
        fs.writeFile('Post.js', JSON.stringify(PostObj, null, 4) , 'utf-8', function(err) {
            if (err) {
                return console.error(err);
            }
        res.status(201).json(PostObj[j]);
        });
    }
    else
        res.status(200).json('please login')
});
app.delete('/posts/:id', upload.array(), function (req, res, next) {//刪除文章
    var postId = req.params.id;
    if(req.cookies.login == 'ok'){    
        for(var i=1; i<PostObj.length; i++){
            if(postId == PostObj[i].id){
            PostObj.splice(i, 1);
            console.log(PostObj);
            }
        }
        fs.writeFile('Post.js', JSON.stringify(PostObj, null, 4) , 'utf-8', function(err) {
            if (err) {
                return console.error(err);
            }
        res.status(200).json(PostObj)
        });  
    }
    else
        res.status(200).json('please login')
});
app.listen(3000,function(){
    console.log('Listening on port 3000');
});