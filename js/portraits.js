'use strict';
// ===== 越南公主：角色立繪（Q 版全身手繪風，全部 SVG，不使用照片） =====
// 風格：深棕描邊、柔和上色＋淡陰影、大頭小身體（約 2.3 頭身）。
// PORTRAIT.url(k, mood)      全身（viewBox 0 0 200 320）
// PORTRAIT.head(k, mood)     大頭貼（只取頭部）
// k：zn 甄妮、xy 小羽、jz 俊治、by 博育、ang 博育（小天使）
// mood：norm happy shock cry angry smug talk
const PORTRAIT = (() => {
  const OL = '#4A2E26', SW = 2.6;
  const SK = '#FCE5D4', SKS = '#F2C6AE', BL = '#F49AA8';
  const st = (fill, extra = '') => `fill="${fill}" stroke="${OL}" stroke-width="${SW}" stroke-linejoin="round" stroke-linecap="round" ${extra}`;
  const line = (w = SW) => `fill="none" stroke="${OL}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"`;

  // ---------- 臉部 ----------
  const EYES = {
    // 甄妮：大圓眼＋眼線＋睫毛、亮晶晶
    big: (y = 116) => [78, 122].map((x, i) => `<ellipse cx="${x}" cy="${y}" rx="9.5" ry="11.5" fill="#2A1A1C"/><ellipse cx="${x}" cy="${y + 3}" rx="6.5" ry="6" fill="#5A3A34"/>
      <circle cx="${x + 3}" cy="${y - 4}" r="3.6" fill="#fff"/><circle cx="${x - 3}" cy="${y + 5}" r="1.6" fill="#fff"/>
      <path d="M${x - 12} ${y - 7} Q${x} ${y - 16} ${x + 12} ${y - 7}" ${line(3.2)}/><path d="M${x + (i ? 11 : -11)} ${y - 8} l${i ? 5 : -5} -4" ${line(2.4)}/>`).join(''),
    // 小羽：單眼皮細長眼
    narrow: (y = 118) => [78, 122].map(x => `<path d="M${x - 11} ${y} Q${x} ${y - 7} ${x + 11} ${y - 1}" ${line(3)}/><ellipse cx="${x + 1}" cy="${y + 1.5}" rx="4.6" ry="4" fill="#2A1A1C"/><circle cx="${x + 2.6}" cy="${y}" r="1.3" fill="#fff"/>`).join(''),
    // 俊治：厭世半眼
    deadpan: (y = 117) => [78, 122].map(x => `<path d="M${x - 10} ${y - 2} L${x + 10} ${y - 3}" ${line(3.2)}/><path d="M${x - 8} ${y - 2} Q${x} ${y + 6} ${x + 8} ${y - 2}" fill="#2A1A1C"/><circle cx="${x + 2}" cy="${y}" r="1.2" fill="#fff"/>`).join(''),
    // 博育：瞇眼大笑
    smile: (y = 118) => [78, 122].map(x => `<path d="M${x - 10} ${y + 2} Q${x} ${y - 9} ${x + 10} ${y + 2}" ${line(3.4)}/>`).join(''),
    closed: (y = 118) => [78, 122].map(x => `<path d="M${x - 10} ${y - 1} Q${x} ${y + 7} ${x + 10} ${y - 1}" ${line(3)}/><path d="M${x - 9} ${y + 2} l-3 3 M${x - 4} ${y + 4} l-1 4" ${line(1.6)}/>`).join(''),
    shock: (y = 116) => [78, 122].map(x => `<circle cx="${x}" cy="${y}" r="9" fill="#fff" stroke="${OL}" stroke-width="2.6"/><circle cx="${x}" cy="${y}" r="3" fill="#2A1A1C"/>`).join(''),
  };
  const MOUTH = {
    small: `<path d="M95 140 Q100 144 105 140" ${line(2.4)}/>`,
    lips: `<path d="M94 139 Q100 136 106 139 Q103 146 100 146 Q97 146 94 139Z" fill="#EE8C7E" stroke="${OL}" stroke-width="1.8"/><ellipse cx="98" cy="142" rx="2" ry="1" fill="#fff" opacity=".7"/>`,
    flat: `<path d="M95 141 L105 140.5" ${line(2.4)}/>`,
    grin: `<path d="M90 136 Q100 154 110 136Z" fill="#A83A48" stroke="${OL}" stroke-width="2.2" stroke-linejoin="round"/><path d="M92 137.5 Q100 141 108 137.5" stroke="#fff" stroke-width="3" fill="none"/><path d="M96 147 Q100 149 104 147" stroke="#F49AA8" stroke-width="2.4" fill="none"/>`,
    shock: `<ellipse cx="100" cy="143" rx="5" ry="6.5" fill="#A83A48" stroke="${OL}" stroke-width="2"/>`,
    smug: `<path d="M93 141 Q101 145 108 136" ${line(2.4)}/>`,
    cry: `<path d="M93 145 Q100 137 107 145" ${line(2.4)}/>`,
    talk: `<path d="M94 138 Q100 136 106 138 Q105 147 100 148 Q95 147 94 138Z" fill="#A83A48" stroke="${OL}" stroke-width="2"/>`,
  };
  const blush = (o = .55) => `<ellipse cx="70" cy="132" rx="10" ry="5.5" fill="${BL}" opacity="${o}"/><ellipse cx="130" cy="132" rx="10" ry="5.5" fill="${BL}" opacity="${o}"/>
    <path d="M64 131 l3 -3 M69 132 l3 -3 M74 133 l3 -3 M126 131 l3 -3 M131 132 l3 -3 M136 133 l3 -3" stroke="#E07888" stroke-width="1.2" opacity="${o}"/>`;
  const brows = (c, d = 0) => `<path d="M70 ${101 + d} Q78 ${97} 86 ${101 - d}" stroke="${c}" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M114 ${101 - d} Q122 ${97} 130 ${101 + d}" stroke="${c}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
  const angry = (c) => `<path d="M69 98 L87 104" stroke="${c}" stroke-width="3.6" stroke-linecap="round"/><path d="M131 98 L113 104" stroke="${c}" stroke-width="3.6" stroke-linecap="round"/>`;
  const tears = `<path d="M66 122 q-4 10 0 16 q5 -6 0 -16Z M134 122 q-4 10 0 16 q5 -6 0 -16Z" fill="#8FD0F5" stroke="#5AA0D0" stroke-width="1"/>`;
  const sweat = `<path d="M146 92 q-6 10 0 14 q6 -4 0 -14Z" fill="#BFE6FA" stroke="#6AB0DA" stroke-width="1.4"/>`;
  const faceShape = `<path d="M44 108 C44 66 70 50 100 50 C130 50 156 66 156 108 C156 140 136 160 100 162 C64 160 44 140 44 108Z" ${st(SK)}/>
    <path d="M52 128 C60 150 78 158 100 160 C84 152 66 144 52 128Z" fill="${SKS}" opacity=".45"/>`;
  const ears = `<ellipse cx="45" cy="114" rx="7" ry="10" ${st(SK)}/><ellipse cx="155" cy="114" rx="7" ry="10" ${st(SK)}/>`;
  const neck = `<path d="M90 158 L90 172 L110 172 L110 158" ${st(SK)}/>`;
  // 手（小圓手）
  const hand = (x, y, r = 8) => `<circle cx="${x}" cy="${y}" r="${r}" ${st(SK)}/>`;
  const thumb = (x, y) => `<path d="M${x - 8} ${y} q0 -10 8 -10 h4 q6 0 6 6 v8 q0 6 -6 6 h-8 q-6 0 -4 -10Z" ${st(SK)}/><path d="M${x + 2} ${y - 10} q-1 -12 5 -14 q5 0 3 8 l-2 7" ${st(SK)}/>`;
  const shoe = (x, y, c = '#F5F2EC', s = '#D8D2C8') => `<path d="M${x - 13} ${y} q0 -9 9 -9 h8 q11 0 11 9 q0 4 -4 4 h-20 q-4 0 -4 -4Z" ${st(c)}/><path d="M${x - 12} ${y + 1} h22" stroke="${s}" stroke-width="2"/>`;

  // ---------- 角色 ----------
  const D = {
    // 甄妮：黑長直＋空氣瀏海、一字領黑上衣（灰色渲染印花）、細項鍊、深色寬褲；身邊有藍色 zZZ 與白星星
    zn: () => {
      const H = '#1E1820', HS = '#3A303E';
      return {
        hairBack: `<path d="M40 104 C34 58 66 38 100 38 C134 38 166 58 160 104 L170 250 C150 262 128 256 122 246 L120 180 L80 180 L78 246 C72 256 50 262 30 250Z" ${st(H)}/>
          <path d="M52 170 C50 200 48 226 40 246 M148 170 C150 200 152 226 160 246" stroke="${HS}" stroke-width="2.4" fill="none"/>`,
        body: `<path d="M58 182 C62 172 80 168 100 168 C120 168 138 172 142 182 L150 196 L50 196Z" ${st(SK)}/>
          <path d="M84 176 Q92 172 98 175 M116 176 Q108 172 102 175" stroke="${SKS}" stroke-width="1.6" fill="none"/>
          <path d="M92 168 Q100 182 108 168" stroke="#C8CCD6" stroke-width="1.2" fill="none"/><circle cx="100" cy="181" r="2.2" fill="#fff" stroke="#9AA2B0" stroke-width="1"/>
          <clipPath id="zntop"><path d="M46 194 Q100 186 154 194 L150 248 Q100 256 50 248Z"/></clipPath>
          <path d="M46 194 Q100 186 154 194 L150 248 Q100 256 50 248Z" ${st('#18161C')}/>
          <g clip-path="url(#zntop)"><path d="M62 214 C70 200 88 206 98 200 C112 192 128 204 140 214 C146 226 138 240 128 250 L72 252 C62 240 56 226 62 214Z" fill="#7E8696"/>
          <path d="M70 226 C80 214 94 230 106 220 C118 212 130 222 132 234 C126 244 112 250 96 250 C82 248 70 240 70 226Z" fill="#DCE0E8" opacity=".85"/>
          <path d="M78 238 C90 230 102 244 120 236 M84 214 C94 210 104 218 116 212" stroke="#3E4250" stroke-width="2.4" fill="none" opacity=".55"/></g>
          <path d="M46 194 Q100 186 154 194" stroke="#34303C" stroke-width="3" fill="none"/>
          <path d="M52 250 L148 250 L146 292 L106 292 L100 262 L94 292 L54 292Z" ${st('#2C2A36')}/><path d="M100 262 L100 252" stroke="#45424F" stroke-width="2"/>
          <path d="M46 196 C36 208 34 226 38 240 L46 240 C46 226 50 212 54 204Z" ${st(SK)}/><path d="M154 196 C164 208 166 226 162 240 L154 240 C154 226 150 212 146 204Z" ${st(SK)}/>
          <path d="M44 196 Q48 206 56 206 L58 196Z M156 196 Q152 206 144 206 L142 196Z" ${st('#18161C')}/>`,
        hands: hand(40, 244) + hand(160, 244),
        shoes: shoe(74, 302, '#F5F2EC') + shoe(126, 302, '#F5F2EC'),
        eyes: 'big', mouth: 'lips', browC: '#3A2A2E', blush: .6,
        hairFront: `<path d="M48 100 C44 60 70 44 100 44 C132 44 158 62 152 100 C148 86 142 78 134 74 L130 98 L124 76 L118 100 L112 72 L104 74 L102 100 L98 74 L90 72 L86 100 L80 76 L72 98 L68 74 C58 80 50 88 48 100Z" ${st(H)}/>
          <path d="M50 96 C42 130 50 160 44 186 L36 182 C40 152 34 124 46 92Z M150 96 C158 130 150 160 156 186 L164 182 C160 152 166 124 154 92Z" ${st(H)}/>
          <path d="M70 52 C84 46 116 46 132 54" stroke="#5A4A5E" stroke-width="4" opacity=".7" fill="none" stroke-linecap="round"/>`,
        extra: `<g stroke="#4AA0FF" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M160 40 h10 l-10 10 h10"/><path d="M174 22 h14 l-14 14 h14"/></g>
          <path d="M22 168 l4 9 l10 1 l-7 7 l2 10 l-9 -5 l-9 5 l2 -10 l-7 -7 l10 -1z" fill="#fff" stroke="#C8D4E8" stroke-width="1.4"/>` };
    },
    // 小羽：黑色厚重香菇頭、細長眼、奶茶色大學 T（Kangol 小字）、米色斜背包、卡其寬褲
    xy: () => {
      const H = '#141218';
      return {
        hairBack: `<path d="M40 116 C32 62 64 36 100 36 C138 36 170 62 160 116 C158 128 150 136 144 138 L56 138 C50 136 42 128 40 116Z" ${st(H)}/>`,
        body: `<path d="M50 186 C56 174 78 168 100 168 C122 168 144 174 150 186 L154 256 L46 256Z" ${st('#EEE6DA')}/>
          <path d="M84 170 Q100 182 116 170" stroke="#D6CAB8" stroke-width="5" fill="none"/>
          <text x="100" y="214" font-family="Georgia,serif" font-style="italic" font-size="11" text-anchor="middle" fill="#B0A28C">Kangol</text>
          <path d="M50 250 L150 250" stroke="#D6CAB8" stroke-width="5"/>
          <path d="M60 172 L140 240" stroke="#D9CCB2" stroke-width="7"/><path d="M60 172 L140 240" ${line(1.4)} opacity=".5"/>
          <rect x="128" y="232" width="26" height="20" rx="5" ${st('#E2D6BE')}/>
          <path d="M52 254 L148 254 L144 294 L106 294 L100 268 L94 294 L56 294Z" ${st('#CDBB98')}/>
          <path d="M48 184 C36 200 34 222 40 238" ${st('#EEE6DA')}/><path d="M152 184 C164 200 166 222 160 238" ${st('#EEE6DA')}/>`,
        hands: hand(42, 242) + hand(158, 242),
        shoes: shoe(74, 304, '#2A2830', '#4A4850') + shoe(126, 304, '#2A2830', '#4A4850'),
        eyes: 'narrow', mouth: 'small', browC: null, blush: .4,
        hairFront: `<path d="M42 120 C34 64 66 40 100 40 C136 40 168 64 158 120 C154 112 150 106 146 104 C120 112 80 112 54 104 C50 106 46 112 42 120Z" ${st(H)}/>
          <path d="M56 104 C80 112 120 112 144 104" stroke="#3A3844" stroke-width="2" fill="none"/>
          <g stroke="#34323C" stroke-width="1.8"><path d="M66 106 l3 -22 M78 108 l2 -26 M90 109 l1 -28 M110 109 l-1 -28 M122 108 l-2 -26 M134 106 l-3 -22"/></g>
          <path d="M64 56 C80 46 124 46 140 60" stroke="#5A5868" stroke-width="7" opacity=".55" fill="none" stroke-linecap="round"/>`,
        extra: '' };
    },
    // 俊治：及肩黑長髮往後梳、細圓框眼鏡、厭世臉、黑色寬版 T、淺灰棉褲
    jz: () => {
      const H = '#16121A';
      return {
        hairBack: `<path d="M44 104 C38 58 68 38 100 38 C134 38 164 58 156 104 L162 188 C152 198 140 196 136 186 L134 140 L66 140 L64 186 C60 196 48 198 38 188Z" ${st(H)}/>`,
        body: `<path d="M44 190 C50 176 76 168 100 168 C124 168 150 176 156 190 L158 258 L42 258Z" ${st('#1A191F')}/>
          <path d="M86 170 Q100 180 114 170" stroke="#34323C" stroke-width="3" fill="none"/>
          <path d="M44 190 C30 206 28 230 34 246 L52 246 L54 204Z M156 190 C170 206 172 230 166 246 L148 246 L146 204Z" ${st('#1A191F')}/>
          <path d="M50 256 L150 256 L146 296 L106 296 L100 270 L94 296 L54 296Z" ${st('#D4D6DA')}/><path d="M60 286 h28 M112 286 h28" stroke="#BFC2C8" stroke-width="2"/>`,
        hands: hand(42, 250) + hand(158, 250),
        shoes: shoe(74, 306, '#2A2830', '#4A4850') + shoe(126, 306, '#2A2830', '#4A4850'),
        eyes: 'deadpan', mouth: 'flat', browC: H, browD: 2, blush: .25,
        hairFront: `<path d="M50 100 C46 60 72 44 100 44 C128 44 154 60 150 100 C146 80 136 64 118 58 C110 56 104 58 100 64 C96 58 90 56 82 58 C64 64 54 80 50 100Z" ${st(H)}/>
          <path d="M52 96 C46 126 52 154 44 176 M148 96 C154 126 148 154 156 176" stroke="${H}" stroke-width="9" fill="none" stroke-linecap="round"/>
          <path d="M86 58 C72 70 62 86 56 104 M114 58 C128 70 138 86 144 104" stroke="#3E3846" stroke-width="2" fill="none"/>`,
        extra: `<g fill="rgba(255,255,255,.18)" stroke="#9A7650" stroke-width="2"><circle cx="78" cy="116" r="15"/><circle cx="122" cy="116" r="15"/></g><path d="M93 114 Q100 110 107 114 M63 113 L52 110 M137 113 L148 110" stroke="#9A7650" stroke-width="2" fill="none"/>` };
    },
    // 博育：黑短髮、瞇眼大笑、比讚、灰綠水洗丹寧外套（胸前口袋）＋黑 T、黑色斜背帶、黑褲
    by: () => {
      const H = '#18141C';
      return {
        hairBack: '',
        body: `<path d="M46 188 C52 174 76 168 100 168 C124 168 148 174 154 188 L156 256 L44 256Z" ${st('#B7C2AC')}/>
          <path d="M86 170 L100 196 L114 170Z" ${st('#1C1A20')}/>
          <path d="M86 170 L74 190 L84 196 L96 184Z M114 170 L126 190 L116 196 L104 184Z" ${st('#A6B29A')}/>
          <rect x="58" y="204" width="24" height="18" rx="3" ${st('#ABB79F')}/><rect x="118" y="204" width="24" height="18" rx="3" ${st('#ABB79F')}/>
          <path d="M100 196 L100 256" stroke="${OL}" stroke-width="1.6"/><circle cx="100" cy="214" r="1.8" fill="${OL}"/><circle cx="100" cy="234" r="1.8" fill="${OL}"/>
          <path d="M70 172 L144 252" stroke="#26232A" stroke-width="7"/>
          <path d="M50 254 L150 254 L146 296 L106 296 L100 268 L94 296 L54 296Z" ${st('#2A2830')}/>
          <path d="M46 188 C34 204 32 226 38 242" ${st('#B7C2AC')}/><path d="M154 188 C170 196 176 178 174 160" ${st('#B7C2AC')}/>`,
        hands: hand(40, 246) + thumb(172, 156),
        shoes: shoe(74, 306, '#F5F2EC') + shoe(126, 306, '#F5F2EC'),
        eyes: 'smile', mouth: 'grin', browC: H, browD: -1, blush: .6,
        hairFront: `<path d="M44 112 C36 60 70 42 102 42 C136 42 166 62 156 112 C152 98 146 90 140 86 C134 98 120 100 110 92 C102 104 86 106 76 96 C64 102 52 104 44 112Z" ${st(H)}/>
          <path d="M66 54 C82 46 118 46 134 56" stroke="#4A4252" stroke-width="4" opacity=".6" fill="none" stroke-linecap="round"/>`,
        extra: '' };
    },
  };
  D.ang = () => {
    const d = D.by();
    d.hairBack = `<g ${st('#FFFFFF')}><path d="M48 196 C10 176 2 132 14 108 C30 132 42 144 60 150 C46 162 44 182 48 196Z"/><path d="M152 196 C190 176 198 132 186 108 C170 132 158 144 140 150 C154 162 156 182 152 196Z"/></g>
      <path d="M22 130 C30 146 40 152 52 156 M178 130 C170 146 160 152 148 156" stroke="#E6DCC4" stroke-width="2" fill="none"/>`;
    d.extra += `<ellipse cx="100" cy="28" rx="34" ry="8" fill="none" stroke="#F6C445" stroke-width="6"/><ellipse cx="100" cy="28" rx="34" ry="8" fill="none" stroke="#FFF2B8" stroke-width="1.6"/>`;
    return d;
  };

  const DEFS = `<linearGradient id="shade" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#2A1A30" stop-opacity=".16"/></linearGradient><linearGradient id="gloss" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".3" stop-color="#fff" stop-opacity=".9"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/></linearGradient>`;
  function parts(k, mood) {
    const d = D[k]();
    let eyes = EYES[d.eyes](), mouth = MOUTH[d.mouth], br = d.browC ? brows(d.browC, d.browD || 0) : '', ex = '';
    if (mood === 'happy') { eyes = EYES.smile(); mouth = MOUTH.grin; }
    if (mood === 'shock') { eyes = EYES.shock(); mouth = MOUTH.shock; ex += sweat; }
    if (mood === 'cry') { eyes = EYES.closed(); mouth = MOUTH.cry; ex += tears; }
    if (mood === 'angry') { br = angry(d.browC || '#2A1E22'); mouth = MOUTH.flat; }
    if (mood === 'smug') mouth = MOUTH.smug;
    if (mood === 'talk') mouth = MOUTH.talk;
    if (mood === 'closed') eyes = EYES.closed();
    const face = `${ears}${faceShape}${blush(d.blush)}${eyes}${br}<ellipse cx="100" cy="130" rx="1.6" ry="1.2" fill="#D9A08A"/>${mouth}${d.hairFront}${d.extra}${ex}`;
    return { d, face };
  }
  function svg(k, mood = 'norm') {
    const { d, face } = parts(k, mood);
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 320"><defs>${DEFS}</defs><ellipse cx="100" cy="312" rx="52" ry="7" fill="#2A2230" opacity=".12"/>${d.hairBack}${neck}${d.body}${d.hands}${d.shoes}${face}<path d="M44 104 C44 60 70 46 100 46 C130 46 156 60 156 104" fill="none" stroke="url(#gloss)" stroke-width="10" opacity=".35"/></svg>`;
  }
  function headSvg(k, mood = 'norm') {
    const { d, face } = parts(k, mood);
    const bg = { zn: '#DCE8F7', xy: '#E3EFD8', jz: '#F1DCC6', by: '#FBEBC9', ang: '#FFF7E0' }[k] || '#eee';
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="22 14 156 156"><rect x="0" y="0" width="200" height="320" fill="${bg}"/>${d.hairBack}${neck}${d.body}${face}</svg>`;
  }
  const cache = {};
  const enc = (s) => 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(s);
  const url = (k, mood = 'norm') => cache['f' + k + mood] || (cache['f' + k + mood] = enc(svg(k, mood)));
  const head = (k, mood = 'norm') => cache['h' + k + mood] || (cache['h' + k + mood] = enc(headSvg(k, mood)));
  return { svg, url, head };
})();
