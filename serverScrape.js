const puppeteer = require('puppeteer');
const fs = require('fs');

async function serverScrape() {
    const BASE_URL = 'https://igetintopc.com/category/2d-designing/';
    const OUTPUT_FILE = 'scraped_data_scrapped.json';

    const browser = await puppeteer.launch({ headless: false, timeout: 120000 });
    const page = await browser.newPage();
    const scrapedData = {};

    async function scrapePage(url, category) {
        await page.goto(url);
        const data = await page.evaluate(category => {
            const posts = Array.from(document.querySelectorAll('.post'));
            return posts.map(post => {
                const titleArchiveCategoryElement = post.querySelector('.archive-category');
                const titleElement = post.querySelector('.title a');
                const dateElement = post.querySelector('.post-date span.ext');
                const descriptionElement = post.querySelector('.post-content');
                const imageElement = post.querySelector('.post-thumb img');

                return {
                    titleArchiveCategory: titleArchiveCategoryElement ? titleArchiveCategoryElement.textContent : '',
                    title: titleElement ? titleElement.textContent : '',
                    titleHref: titleElement ? titleElement.href : '',
                    category: category,
                    date: dateElement ? dateElement.textContent : '',
                    description: descriptionElement ? descriptionElement.textContent : '',
                    imageUrl: imageElement ? imageElement.src : '',
                    imageAlt: imageElement ? imageElement.alt : '',
                };
            });
        }, category);

        if (!scrapedData[category]) {
            scrapedData[category] = [];
        }
        scrapedData[category].push(...data);

        const nextButton = await page.$('.next');
        if (nextButton) {
            const nextPageUrl = await page.evaluate(btn => btn.href, nextButton);
            await scrapePage(nextPageUrl, category);
        }
    }

    async function scrapeAllCategories() {
        const categories = [
            '2D Designing',
            '3D Animation',
            // Add all other categories here...
        ];

        for (const category of categories) {
            const url = `https://igetintopc.com/category/${category.toLowerCase().replace(/\s+/g, '-')}/`;
            await scrapePage(url, category);
        }
    }

    try {
        await scrapeAllCategories();

        // Save the data to a JSON file
        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(scrapedData, null, 2));
        console.log('Data scraped successfully and saved to', OUTPUT_FILE);
    } catch (error) {
        console.error('Error occurred while scraping:', error);
    } finally {
        await browser.close();
    }
}

// Call the function to initiate the scraping process
serverScrape();

