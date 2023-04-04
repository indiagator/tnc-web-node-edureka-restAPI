
const fs = require('fs');
const mongoose  = require('mongoose');
//const path = require('path');
//const url = require('url');
//const mongomodel = require('./models/credential.js')

const credential = mongoose.Schema({
    usertype : String,
    username : String,
    password : String
});

const Credential = mongoose.model('credential',credential);


const credentials = fs.readFileSync('C:/Users/пратик/VscodeProjects/tncweb/data/credentials.txt','utf-8');

exports.authenticate = function (username,password)
{

    let lines = credentials.split("\r\n");

    for( let line in lines)
    {
        //console.log(lines[line] + "\n");
        let credentialValues = lines[line].split(",");

        if( credentialValues[2] === username )
        {
            console.log(username);
            console.log(credentialValues[3]);

            let filePassword = credentialValues[3];

            if( filePassword === password)
            {
                return true;
            }
            
        }
        
        
    }   

    return false;

}

exports.authenticateMongo = async function (username,password)
{

    let credential = await Credential.findOne({username : `${username}`},['password']).exec();
    
    if(credential.password === password )
    {
        return true;
    }
    else
    { 
        return false;
    }

}

exports.authorize = function(username)
{
    let lines = credentials.split("\r\n");

    for( let line in lines)
    {
        //console.log(lines[line] + "\n");
        let credentialValues = lines[line].split(",");

        if( credentialValues[2] === username )
        {
            console.log(username);
            //console.log(credentialValues[3]);

            let usertype = credentialValues[1];

            if( usertype === 'journalist')
            {
                return true;
            }
            else
            {
                return false;
            }
            
        }
        
        
    }   

}

exports.signupMongo = async function(usertype,username,password)
                        {
                            const newUser = new Credential({ 
                                                                usertype : `${usertype}`,
                                                                username : `${username}`, 
                                                                password : `${password}`
                                                        });

                            await newUser.save();                        

                        }

