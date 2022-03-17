const puppeteer = require('puppeteer');

async function scrapeShow(url){
    // launch browser and navigate to link
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);

    // get the title
    const [showTitle] = await page.$x('//*[@id="__next"]/main/div/section[1]/section/div[3]/section/section/div[1]/div[1]/h1');
    const title = await showTitle.getProperty('textContent');
    const titleText = await title.jsonValue();

    // get the type
    const [showType] = await page.$x('//*[@id="__next"]/main/div/section[1]/section/div[3]/section/section/div[1]/div[1]/div/ul/li[1]');
    if(showType != null){
        const type = await showType.getProperty('textContent');
        var typeText = await type.jsonValue();
    }else{
        typeText = "Movie".jsonValue();
    }

    // get the total number of episodes
    const [episodeLenght] = await page.$x('//*[@id="__next"]/main/div/section[1]/div/section/div/div[1]/section[2]/div[1]/a/h3/span');
    const length = await episodeLenght.getProperty('textContent');
    const episodeLengthText = await length.jsonValue();

    // get the link to the episode list
    const[episodeLink] = await page.$x('//*[@id="__next"]/main/div/section[1]/div/section/div/div[1]/section[2]/div[1]/a');
    const episode = await episodeLink.getProperty('href');
    const linkText = await episode.jsonValue();

    // go to the episode list
    await page.goto(linkText);

    // get the number of seasons from dropdown
    const [seasonDropdown] = await page.$x('//*[@id="bySeason"]');
    const seasonLength = await seasonDropdown.$$('option');
    const seasonLengthText = await (seasonLength.length).toString();

    console.log({
        titleText,
        typeText,
        seasonLengthText, 
        episodeLengthText
    });

    for(let i = 0; i < seasonLength.length; i++){

        // get the link to the first season
        const currentUrl = await page.url();
        const forwardSlash = currentUrl.indexOf("/", 27);
        const clearURL = currentUrl.slice(0, (forwardSlash + 1));
        const currentSeason = clearURL + `episodes?season=${i+1}`;
    
        // go to the first season
        await page.goto(currentSeason);
    
        // get the current season number
        const [seasonNumber] = await page.$x('//*[@id="episode_top"]');
        const number = await seasonNumber.getProperty('textContent');
        const currentSeasonText = await number.jsonValue();
        
        // get all the episodes and their names
        const [episodeList] = await page.$x('//*[@id="episodes_content"]/div[2]/div[2]');
        const episodes = await episodeList.$$('.list_item');
        const episodesArray = [];
        for (let i = 0; i < episodes.length; i++) {
            const [episodeName] = await episodes[i].$$('a[itemprop="name"]');
            const name = await episodeName.getProperty('textContent');
            const nameText = await name.jsonValue();
            episodesArray.push(nameText);
        }
        console.log({currentSeasonText, episodesArray});
    }

    await browser.close();
}

scrapeShow(''); // <-- imdb show link goes here