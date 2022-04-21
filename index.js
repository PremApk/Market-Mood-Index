const PORT = process.env.PORT || 4444;
const cheerio = require('cheerio');
const axios = require('axios');
const express = require('express');

const app = express();

//fetch HTML data from the given url using Axios
const fetchHTML = async url => {
    try{
        const { data } = await axios.get(url);
        return data;
    } catch {
        console.error (
            `Error Occurred while fetching the HTML data`
            );
        }
    };

//Web scrapper logic 
const scrapper = async (req, res) => {        
    const URL = 'https://www.tickertape.in/market-mood-index';
    const htmlData = await fetchHTML(URL);
    const selector = cheerio.load(htmlData);

    const searchResults = selector("body")
    .find("#__next > #app-container")
    .find("div[class='jsx-1831713767 mmi-root animation-container'] > div[class='jsx-1677963593 first-fold-root text-center']")
    .text().slice(62,67);
    
    //Computing Market Mood Index
    let comments = "";
    let MMI = parseFloat(searchResults);
    if(MMI <= 30.0)
        comments = `Extreme Fear (MMI current rate - ${MMI})! A good time to open fresh positions, as markets are likely to be oversold and might turn upwards`;

    else if(MMI > 30.0 && MMI <= 50.0)
        comments = `Fear! (MMI current rate - ${MMI}) It suggests that investors are fearful in the market, but the action to be taken depends on the MMI trajectory.If it is dropping from Greed to Fear, it means fear is increasing in the market & investors should wait till it reaches Extreme Fear, as that is when the market is expected to turn upwards. If MMI is coming from Extreme fear, it means fear is reducing in the market. If not best, might be a good time to open fresh positions.`;
    
    else if(MMI > 50.0 && MMI <= 70.0)
        comments = `Greed! (MMI current rate - ${MMI}) It suggests that investors are acting greedy in the market, but the action to be taken depends on the MMI trajectory. If MMI is coming Neutral towards Greed zone, it means greed is increasing in the market and investors should be cautious in opening new positions. If MMI is dropping from Extreme Greed, it means greed is reducing in the market. But more patience is suggested before looking for fresh opportunities.`;
    
    else
        comments = `Extreme Greed! (MMI current rate - ${MMI}) Investors should avoid opening fresh positions as markets are overbought and likely to turn downwards`;

    res.json(comments);
}

//Routes
app.get('/',(req, res) => res.json(`Hey there! Try /mmi to get current Market Mood Index`));

app.get('/mmi', scrapper);

//Listener
app.listen(PORT, ()=> console.log(
    `Server is running in port ${PORT}`
));
