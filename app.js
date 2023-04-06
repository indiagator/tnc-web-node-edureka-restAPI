
let express = require('express');
const mongoose = require('mongoose');
let app = express();

// For POST-Support
let bodyParser = require('body-parser');
let multer = require('multer');
let upload = multer();

const jwt = require('jsonwebtoken');

const auth = require('./auth.js');
const news = require('./news.js');
const Credential = require('./models/credential.js')

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const TOKEN_SECRET = 'b81f936c6cfdf27d5316ab577dd3ca0fd8421c4785876723b33c91a19d977de6e8fced8d7fcf668fe30481fa56b20b2f65898a2a1090037db91dd680d29c456b';


const authntokenize = async function(req,res,next) // middleware
{
    let username = req.body.username;
    let password = req.body.password;

    let authdata = await auth.authenticateMongo(username,password);

    let credential = '';
    if(authdata.auth)
    {
        credential = `${username} ${password} ${authdata.usertype}`;
    }

    let TOKEN = jwt.sign(credential,TOKEN_SECRET);

    req.TOKEN = TOKEN;    

    next();
}

const ana = function (req,res,next) // authenticate and authorize middleware
{

    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
  
    if (token == null) return res.sendStatus(401)
  
    jwt.verify(token, TOKEN_SECRET, (err, credential) => {
      console.log(err);
  
      if (err) return res.sendStatus(403);
  
      //req.CREDENTIAL = credential;

      req.username = credential.split(' ')[0];
      req.usertype = credential.split(' ')[2];

  
      next()
    })
}



mongoose.connect('mongodb://127.0.0.1:27017/test'); // establishment of the connection

app.get('/', (req,res) => {res.send("Hello TNC WEB")});

app.get('/api/1.1/authntokenize',upload.array(),authntokenize, (req,res) => { res.send({'TOKEN' : `${req.TOKEN}`})} );

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
                                            let authresult = await auth.authenticateMongo(req.body.username,req.body.password);  

                                            if(authresult.auth)
                                            {
                                                res.send({'message' : `welcome ${req.body.username} you have logged in as a ${authresult.usertype}`});
                                            }
                                            else
                                            {
                                                res.send({'message' : 'Invalid Credentials'});
                                            }

                                        } );

app.post('/api/1.1/signupmongo',upload.array(), (req,res) =>   
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
app.post('/api/1.1/write/news/mongo',upload.array(), async (req,res) =>   
                                                                {                                                               
                                    let authresult = await auth.authenticateMongo(req.body.username,req.body.password);  

                                    if(authresult.auth)
                                    {
                                        if(authresult.usertype === 'journalist')
                                        {
                                            await news.writeNewsMongo(req.body.category,req.body.username,req.body.headline,req.body.text);
                                            res.send({'message' : `hello ${req.body.username} you just wrote a new article!`});
                                        }
                                        else
                                        {
                                            res.send({'message' : `hello ${req.body.username} You are NOT a JOURNALIST!`});
                                        }                                       
                                        
                                    }
                                    else
                                    {
                                        res.send({'message' : 'Invalid Credentials'});
                                    }


                                    });

app.post('/api/1.1/write/news/mongo/auth',upload.array(),ana, async (req,res) =>   
                                                                {                                                               
                                    //let authresult = await auth.authenticateMongo(req.body.username,req.body.password);  

                                    //if(authresult.auth)
                                   // {
                                     //   if(authresult.usertype === 'journalist')
                                     //   {
                                      //      await news.writeNewsMongo(req.body.category,req.body.username,req.body.headline,req.body.text);
                                       //     res.send({'message' : `hello ${req.body.username} you just wrote a new article!`});
                                     //   }
                                     //   else
                                     //   {
                                      //      res.send({'message' : `hello ${req.body.username} You are NOT a JOURNALIST!`});
                                     //   }                                       
                                        
                                   // }
                                   // else
                                   // {
                                   //     res.send({'message' : 'Invalid Credentials'});
                                    //}

                                    if(req.usertype === 'journalist')
                                        {
                                            await news.writeNewsMongo(req.body.category,req.username,req.body.headline,req.body.text);
                                            res.send({'message' : `hello ${req.username} you just wrote a new article!`});
                                        }
                                        else
                                        {
                                            res.send({'message' : `hello ${req.username} You are NOT a JOURNALIST!`});
                                        }     


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

app.get('/api/1.1/read/news/mongo/cat',upload.array(), async (req,res) =>   
                                        {
                                            let authresult = await auth.authenticateMongo(req.body.username,req.body.password);  

                                    if(authresult.auth)
                                    {       
                                        let newsListMongo = await news.readNewsMongo(req.body.category) ;                                
                                        res.send(newsListMongo);                                        
                                    }
                                    else
                                    {
                                        res.send({'message' : 'Invalid Credentials'});
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


app.listen(8090,() => console.log("listetning..."));
