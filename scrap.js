const puppeteer = require("puppeteer");

(async () => {
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: false,
    });

    const page = await browser.newPage();
    await page.goto("https://igetintopc.com/category/2d-designing/");

    const productsHandles = await page.$$("#primary-content > div > div.posts.clear-block > .type-post");

    let items = [];
    let title = '';
    let postDate = '';
    let description = '';
    let imgUrl = '';
    let counter = 0;

    let isNextBtnExist = true;

        for (const productsHandle of productsHandles) {
            try {
                title = await page.evaluate(el => el.querySelector("div > h2 > a").textContent, productsHandle);
                // console.log(title);
            } catch (e) {
            }
            try {
                postDate = await page.evaluate(el => el.querySelector(".post-date > .ext").textContent, productsHandle);
                // console.log(postDate);
            } catch (e) {
            }
            try {
                description = await page.evaluate(el => el.querySelector("div.post-content.clear-block").textContent, productsHandle);
                // console.log(description);
            } catch (e) {
            }
            try {
                imgUrl = await page.evaluate(el => el.querySelector(".wp-post-image").getAttribute("src"), productsHandle);
                // console.log(imgUrl);
            } catch (e) {
            }

            items.push({imgUrl, title, postDate, description});
        }
    console.log(items);
    console.log(items.length);

})();