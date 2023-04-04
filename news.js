const fs = require('fs');
const mongoose = require('mongoose');

const article = mongoose.Schema({

    category : String,
    journalist : String,
    headline : String,
    text : String,
    date : { type: Date, default: Date.now }

});

const Article = mongoose.model('article',article);

exports.writeNews = function(journalist,category,headline,text)
{
    let article =  
        {
        category : category,
        journalist : journalist,
        headline : headline,
        text : text,
        date : new Date()
        }

    let articleJson = JSON.stringify(article)+"\r\n";

    fs.appendFileSync('C:/Users/пратик/VscodeProjects/tncweb/data/news.txt',`${articleJson}`,'utf-8');


}

exports.writeNewsMongo = async function(category,journalist,headline,text)
{
    let newArticle = new Article({ 
                                    category : `${category}`,
                                    journalist : `${journalist}`, 
                                    headline : `${headline}`,
                                    text : `${text}`
                                });
    await newArticle.save();
}

exports.readNews = function(category)
{
    if(!category)
    {
        let newsListBody =  fs.readFileSync('C:/Users/пратик/VscodeProjects/tncweb/data/news.txt','utf-8');
        let lines = newsListBody.split("\r\n"); // array of string with numeric values

        let newsList = new Array();
        let errIndex = lines.length-1; // number


        for(let line in lines )
        {
            let erIndex = lines.length-1;
            if(!(line == errIndex))
            {
                newsList.push(JSON.parse(lines[line]));
            }
        }

        return newsList;

    }
}

