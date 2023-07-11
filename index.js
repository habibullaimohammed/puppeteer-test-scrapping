const express = require('express');
const fs = require('fs');
const puppeteer = require('puppeteer');
const cors = require('cors');

const app = express();
const port =  process.env.PORT || 3000;

app.use(cors()); // Enable CORS for all routes

const TIMEOUT = 30000; // Set the timeout value (in milliseconds) as per your requirements
const MAX_RETRIES = 3; // Set the maximum number of retries

const categories = [
    { name: 'authoring', url: 'https://igetintopc.com/category/authoring/' }, // Example Category 1
    // { name: '2d-designing', url: 'https://igetintopc.com/category/2d-designing/' }, // Example Category 2
    // { name: 'business-2-software', url: 'https://igetintopc.com/category/business-2-software/' }, // Example Category 3
    // Add more categories as needed
];

async function scrapeData(url) {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    await page.setDefaultTimeout(TIMEOUT); // Set the timeout for each page

    let retries = 0;
    let data = [];

    while (retries < MAX_RETRIES) {
        try {
            await page.goto(url); // Pass the URL of the page or category to scrape

            while (true) {
                const posts = await page.$$('.posts .post');

                for (const post of posts) {
                    const title = await post.$eval('h2.title a', (element) => element.innerText);
                    const description = await post.$eval('.post-content', (element) => element.innerText);
                    const imgUrl = await post.$eval('img.wp-post-image', (element) => element.src);
                    const postDate = await post.$eval('.post-date span.ext', (element) => element.innerText);

                    data.push({ title, description, imgUrl, postDate });
                }

                const nextButton = await page.$('.page-navi .next');

                if (nextButton) {
                    await Promise.all([
                        page.waitForNavigation({ timeout: TIMEOUT }),
                        nextButton.click(),
                    ]);
                } else {
                    break;
                }
            }

            break; // Break out of the retry loop if scraping is successful
        } catch (error) {
            console.error(`An error occurred: ${error}`);
            retries++;
        }
    }

    await browser.close();

    return data;
}

async function scrapeMultiplePages(categories) {
    let allData = [];

    for (const category of categories) {
        const data = await scrapeData(category.url);
        allData = allData.concat(data);

        const json = JSON.stringify(data, null, 2);
        fs.writeFile(`${category.name}_scraped_data.json`, json, (error) => {
            if (error) {
                console.error(`Error writing ${category.name} JSON file:`, error);
            } else {
                console.log(`Scraped data for ${category.name} saved to ${category.name}_scraped_data.json`);
            }
        });
    }

    return allData;
}

app.get('/scrapedata', (req, res) => {
    scrapeMultiplePages(categories)
        .then((data) => {
            const json = JSON.stringify(data, null, 2);
            res.setHeader('Content-Type', 'application/json');
            res.send(json);
        })
        .catch((error) => {
            console.error(error);
            res.status(500).send('An error occurred during scraping');
        });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
