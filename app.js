
let express = require('express');
const mongoose = require('mongoose');
let app = express();

// For POST-Support
let bodyParser = require('body-parser');
let multer = require('multer');
let upload = multer();

const auth = require('./auth.js');
const news = require('./news.js');
const Credential = require('./models/credential.js')

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect('mongodb://127.0.0.1:27017/test'); // establishment of the connection

app.get('/', (req,res) => {res.send("Hello TNC WEB")});

app.get('/api/1.1/auth',upload.array(), (req,res) =>   
                                        {
                                            if(auth.authenticate(req.body.username,req.body.password))
                                            {
                                                res.send({message:"welcome"});
                                            }
                                            else{
                                                res.send({message:"incorrect credentials"})
                                            }
                                        } );

app.get('/api/1.1/authmongo',upload.array(), async (req,res) =>   
                                        {                                            
                                            if(await auth.authenticateMongo(req.body.username,req.body.password))
                                            {
                                                res.send({'message' : `welcome ${req.body.username}`});
                                            }
                                            else
                                            {
                                                res.send({'message' : 'Invalid Credentials'});
                                            }
                                        } );

app.post('/api/1.1/signup',upload.array(), (req,res) =>   
                                        {
                                            //if(auth.authenticate(req.body.usertype,req.body.username,req.body.password))
                                           // {
                                            setTimeout(() => auth.signupMongo(req.body.usertype,req.body.username,req.body.password),10);  //auth.signupMongo(req.body.usertype,req.body.username,req.body.password);
                                            res.send({message:"new signup successful"});
                                            //mongo.connection.close();
                                           // }
                                           // else{
                                            //    res.send({message:"incorrect credentials"})
                                            //}
                                        } );

app.post('/api/1.1/write/news',upload.array(), (req,res) =>   
                                        {
                                            if(auth.authenticate(req.body.username,req.body.password))
                                            {
                                                if(auth.authorize(req.body.username))
                                                {
                                                    news.writeNews(req.body.username,req.body.category,req.body.headline,req.body.text);
                                                    res.send({message:"News Article Saved!"})  

                                                }
                                                else{
                                                    res.send({message:"you are not authorized to write news"})
                                                }
                                                                                            
                                            }
                                            else{
                                                res.send({message:"incorrect credentials"})
                                            }
                                        } );
app.post('/api/1.1/write/news/mongo',upload.array(), async (req,res) =>   {


                            await news.writeNewsMongo(req.body.category,req.body.username,req.body.headline,req.body.text);

});

app.get('/api/1.1/read/news',upload.array(), (req,res) =>   
                                        {
                                            if(auth.authenticate(req.body.username,req.body.password))
                                            {
                                                //if(auth.authorize(req.body.username))
                                               // {
                                                    
                                                    res.send(news.readNews())  

                                               // }
                                                //else{
                                                    //res.send({message:"you are not authorized to write news"})
                                                //}
                                                                                            
                                            }
                                            else{
                                                res.send({message:"incorrect credentials"})
                                            }
                                        } );
                                        

app.post('/api/1.1/sayHello', upload.array(), (request, response) => {
    let a = request.body.a;
    let b = request.body.b;


    let c = parseInt(a) + parseInt(b);
    response.send('Result : '+c);
    console.log('Result : '+c);
});

app.get('/api/1.1/tag/:tagId', (req,res) => { res.send(req.params.tagId); console.log(req.params)})

app.post('/api/1.1/query', (req,res) => { res.send(req.query.prop1); console.log(req.query)})


app.listen(3000,() => console.log("listetning..."));
