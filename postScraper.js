const puppeteer = require('puppeteer');
const fs = require('fs');

const INPUT_FILE = 'scraped_data_scrapped.json';
const OUTPUT_FILE = 'extracted_data.json';

async function fullPostScraper() {
    const browser = await puppeteer.launch({ headless: false, timeout: 120000 });
    const page = await browser.newPage();
    const extractedData = {};

    async function processPost(url) {
        await page.goto(url);

        const title = await page.title();

        // Extract the desired part of the HTML using the "post" class selector
        const extractedHtml = await page.evaluate(() => {
            const element = document.querySelector('.post');
            if (element) {
                // Remove the div with the class "crp_related"
                const relatedDiv = element.querySelector('.crp_related');
                if (relatedDiv) {
                    relatedDiv.remove();
                }

                // Remove the div with the class "post-tags"
                const tagsDiv = element.querySelector('.post-tags');
                if (tagsDiv) {
                    tagsDiv.remove();
                }

                // Remove all script tags
                const scripts = element.querySelectorAll('script');
                scripts.forEach((script) => script.remove());

                // Remove all <a> tags and specified phrases
                const allATags = element.querySelectorAll('a');
                allATags.forEach((aTag) => aTag.remove());

                // Remove all style attributes
                const allElementsWithStyle = element.querySelectorAll('[style]');
                allElementsWithStyle.forEach((el) => el.removeAttribute('style'));

                const content = element.innerHTML;
                const cleanedContent = content
                    .replace(/You can also download/g, '')
                    .replace(/If you are having trouble, please get help from our/g, '');

                return cleanedContent;
            }
            return '';
        });

        // Remove newline characters from the extracted HTML
        const cleanedHtml = extractedHtml.replace(/\n/g, '');

        return { title, html: cleanedHtml };
    }

    async function processScrapedData() {
        try {
            const scrapedData = JSON.parse(fs.readFileSync(INPUT_FILE, 'utf-8'));
            for (const category in scrapedData) {
                const posts = scrapedData[category];
                for (const post of posts) {
                    const { title, titleHref } = post;
                    if (title && titleHref) {
                        const data = await processPost(titleHref);
                        extractedData[title] = data;
                        console.log(`HTML extracted for '${title}'`);
                    }
                }
            }

            // Save the extracted data to a JSON file with single quotes for values
            const jsonString = JSON.stringify(extractedData, (key, value) => {
                // Replace double quotes with single quotes for values
                if (typeof value === 'string') {
                    return value.replace(/"/g, "'");
                }
                return value;
            }, 2);
            fs.writeFileSync(OUTPUT_FILE, jsonString);
            console.log('Extracted data saved to', OUTPUT_FILE);
        } catch (error) {
            console.error('Error occurred while processing scraped data:', error);
        } finally {
            await browser.close();
        }
    }

    await processScrapedData();
}

// Call the function to initiate the extraction process
fullPostScraper();
module.exports = fullPostScraper;
