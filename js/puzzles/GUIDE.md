# 越南公主 — 謎題作者指南（內部文件）

遊戲：夜語工作室線上密室《越南公主》。越南公主甄妮（只講越南話＋中文翻譯）來台灣玩兩天，遇到兩個屁孩小羽（口頭禪「神人。」）、俊治（口頭禪「Bang!」「完全法克。」），還有乖學弟博育（導遊，慢慢被同化）。
1–4 人連線，難度 ★★★★☆，**謎題難度：困難～地獄，少數夢魘**。全部 108 題，每一章 11 題（序章 8、第九章 12）。

先讀：`/home/user/bang/js/engine.js`（P()、ctx、checkAns、splitFor）、`/home/user/bang/js/kit.js`（元件）、`/home/user/bang/js/story.js`（各章劇情台詞，**題目可以引用旅行日誌裡的台詞**）、`/home/user/bang/css/style.css`（.paper .note .big .mono 等樣式）。

## 檔案
每章一個檔案 `js/puzzles/chN.js`（classic script），只呼叫 `P({...})`。題目 id 用 `cN_xxx`。檔案內的題目順序＝遊戲裡的編號順序；**本章「劇情指定」的那一題放最後**，而且用 `need` 綁住本章其他 3–6 題（玩家要先解開它們）。

## P() 欄位
```js
P({
  id: 'c1_cabbage', ch: 1,            // 章節編號
  t: '翠玉白菜的蟲',                    // 標題（短）
  lv: 1,                              // 1 困難、2 地獄、3 夢魘
  icon: '🥬',                         // 場景上的圖示（一個 emoji）
  pos: [22, 40],                      // 在場景上的位置（% ，x 10–90、y 15–85，同章題目不要重疊，間距 ≥ 12%）
  need: ['c1_x'],                     // （可選）要先解開的題目
  body: (ctx) => `<p>…</p>`,          // 題目內容 HTML（或 build）
  build: (el, ctx, done) => { … },    // （可選）自訂互動：用 kit 的元件，結果交給 ctx.submit(value)
  ui: 'none',                         // （可選）用 build 自己送出時，隱藏預設的答案輸入框
  ans: ['3508'],                      // 可接受的答案（會先 norm：去空白標點、全形轉半形、轉大寫）
  check: (v, ctx) => bool,            // （可選）取代 ans 的自訂判斷
  solve: '3508',                      // 必填：一個一定正確的答案（自動測試用；用元件時是元件會送出的字串）
  show: '3508',                       // （可選）解開後顯示的答案文字
  split: ['<b>線索A</b>…', '…'],      // （可選）多人時把線索卡分給不同玩家（第 i 張給 seat i % 人數；單人全看得到）
  hint: '只給大方向、不能直接說答案的一句話（小天使博育說）',
  item: 'jade',                       // （只有劇情指定題）解開後獲得的道具
  ok: [['xy','神人。'],['zn','Hay quá!','太讚了！']],   // （可選）解開後的角色台詞泡泡
  num: true, ph: '四位數',            // （可選）輸入框提示
});
```
ctx：`{ G, seat, n（玩家人數）, me, ch（自己的角色 zn/xy/jz/by）, submit(v), solved(id) }`。

## kit 元件（K.xxx）
- `K.choice(el, ctx, [{t:'html', v:'值'}], {cols:2})` 選擇題
- `K.seq(el, ctx, [{t, v}], {len, sep:'-'})` 依序點選，送出 `v1-v2-v3`
- `K.grid(el, ctx, {r, c, rowClue, colClue, cell(i,j), start, lock(i,j)})` 開關方格，送出 0/1 字串（列優先）→ 可做數織（nonogram）、點燈
- `K.digits(el, ctx, {r, c, given:{'i,j':d}, cage(i,j)→{bg,label}, border(i,j)→style, max})` 數字格（數獨、殺手數獨），送出列優先數字字串
- `K.route(el, ctx, {w, h, nodes:{id:{x,y,label}}, edges:[[a,b]], start, bg})` 點相鄰節點走路線（捷運、地圖），送出 `id-id-id`
- `K.cyl(el, {faces:['字','字',…], r})` 可以拖曳旋轉的天燈（文字環繞），只是展示
- `K.tiles(['1m','5p','9s','E','C','F','P'])` 麻將牌圖（m萬 p筒 s條，E南S W北N 中C 發F 白P）；`K.tilePick(el, ctx, {multi:true})` 選牌，送出依序排序的 `1m,4m`
- `K.cards(['AS','10H','KD','JK'])` 撲克牌圖
- `K.aim(el, ctx, {targets:[{label,color,r,f:(t)=>({x,y}),good}], cross:(t)=>({x,y}), onHit(b,hits,tg)→'fail'|{done:true,token}|undefined, info, btn, balloon:true})` 射擊／夾娃娃類小遊戲（canvas 600×300，準星位置固定或移動）；成功時 submit(token)，失敗 submit('__miss__')（會被判答錯扣地圖，請在說明裡寫清楚）
- `K.words(el, ctx, {grid:['字串',…], accept(s, cells, found)→bool, onFound(found, ctx)})` 找字盤（點頭尾兩格）
- 也可以直接寫 SVG / HTML 互動，最後呼叫 `ctx.submit(...)`。

