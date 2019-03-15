var express = require('express');
var router = express.Router();
const puppeteer = require('puppeteer');

/* GET home page. */
router.get('/', function (req, res, next) {
  (async () => {

    const startDate = new Date();

    const browser = await puppeteer.launch()
    let page = await browser.newPage()

    // 一覧画面の処理
    const URL = "https://www.pet-home.jp/chiba/boy/"
    await page.goto(URL, { waitUntil: 'domcontentloaded' })
    const urllist = await page.evaluate(function () {
      // SELECTOR_URLLIST
      const nodelist = document.querySelectorAll("li.contribute_result > div.inner")
      let retlist = []
      if (nodelist.length > 0) {
        nodelist.forEach(function (node) {
          // SELECTOR_URL
          retlist.push(node.querySelector("h3.title > a").href)
        })
      }
      return retlist
    })

    // 個別ページの取得
    let child_content_list = []
    // for (let i = 0; i < 4; i++) {
    for (let i = 0; i < urllist.length; i++) {
      await page.goto(urllist[i], { waitUntil: 'domcontentloaded' })
      let child_content = await page.evaluate(() => {
        return {
          title: document.querySelector("h3.main_title").textContent, //SELECTOR_TITLE
          date: document.querySelectorAll("ul.bookmark_view_date_wrap > li.date")[0].textContent, //SELECTOR_KEISAIBI
          datelimit: document.querySelectorAll("ul.id_data_wrap > li.limit")[0].innerText, //SELECTOR_KEISAIKIGENBI
          boshuNo: document.querySelectorAll("ul.id_data_wrap > li.id")[0].innerText //SELECTOR_BOSHUNO
        }
      })
      child_content.url = urllist[i];
      if (urllist[i].indexOf("dogs") > -1) {
        child_content.shurui = "犬";
      } else if (urllist[i].indexOf("cats") > -1) {
        child_content.shurui = "猫";
      } else if (urllist[i].indexOf("small") > -1) {
        child_content.shurui = "小動物";
      } else if (urllist[i].indexOf("fishs") > -1) {
        child_content.shurui = "さかな";
      } else if (urllist[i].indexOf("birds") > -1) {
        child_content.shurui = "とり";
      } else if (urllist[i].indexOf("reptiles") > -1) {
        child_content.shurui = "は虫類・その他";
      }
      await child_content_list.push(child_content)
    }
    const endDate = new Date();
    await res.render('users', { objlist: child_content_list, procInterval: (endDate.getTime() - startDate.getTime())/1000 });
    await browser.close()
  })()
})

module.exports = router;

