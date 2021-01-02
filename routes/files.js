const express = require("express");
const router = express.Router();
const fs = require("fs");
const iconv = require("iconv-lite");

const downloadfilepath = "C:\\Users\\tomoyay\\Downloads";

/* GET home page. */
router.get("/", function (req, res, next) {
  // ダウンロードディレクトリにあるcsvファイルを取得する
  let targetfilename = "";
  fs.readdirSync(downloadfilepath).forEach((filename) => {
    // *mdl.csvのファイルの場合処理をする
    if (filename.slice(-7) === "mdl.csv") {
      targetfilename = filename;
      const src = fs
        .createReadStream(downloadfilepath + "\\" + filename)
        .pipe(iconv.decodeStream("Shift_JIS"));
      src.on("data", (chunk) => {
        let updatelog = "";
        const lines = chunk.split("\n");
        lines.forEach((line) => {
          let linecontents = line.split(",");

          // 00:利用者
          // 01:ふりがな
          // 02:生年月日
          // 03:性別
          // 04:郵便番号
          // 05:住所
          // 06:電話番号
          // 07:お知らせメール
          // 08:E-mail(1)
          // 09:E-mail(2)
          // 10:利用者区分
          // 11:ＶＩＰ区分
          // 12:施設管理番号
          // 13:有効期限
          // 14:備考
          // 15:登録日
          // 16:更新日

          // ファイルの各項目を連結させて、比較用文字列を作成
          const filevalue =
            linecontents[12] + ','
            "kubun" + ','
            "kubun2" + ','
            linecontents[0] + ','
            linecontents[1] + ','
            linecontents[3] + ','
            linecontents[4] + ','
            linecontents[5] + ','
            linecontents[6] + ','
            linecontents[8] + ','
            linecontents[9] + ','
            linecontents[10] + ','
            linecontents[11] + ','
            linecontents[14] + ','
            linecontents[15] + ','
            linecontents[16];

          // 施設管理番号で検索し、比較用文字列を作成
          // select文
          //
          // const dbvalue = riyousha.selectForHikaku(linecontents[12]);
          const dbvalue = "";

          // ◆比較
          // 不一致の場合
          if (filevalue !== dbvalue) {
            // 更新用オブジェクトの作成
            let inobj = {};
            inobj.id = linecontents[12];
            inobj.kubun = "";
            inobj.kubun2 = "";
            inobj.name = linecontents[0];
            inobj.kana = linecontents[1];
            inobj.sex = linecontents[3];
            inobj.no_yubin = linecontents[4];
            inobj.address = linecontents[5];
            inobj.no_tel = linecontents[6];
            inobj.mail1 = linecontents[8];
            inobj.mail2 = linecontents[9];
            inobj.kubun_riyousha = linecontents[10];
            inobj.kubun_vip = linecontents[11];
            inobj.bikou = linecontents[14];
            inobj.ymd_add = linecontents[15];
            inobj.ymd_upd = linecontents[16];

            // update文
            // riyousha.update(inobj, (err, retObj) => {
            //   if (err) {
            //     next(err);
            //   }
            //   if (retObj.changedRows === 0) {
            //   } else {
            //     // 更新に成功した場合はその内容をストック
            updatelog += filevalue + "\n";
            //   }
            // });
          }
        });

        src.on("end", () => {
          // 更新した内容をメールで送信する
          const a = "aaa";
          // mail.send("会議室利用者登録・更新情報", updatelog);
          // 対象ファイルを処理した場合は対象ファイルをリネーム
          fs.rename(
            downloadfilepath + "\\" + targetfilename,
            downloadfilepath + "\\" + targetfilename + ".old",
            (err) => {
              if (err) {
                throw err;
                console.log(`${targetfilename} is deleted`);
              }
            }
          );
        });
        
      });
    }
  });
});

module.exports = router;
