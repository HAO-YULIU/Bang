# 越南公主 — 最終小遊戲模組規格（內部文件）

每個模組是一個獨立的 classic script（不是 ES module），檔名 `js/finale/<name>.js`，
載入後呼叫 `FINALE.register(name, mod)`。`FINALE` 與 `FX` 由主程式提供（測試時自己寫 stub）。

## 遊戲對應
| name      | 人數 | 內容 |
|-----------|-----|------|
| pinball   | 1   | 甄妮的彈珠試煉：俯視角「打彈珠」(彈彈珠，不是彈珠台)。拖曳控制角度與力度。四關：①擊中目標 ②彈進指定洞口 ③一桿連續擊中三個目標 ④最終關：金色彈珠 |
| xiangqi   | 2   | 大盤象棋：完整中國象棋規則（將帥不能照面、蹩馬腿、塞象眼、過河兵、將軍不能送將、無合法步=輸）。認輸、和棋提議。 |
| cards     | 3   | 撲克牌大會：依序三局 大老二 → 撿紅點 → 抽鬼牌；每局第一名 5 分、第二名 3 分、第三名 1 分；三局後總分排名 + 頒獎畫面 |
| mahjong   | 4   | 台灣 16 張麻將，打一圈（東風圈，四家各當一次莊；莊家胡或流局可連莊但整場最多 8 局保護上限），積分賽，結束頒獎 |

## 介面
```js
FINALE.register('xiangqi', {
  title: '大盤象棋',
  init({ seats, seed }) => state,
  //   seats: [{ seat:0, ch:'zn'|'xy'|'jz'|'by', name:'玩家暱稱', bot:false }, ...]  （seat 0..n-1）
  //   seed: 整數。所有隨機都要用 state 內自帶的 PRNG（例如 mulberry32，種子存在 state），state 必須可 JSON 序列化。
  act(state, seat, action) => { ok:true, state, ev:[...] } | { ok:false, msg:'不能這樣走' },
  //   純函式：不可碰 DOM。回傳新的 state（可以是改過的同一個物件，但要可 JSON 化）。
  //   ev：給所有人看的事件陣列，例如 { q:['xy','神人。'] }（角色台詞泡泡）、
  //       { q:['zn','Tôi thắng rồi!','我胡了！'] }（甄妮說越南話＋中文翻譯）、{ sfx:'tile' }、{ toast:'小羽 碰！' }
  bot(state, seat) => action | null,      // 斷線時主機用 bot 代打；不是他的回合就回 null
  waiting(state) => [seat, ...],          // 現在需要誰行動（給主機判斷要不要叫 bot）
  render(root, state, mySeat, send, ev),  // 每次 state 更新都會呼叫；root 是一個空的 div（會重複使用，自己決定要不要整個重畫）
  //   send(action) 把動作送給主機（主機會呼叫 act 然後廣播新 state）。mySeat 是自己這台裝置的座位；觀戰時是 -1。
  result(state) => null | { rank:[seat,...最好的在前], score:{ [seat]: number }, lines:[ '甄妮 42 分', ... ] },
});
```
- 主機流程：玩家動作 → `act` → 廣播 `{state, ev}` → 每台裝置 `render(root, state, mySeat, send, ev)`。
- `result` 不為 null 時主程式會接手做「頒獎典禮」與結局畫面；模組自己的畫面只要顯示「這一局 / 這一場結束」的結果即可。
  cards / mahjong 要自己做模組內的「局間結算」畫面；整場結束後的總頒獎由主程式做（主程式會用 result.rank / score / lines）。
- 單人 pinball：一樣用這個介面，`send({type:'shot', ...})` 或 `send({type:'clear', level})`，物理動畫在 render 裡跑（requestAnimationFrame），
  過關才 send。`result` 在四關都過了之後回傳 `{rank:[0], score:{0:分數}, lines:[...]}`。

## 主程式提供的 FX（測試時請自己 stub）
```js
FX.names   // { zn:'甄妮', xy:'小羽', jz:'俊治', by:'博育' }
FX.color   // { zn:'#E86A8F', xy:'#3E8ED0', jz:'#2B2B33', by:'#5BAF7A' } 角色代表色
FX.avatar(ch, px)   // 回傳 <img> HTML 字串（角色大頭 Q 版 SVG）
FX.sfx(name)        // 'click','good','bad','win','card','shuffle','tile','marble','hit','fanfare','pop'
FX.quip(ch, text, zh)  // 立即顯示台詞泡泡（一般不用，請用 ev 的 q）
```

## 角色台詞（請在適當事件放進 ev）
- 小羽口頭禪「神人。」；俊治口頭禪「Bang!」「完全法克。」；博育是乖學弟（最後也被同化會說「Bang。」）。
- 甄妮只講越南話，一定附中文翻譯：['zn', 'Tôi thắng rồi!', '我贏了！']。可用：
  'Tôi thắng rồi!'(我贏了！/我胡了！) 'Không thể nào!'(不可能！) 'Đến lượt tôi!'(輪到我了！) 'Hay quá!'(太讚了！)
  'Ôi trời ơi!'(天啊！) 'Chờ chút!'(等一下！) 'Tôi sẽ thắng!'(我會贏！) 'Thần nhân!'(神人！)
- 象棋：小羽吃子 → ['xy','神人。']；甄妮吃掉小羽的車 → ['xy','？？？'] 然後 ['jz','Bang！'] ['xy','你不要在旁邊吵。']（2 人模式俊治、博育是 NPC 觀眾，可以在旁邊吐槽）。
  結束：['jz','完全法克。'] ['by','你只是輸棋。'] ['jz','對我來說一樣。']
- 麻將胡牌台詞：甄妮自摸 ['zn','Tôi thắng rồi!','我胡了！'] + ['xy','神人！']；小羽胡 ['xy','我就說我是神人。'] ['jz','你只是運氣好。'] ['xy','嫉妒？'] ['jz','Bang！']；
  俊治胡 ['jz','Bang！'] ['by','你到底為什麼胡牌要喊 Bang？'] ['jz','因為帥。'] ['by','完全沒有關係。']；
  博育胡（第一次）全場「……」→ ['xy','學弟。'] ['by','嗯？'] ['xy','你變了。'] ['jz','他已經不是以前那個博育了。'] ['by','Bang。'] ['xy','完了。'] ['jz','他真的被我們同化了。']
- 撲克牌：博育是 3 人模式的裁判（NPC），開場與每局結算可以講話。

## 視覺 / 技術要求
- 不用任何外部函式庫、圖片檔；牌、棋子、麻將牌都用 CSS/SVG 自己畫（麻將牌要看得懂：萬/筒/條/字/花）。
- 風格：可愛、溫暖的台灣旅遊感。色票：奶油底 #FFF6E8、燈籠紅 #E8453C、湖水綠 #2BA6A0、墨 #2A2230、金 #F2B33D、紙 #FFFDF8。字型 'Noto Sans TC' / 'Noto Serif TC'（主程式會載入）。
- 所有 CSS 用模組前綴（例如 `.fxq-`、`.fcd-`、`.fmj-`、`.fpb-`），在模組裡用一個 <style id="..."> 注入一次，不要污染全域。
- 必須同時支援手機（寬 360–430px，直向）與電腦（1280px+），可觸控。手機上麻將 16 張手牌要排得下（可兩排或縮小、可橫向捲動但不能讓整頁水平捲動）。
- 每個人只看得到自己的手牌（render 依 mySeat 決定）；觀戰（-1）看不到任何人手牌。
- 規則要寫在模組裡的「規則說明」按鈕（中文）。
- 不要 console.error；不能有未捕捉例外。
