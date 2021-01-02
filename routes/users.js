var express = require("express");
var router = express.Router();
const puppeteer = require("puppeteer");

/* GET home page. */
router.get("/", function (req, res, next) {
  (async () => {
    const startDate = new Date();

    const browser = await puppeteer.launch({ headless: false });

    let page = await browser.newPage();

    const URL = "https://www.yamori-yoyaku.jp/studio/OfficeLogin.htm";
    await page.goto(URL, { waitUntil: "domcontentloaded" });

    // ログイン
    await page.type('input[name="in_office"]', "4000143");
    await page.type('input[name="in_opassword"]', "PS10001SP");
    await page.click(
      "body > table > tbody > tr > td > table > tbody > tr:nth-child(1) > td > form > table:nth-child(2) > tbody > tr > td:nth-child(2) > input"
    );

    await page.waitFor(1000);
    // await page.waitForNavigation({waitUntil: 'domcontentloaded'});

    // 管理画面から「管理者メニュー」をクリック
    const menu = await page.$(
      "body > table > tbody > tr > td > table > tbody > tr > td > table:nth-child(2) > tbody > tr:nth-child(3) > td:nth-child(2) > input[type=image]:nth-child(6)"
    );
    await menu.click();

    await page.waitFor(2000);

    // 新しく開いたページを取得
    let newPage = await getNewPage(page);

    // パスワードの設定
    await newPage.type('input[name="in_managerpassword"]', "PS10001SP");
    const inputElement = await newPage.$("input[type=submit]");
    await inputElement.click();

    await newPage.waitFor(2000);

    // 「ダウンロード」のクリック
    await newPage.click(
      "body > div:nth-child(3) > table > tbody > tr > th:nth-child(6) > img"
    );

    await newPage.waitFor(2000);

    // 「登録車情報ダウンロード」のクリック
    await newPage.click(
      "#inbody > div > div:nth-child(2) > div:nth-child(1) > div.waku_5 > img"
    );

    await newPage.waitFor(2000);

    // 新しく開いたページを取得
    let newPageTouroku = await getNewPage(newPage);

    // Promptが出たら必ずOKとする
    newPageTouroku.on('dialog', async dialog => {
      await dialog.accept();
    });

    //
    await newPageTouroku.select('select[name="start_y"]', '2020');
    await newPageTouroku.select('select[name="start_m"]', '12');
    await newPageTouroku.select('select[name="end_y"]', '2020');
    await newPageTouroku.select('select[name="end_m"]', '12');

    // 「項目名-全選択」をクリックする
    await newPageTouroku.click(
      "#inbody > form > table > tbody > tr:nth-child(2) > td.reserve_screen > a:nth-child(2)"
    );
    // 「登録者データ」をクリックする
    await newPageTouroku.click("#inbody > form > p > input.btn_150-30");

    await newPage.waitFor(2000);

    // 新しく開いたページを取得
    let newPageResult = await getNewPage(newPageTouroku);

    const a_tag = await newPageResult.$('a');
    if (a_tag) {
      console.log('ダウンロードデータあり')
      await a_tag.click();
      await page.waitFor(10000);
    } else {
      console.log('ダウンロードデータなし')
    }

    res.render("users", { title: "AAAAA" });

    /**
     * 新しく開いたページを取得
     * @param {page} page もともと開いていたページ
     * @returns {page} 別タブで開いたページ
     */
    async function getNewPage(page) {
      const pageTarget = await page.target();
      const newTarget = await browser.waitForTarget(
        (target) => target.opener() === pageTarget
      );
      const newPage = await newTarget.page();
      await newPage.waitForSelector("body");
      return newPage;
    }

    await browser.close()

  })();
});

module.exports = router;
