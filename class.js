const puppeteer = require("puppeteer");
(async () => {
    const browser = await puppeteer.launch({headless: "new"});
    const page = await browser.newPage();
    await page.goto('https://igetintopc.com/page/903/',{
        waitUntil: "load"
    });

    const is_disabled = !await page.$("div.page-navi.pagination.numbers.clear-block > a.next") !== null;

    console.log(is_disabled);

    await browser.close();
})();