## 規則（很重要）
1. **答案一定要能從遊戲內的資訊推出來**（題目內容、旅行日誌台詞、甄妮的越南語小抄、之前題目的答案）。不能要求外部查資料；台灣／越南常識可以提，但題目裡要給足夠的資訊讓人推理。
2. 難度：困難＝需要 2～3 步推理；地獄＝4 步以上、有陷阱；夢魘＝多層解碼或大量推理（每 2 章大約 1 題夢魘）。不要出「看一眼就知道」的題目。
3. **玩法要多樣、不要重複**，而且不要用夜語工作室其他作品已經用過的類型：倒轉錄音、注音鍵盤、轉盤鎖、拼圖、水管旋轉、西蒙記憶、刮刮樂、找不同、蓮蓬頭點燈、迷宮、連連看、天秤、謊言者、座位推理、字謎填空、一筆畫、成語接龍。
   建議（可自創）：越南語解碼、捷運路線推理、發票對獎、悠遊卡交易紀錄、時刻表推理、數織、殺手數獨、算式密碼（神人+BANG）、麻將聽牌、撲克牌邏輯、籤詩藏頭、對聯、書法筆畫、鏡像時鐘、方位與座標、匯率計算、照片細節觀察（用 SVG 畫）、聊天紀錄推理、口頭禪統計（看旅行日誌）、夜市射氣球／套圈圈小遊戲、地圖座標、密碼表、多人分卡協作…
4. **每章至少 2 題用 split（多人分卡）**：每張卡單獨看都不夠，要合起來才解得開。單人會看到全部，所以題目還是要難。
5. 每章至少 1 題引用旅行日誌（story.js 裡該章或之前章節的台詞；例如「小羽到目前為止說了幾次神人」——**請用程式實際數 story.js 的台詞來確定數字**）。
6. 越南語：甄妮的小抄（題目裡要用到就把需要的字列在題目裡或 split 卡裡）。數字：một1 hai2 ba3 bốn4 năm5 sáu6 bảy7 tám8 chín9 mười10 không0 trăm百 nghìn千 linh零 mươi十（二十以上）lăm（十位後的5）mốt（十位後的1）。方向：trái左 phải右 thẳng直走 rẽ轉 lên上 xuống下 bắc北 nam南 đông東 tây西。顏色：đỏ紅 xanh綠/藍 vàng黃/金 trắng白 đen黑。其他可自由加，但要在題目裡給。
7. 每題 hint 只給方向、不能直接說答案。
8. 題目要好看：用 .paper、表格、SVG 畫圖（可以畫展品、招牌、地圖、車票）。手機 390px 寬也要看得清楚（SVG 用 viewBox + width:100%）。不要用外部圖片。
9. 答案要寬容：數字題接受「3-0-4-5」「3045」；文字題列出常見寫法。但不能讓亂猜容易對（選擇題至少 5 個選項，或用其他方式提高猜中成本）。
10. 全部用繁體中文；角色台詞要符合個性（小羽、俊治屁孩；博育乖但慢慢被同化；甄妮講越南話附中文翻譯）。

## 驗證（必做）
- 寫 node 測試（放 `/tmp/claude-0/-home-user/49a1a481-faf2-53d5-94b4-632fe3bb4aa1/scratchpad/bang/<你的資料夾>/`）：stub `P`、`K`、`norm`（複製 engine.js 的 norm），載入你的章節檔，確認每題 `solve` 通過 `check`/`ans`、隨便幾個錯答案不通過、id 不重複、pos 不重疊、need 指向存在的 id。
- 邏輯題請用程式暴力搜尋確認**解唯一**。
- 視覺：用測試頁 `/tmp/claude-0/-home-user/49a1a481-faf2-53d5-94b4-632fe3bb4aa1/scratchpad/bang/pzh.html?files=chN&ch=N&id=題目id`（file:// 開；`&n=2&seat=1` 看多人分卡）用 Playwright 截圖手機 390×844 與電腦 1280×800，**自己看截圖**修版面。不帶 id 會顯示整個場景與題目圖示。
  Playwright：`const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright')`，`chromium.launch()`（不需要 proxy）。在頁面裡可以呼叫 `__check(id, value)` 測答案、或模擬點擊元件後看 `__results`。
- 不要改 engine.js / kit.js / story.js / css（如果需要新樣式，在你的章節檔最前面用 `document.head.insertAdjacentHTML('beforeend','<style>…</style>')` 注入，class 用 `cN-` 前綴）。如果發現 kit 有 bug，在回報裡寫出來。
