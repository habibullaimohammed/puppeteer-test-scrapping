const scrapeWebsite = require("./scrapeWebsite");
const postScraper = require("./postScraper");

// Function to execute after the scraping is done
async function app() {
    try {
        // Run the scrapeWebsite function
        await scrapeWebsite();

        // Run the postScraper function after the scraping is done
        await postScraper();

        // Both functions have completed at this point
        console.log('All tasks completed.');
    } catch (error) {
        console.error('Error occurred:', error);
    }
}

// Call the main function to start the entire process
app();
