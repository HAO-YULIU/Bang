'use strict';
// ===== 場景插畫：全部 SVG（viewBox 1000×600） =====
const ART = (() => {
  const sky = (a, b, c) => `<defs><linearGradient id="sk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset=".65" stop-color="${b}"/><stop offset="1" stop-color="${c || b}"/></linearGradient>
    <radialGradient id="glow" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#FFE9A8" stop-opacity=".95"/><stop offset="1" stop-color="#FFE9A8" stop-opacity="0"/></radialGradient></defs>
    <rect width="1000" height="600" fill="url(#sk)"/>`;
  const stars = (n, seed = 3) => { let s = '', r = seed; const R = () => (r = (r * 9301 + 49297) % 233280) / 233280; for (let i = 0; i < n; i++) s += `<circle cx="${R() * 1000}" cy="${R() * 260}" r="${R() * 1.6 + .4}" fill="#fff" opacity="${R() * .6 + .3}"/>`; return s; };
  const cloud = (x, y, k = 1, o = .9) => `<g transform="translate(${x} ${y}) scale(${k})" fill="#fff" opacity="${o}"><ellipse cx="0" cy="0" rx="46" ry="20"/><ellipse cx="-30" cy="6" rx="30" ry="15"/><ellipse cx="34" cy="6" rx="32" ry="15"/><ellipse cx="6" cy="-12" rx="28" ry="18"/></g>`;
  const lantern = (x, y, k = 1, c = '#E8453C') => `<g transform="translate(${x} ${y}) scale(${k})"><line x1="0" y1="-30" x2="0" y2="-16" stroke="#5A3A2A" stroke-width="2"/><circle r="40" fill="url(#glow)" opacity=".6"/><ellipse rx="16" ry="19" fill="${c}"/><rect x="-9" y="-21" width="18" height="5" rx="1" fill="#3A2A22"/><rect x="-9" y="16" width="18" height="5" rx="1" fill="#3A2A22"/><path d="M-10 -14 Q0 -18 10 -14 M-14 0 Q0 -3 14 0 M-10 13 Q0 17 10 13" stroke="#B8302A" stroke-width="1.4" fill="none"/><line x1="0" y1="21" x2="0" y2="32" stroke="#F2B33D" stroke-width="2"/></g>`;
  const tree = (x, y, k = 1, c = '#3E8E5A', d = '#2E6E46') => `<g transform="translate(${x} ${y}) scale(${k})"><rect x="-6" y="-10" width="12" height="60" fill="#6A4A32"/><circle cx="0" cy="-40" r="44" fill="${d}"/><circle cx="-26" cy="-22" r="30" fill="${c}"/><circle cx="24" cy="-28" r="34" fill="${c}"/><circle cx="2" cy="-60" r="30" fill="${c}"/></g>`;
  const ground = (c, y = 470) => `<rect y="${y}" width="1000" height="${600 - y}" fill="${c}"/>`;
  const win = (x, y, w, h, c = '#FFE7A0') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="2" fill="${c}"/>`;

  const S = {
    // 序章：台北車站
    station: () => sky('#8FC7F0', '#D6ECFA', '#F4F0E4') + cloud(160, 90, 1.2) + cloud(820, 70, .9) + cloud(560, 120, .7, .7)
      + `<rect x="170" y="210" width="660" height="260" fill="#E9E1D0"/><rect x="170" y="210" width="660" height="20" fill="#CFC3AA"/>
      <path d="M150 210 L500 120 L850 210Z" fill="#3E6F6A"/><path d="M190 200 L500 128 L810 200" stroke="#2E5450" stroke-width="6" fill="none"/>
      <rect x="300" y="160" width="400" height="50" fill="#E9E1D0"/><path d="M280 165 L500 100 L720 165Z" fill="#4A7F78"/>
      ${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => `<rect x="${200 + i * 56}" y="250" width="34" height="150" rx="3" fill="#8FB8D8" opacity=".85"/>`).join('')}
      <rect x="430" y="330" width="140" height="140" fill="#5A7A96"/><rect x="440" y="340" width="120" height="130" fill="#9CC4E0"/>
      <rect x="400" y="226" width="200" height="34" rx="4" fill="#2E5450"/><text x="500" y="251" text-anchor="middle" font-size="22" font-weight="700" fill="#FFF6E8" font-family="Noto Serif TC,serif">臺 北 車 站</text>`
      + ground('#C9C2B4') + `<rect y="470" width="1000" height="16" fill="#B0A898"/>
      <g transform="translate(130 470)"><rect x="-60" y="-34" width="120" height="34" rx="10" fill="#F2C230"/><rect x="-36" y="-52" width="70" height="24" rx="8" fill="#F2C230"/><rect x="-30" y="-48" width="58" height="16" rx="4" fill="#9CC4E0"/><circle cx="-34" cy="0" r="11" fill="#2A2230"/><circle cx="34" cy="0" r="11" fill="#2A2230"/><rect x="-10" y="-60" width="20" height="8" rx="2" fill="#2A2230"/></g>
      <g transform="translate(880 474)"><rect x="-14" y="-70" width="28" height="70" rx="6" fill="#3E8ED0"/><rect x="-10" y="-62" width="20" height="14" fill="#fff"/><text x="0" y="-51" font-size="10" text-anchor="middle" fill="#3E8ED0">M</text></g>`,
    // 第一章：故宮
    palace: () => sky('#7CC0EE', '#CBE6F8', '#E8F2E2') + cloud(200, 80) + cloud(760, 110, .8)
      + `<path d="M0 360 C180 300 360 330 520 290 C700 250 860 300 1000 270 L1000 470 L0 470Z" fill="#7FB07A"/>
      <rect x="320" y="250" width="360" height="140" fill="#F3EBD8"/><path d="M290 255 L500 175 L710 255Z" fill="#2E6FA8"/><path d="M300 252 Q500 205 700 252" stroke="#F2B33D" stroke-width="5" fill="none"/>
      <rect x="380" y="190" width="240" height="40" fill="#F3EBD8"/><path d="M360 196 L500 142 L640 196Z" fill="#2E6FA8"/>
      ${[0, 1, 2, 3, 4].map(i => `<rect x="${350 + i * 66}" y="290" width="36" height="100" fill="#C9473E"/>`).join('')}
      ${[0, 1, 2, 3, 4, 5, 6].map(i => `<rect x="${300 - i * 10}" y="${390 + i * 12}" width="${400 + i * 20}" height="12" fill="${i % 2 ? '#E8E0CC' : '#F5EFE0'}"/>`).join('')}`
      + ground('#DDD4BE', 474) + tree(120, 420, 1.2) + tree(880, 420, 1.1)
      + `<g transform="translate(160 520)"><rect x="-40" y="-20" width="80" height="60" rx="6" fill="#fff" opacity=".7"/><path d="M-10 10 C-20 -20 0 -40 10 -30 C20 -40 30 -10 14 14Z" fill="#8FD18A"/><path d="M-6 12 C-4 -6 6 -16 12 -24" stroke="#E8F6E0" stroke-width="3" fill="none"/></g>`,
    // 第二章：北美館（白色方盒建築＋展廳）
    museum: () => sky('#F4F1EA', '#ECE6DA') + `<rect x="0" y="0" width="1000" height="430" fill="#F7F4EE"/>
      <rect x="0" y="430" width="1000" height="170" fill="#D8CDB8"/><path d="M0 430 L1000 430" stroke="#BFB29A" stroke-width="3"/>
      <rect x="110" y="120" width="250" height="190" fill="#fff" stroke="#2A2230" stroke-width="10"/>
      <circle cx="190" cy="200" r="38" fill="#E8453C"/><path d="M250 260 L300 160 L340 260Z" fill="#2BA6A0"/><rect x="150" y="240" width="60" height="60" fill="#F2B33D"/><path d="M300 140 l9 18 l20 3 l-15 14 l4 20 l-18 -10 l-18 10 l4 -20 l-15 -14 l20 -3z" fill="#3E8ED0"/>
      <rect x="430" y="150" width="160" height="210" fill="#fff" stroke="#8A7A60" stroke-width="8"/><path d="M450 330 C480 200 540 280 570 170" stroke="#2A2230" stroke-width="6" fill="none"/><circle cx="520" cy="210" r="22" fill="#F7849E"/>
      <rect x="660" y="110" width="230" height="230" fill="#fff" stroke="#2A2230" stroke-width="6"/>${[0, 1, 2, 3].map(i => [0, 1, 2, 3].map(j => `<rect x="${672 + i * 54}" y="${122 + j * 54}" width="46" height="46" fill="${['#E8453C', '#F2B33D', '#2BA6A0', '#3E8ED0', '#fff'][(i * 3 + j * 2) % 5]}"/>`).join('')).join('')}
      <rect x="150" y="320" width="170" height="26" fill="#fff" stroke="#BFB29A"/><rect x="455" y="372" width="110" height="20" fill="#fff" stroke="#BFB29A"/><rect x="700" y="350" width="150" height="22" fill="#fff" stroke="#BFB29A"/>
      ${[[90, 0], [930, 0]].map(([x]) => `<rect x="${x - 6}" y="0" width="12" height="430" fill="#E9E3D6"/>`).join('')}
      <rect x="380" y="470" width="240" height="30" rx="6" fill="#BFAE8E"/><rect x="390" y="440" width="220" height="34" rx="8" fill="#8A7A60"/>`,
    // 第三章：九份（夜晚、階梯、紅燈籠）
    jiufen: () => sky('#1E2350', '#3A3070', '#6A3E64') + stars(70) + `<circle cx="850" cy="90" r="34" fill="#FFF3C4"/><circle cx="862" cy="82" r="30" fill="#3A3070" opacity=".25"/>
      <path d="M0 330 C200 280 400 300 600 260 C780 230 900 260 1000 240 L1000 600 L0 600Z" fill="#2A2246"/>
      <rect x="60" y="180" width="240" height="320" fill="#5A2E2E"/><path d="M40 190 L180 120 L320 190Z" fill="#2E1E1E"/><rect x="80" y="230" width="200" height="40" fill="#C9473E"/>
      <text x="180" y="258" text-anchor="middle" font-size="22" font-family="Noto Serif TC,serif" fill="#FFE9A8" font-weight="700">阿 妹 茶 樓</text>
      ${[0, 1, 2].map(i => [0, 1, 2].map(j => win(95 + i * 64, 300 + j * 60, 40, 38)).join('')).join('')}
      <rect x="700" y="210" width="240" height="290" fill="#4A2828"/><path d="M680 220 L820 160 L960 220Z" fill="#2E1E1E"/>${[0, 1, 2].map(i => win(730 + i * 64, 270, 40, 50)).join('')}
      ${Array.from({ length: 12 }, (_, i) => `<rect x="${320 + i * 6}" y="${600 - i * 26}" width="${360 - i * 12}" height="26" fill="${i % 2 ? '#7A6A60' : '#8A7A70'}"/>`).join('')}
      ${[[120, 180], [240, 180], [360, 150], [640, 150], [760, 190], [880, 190], [430, 110], [570, 110]].map(([x, y]) => lantern(x, y, 1.1)).join('')}`,
    // 第四章：十分（鐵軌、天燈、黃昏山）
    shifen: () => sky('#F6A86A', '#F7C99A', '#F3E2C4') + `<circle cx="760" cy="180" r="60" fill="#FFE1A0" opacity=".8"/>
      <path d="M0 320 C150 220 300 260 420 220 C560 170 700 240 820 200 C900 180 960 210 1000 200 L1000 460 L0 460Z" fill="#7E9A72"/>
      <path d="M0 360 C200 300 380 340 560 300 C760 260 900 320 1000 300 L1000 470 L0 470Z" fill="#5E7E56"/>
      ${[[140, 120, '#FFF3C4'], [300, 80, '#FFE0A0'], [520, 60, '#FFF3C4'], [660, 110, '#FFD6A0'], [880, 70, '#FFF3C4']].map(([x, y, c]) => `<g transform="translate(${x} ${y})"><circle r="36" fill="url(#glow)" opacity=".6"/><path d="M-16 -22 L16 -22 L20 18 L-20 18Z" fill="${c}" stroke="#E8A050" stroke-width="2"/><path d="M-6 -10 v18 M6 -10 v18" stroke="#E8453C" stroke-width="2" opacity=".6"/><ellipse cx="0" cy="18" rx="8" ry="3" fill="#F2B33D"/></g>`).join('')}`
      + ground('#A89C88') + `<path d="M380 600 L470 470 L530 470 L620 600Z" fill="#8A7E6A"/>
      ${Array.from({ length: 8 }, (_, i) => { const y = 474 + i * i * 2.2 + i * 6, w = 70 + i * 34; return `<rect x="${500 - w / 2}" y="${y}" width="${w}" height="${4 + i}" fill="#6A4A32"/>`; }).join('')}
      <path d="M470 470 L380 600 M530 470 L620 600" stroke="#B8B8C0" stroke-width="6"/>
      <rect x="40" y="380" width="260" height="90" fill="#E9DCC0"/><path d="M30 384 L170 344 L310 384Z" fill="#8A4A3A"/><rect x="60" y="400" width="60" height="60" fill="#C9473E"/><rect x="150" y="400" width="130" height="40" fill="#FFE9A8"/>
      <rect x="720" y="400" width="240" height="70" fill="#E9DCC0"/><path d="M710 404 L840 370 L970 404Z" fill="#8A4A3A"/>`,
    // 第五章：台北 101（白天）
    taipei101: () => sky('#5FB0EC', '#B8DCF6', '#E4F0F6') + cloud(170, 120, 1.3) + cloud(820, 90) + cloud(640, 180, .7, .7)
      + `<g transform="translate(500 0)"><rect x="-6" y="20" width="12" height="70" fill="#7A9AA8"/>
        ${Array.from({ length: 8 }, (_, i) => { const y = 90 + i * 40; return `<path d="M-46 ${y} L46 ${y} L56 ${y + 40} L-56 ${y + 40}Z" fill="${i % 2 ? '#3E8E8A' : '#4AA0A0'}" stroke="#2E6E70" stroke-width="2"/><path d="M-40 ${y + 12} L40 ${y + 12}" stroke="#BDE6E6" stroke-width="3"/>`; }).join('')}
        <path d="M-60 410 L60 410 L80 470 L-80 470Z" fill="#3E8E8A"/><rect x="-36" y="70" width="72" height="20" fill="#4AA0A0"/></g>
      <rect x="120" y="300" width="120" height="170" fill="#9AB0BE"/><rect x="250" y="340" width="90" height="130" fill="#B4C4CE"/><rect x="660" y="320" width="110" height="150" fill="#A4B8C4"/><rect x="790" y="280" width="120" height="190" fill="#8EA6B6"/>
      ${[0, 1, 2, 3, 4, 5].map(i => win(135 + (i % 3) * 32, 320 + Math.floor(i / 3) * 40, 20, 24, '#E4F0F6')).join('')}${[0, 1, 2, 3, 4, 5].map(i => win(805 + (i % 3) * 34, 300 + Math.floor(i / 3) * 44, 22, 26, '#E4F0F6')).join('')}`
      + ground('#C4CCD0') + tree(60, 470, .8) + tree(950, 470, .8),
    // 第六章：淡水（夕陽河岸）
    tamsui: () => sky('#F28A5A', '#F7B880', '#FBD9A6') + `<circle cx="640" cy="300" r="70" fill="#FFE29A"/>
      <path d="M0 290 C140 250 260 270 380 240 C460 220 560 250 640 236 L640 330 L0 330Z" fill="#6A5A7A"/><path d="M560 250 C600 200 700 190 760 230 C820 200 900 210 1000 240 L1000 330 L560 330Z" fill="#7A6A8A"/>
      <rect y="320" width="1000" height="160" fill="#E8A070"/>${Array.from({ length: 10 }, (_, i) => `<path d="M${560 + (i % 3) * 30} ${330 + i * 14} h${80 - i * 4}" stroke="#FFE29A" stroke-width="4" opacity="${.8 - i * .06}"/>`).join('')}
      ${Array.from({ length: 6 }, (_, i) => `<path d="M${40 + i * 160} ${370 + (i % 2) * 30} q30 -8 60 0" stroke="#F7C08A" stroke-width="3" fill="none"/>`).join('')}`
      + ground('#B89A7A', 470) + `<rect y="470" width="1000" height="10" fill="#8A6A4A"/>
      ${[0, 1, 2, 3].map(i => `<g transform="translate(${90 + i * 230} 470)"><rect x="-70" y="-90" width="140" height="90" fill="#F3E3C6"/><path d="M-80 -86 L0 -120 L80 -86Z" fill="#9A4A3A"/><rect x="-60" y="-70" width="120" height="26" fill="${['#E8453C', '#2BA6A0', '#F2B33D', '#3E8ED0'][i]}"/><text x="0" y="-51" text-anchor="middle" font-size="16" font-weight="700" fill="#fff" font-family="Noto Sans TC,sans-serif">${['魚丸', '阿給', '鐵蛋', '魚酥'][i]}</text></g>`).join('')}`,
    // 第七章：西門町（夜、霓虹）
    ximen: () => sky('#1A1638', '#2E2458', '#4A2E6A') + stars(30, 7)
      + `<rect x="60" y="150" width="220" height="330" fill="#B8463A"/><path d="M60 150 L170 90 L280 150Z" fill="#8A2E28"/><rect x="100" y="120" width="140" height="40" fill="#B8463A"/><text x="170" y="210" text-anchor="middle" font-size="24" fill="#FFE9A8" font-family="Noto Serif TC,serif" font-weight="700">西門紅樓</text>
      ${[0, 1, 2].map(i => `<path d="M${90 + i * 60} 300 a20 20 0 0 1 40 0 v60 h-40Z" fill="#FFD48A" opacity=".8"/>`).join('')}
      <rect x="330" y="80" width="190" height="400" fill="#2E2A48"/><rect x="560" y="120" width="180" height="360" fill="#3A2E58"/><rect x="780" y="60" width="190" height="420" fill="#2A2A44"/>
      ${[['#FF5AA8', 'KTV', 360, 140], ['#5AE0FF', '電影', 600, 170], ['#F2E85A', '潮牌', 810, 120], ['#7CFF8A', '紋身', 360, 260], ['#FF8A3A', '鴨肉扁', 810, 260], ['#C88AFF', '夾娃娃', 600, 300]].map(([c, t, x, y]) => `<g><rect x="${x}" y="${y}" width="130" height="54" rx="10" fill="none" stroke="${c}" stroke-width="5"/><rect x="${x}" y="${y}" width="130" height="54" rx="10" fill="${c}" opacity=".12"/><text x="${x + 65}" y="${y + 37}" text-anchor="middle" font-size="26" fill="${c}" font-weight="700" font-family="Noto Sans TC,sans-serif">${t}</text></g>`).join('')}`
      + ground('#3A3448') + `<rect y="470" width="1000" height="8" fill="#5A5468"/>${[0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => `<rect x="${i * 120 + 10}" y="520" width="70" height="10" fill="#F2F2F2" opacity=".6"/>`).join('')}`,
    // 第八章：饒河夜市（廟＋牌樓＋攤位）
    nightmarket: () => sky('#141236', '#2A2052', '#3A2A5A') + stars(40, 11)
      + `<g transform="translate(500 0)"><rect x="-150" y="170" width="300" height="200" fill="#C9473E"/><path d="M-200 180 Q0 90 200 180 L180 196 Q0 120 -180 196Z" fill="#2E8A6A"/><path d="M-170 140 Q0 60 170 140" stroke="#F2B33D" stroke-width="8" fill="none"/>
        <rect x="-110" y="200" width="220" height="44" fill="#2A2230"/><text x="0" y="232" text-anchor="middle" font-size="26" fill="#F2B33D" font-family="Noto Serif TC,serif" font-weight="700">饒河街觀光夜市</text></g>
      ${Array.from({ length: 14 }, (_, i) => lantern(70 + i * 66, 130 + (i % 2) * 14, .8, i % 3 ? '#E8453C' : '#F2B33D')).join('')}
      ${[0, 1, 2, 3, 4, 5].map(i => `<g transform="translate(${80 + i * 170} 470)"><rect x="-70" y="-110" width="140" height="110" fill="#F5E8D0"/><rect x="-80" y="-130" width="160" height="26" fill="${['#E8453C', '#F2B33D', '#2BA6A0', '#3E8ED0', '#E86A8F', '#8A6ACF'][i]}"/><text x="0" y="-111" text-anchor="middle" font-size="16" font-weight="700" fill="#fff" font-family="Noto Sans TC,sans-serif">${['胡椒餅', '藥燉排骨', '蚵仔麵線', '臭豆腐', '大腸包小腸', '珍珠奶茶'][i]}</text><rect x="-60" y="-90" width="120" height="50" fill="#fff" opacity=".7"/><circle cx="-30" cy="-60" r="12" fill="#C8884A"/><circle cx="0" cy="-60" r="12" fill="#C8884A"/><circle cx="30" cy="-60" r="12" fill="#C8884A"/></g>`).join('')}`
      + ground('#4A3A48', 470),
    // 第九章：大安森林公園（夜，中央桌）
    forest: () => sky('#0E1A2A', '#1E3A3A', '#2A4A3A') + stars(80, 17) + `<circle cx="160" cy="90" r="30" fill="#FFF3C4"/>`
      + tree(60, 420, 1.4, '#2E6A4A', '#1E4A36') + tree(220, 400, 1.2, '#2E6A4A', '#1E4A36') + tree(800, 410, 1.3, '#2E6A4A', '#1E4A36') + tree(950, 420, 1.4, '#2E6A4A', '#1E4A36') + tree(660, 390, 1, '#2E6A4A', '#1E4A36')
      + ground('#2E4A36', 450) + `<ellipse cx="500" cy="520" rx="320" ry="60" fill="#3E5E44"/><circle cx="500" cy="440" r="160" fill="url(#glow)" opacity=".35"/>
      <rect x="360" y="440" width="280" height="22" rx="6" fill="#8A6A4A"/><rect x="380" y="462" width="16" height="70" fill="#6A4A32"/><rect x="604" y="462" width="16" height="70" fill="#6A4A32"/>
      <circle cx="410" cy="432" r="7" fill="#7EC8F0"/><circle cx="426" cy="434" r="6" fill="#F2B33D"/><rect x="450" y="420" width="44" height="20" fill="#F2D29A" stroke="#8A4A2A"/><rect x="510" y="424" width="30" height="16" rx="2" fill="#fff" stroke="#E8453C"/><rect x="560" y="420" width="20" height="20" rx="3" fill="#F5F0E0" stroke="#2BA6A0"/><rect x="584" y="420" width="20" height="20" rx="3" fill="#F5F0E0" stroke="#2BA6A0"/>
      ${[[300, 300], [700, 300], [500, 250]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3" fill="#FFF6A0"/><circle cx="${x}" cy="${y}" r="12" fill="#FFF6A0" opacity=".2"/>`).join('')}`,
    title: () => sky('#16203E', '#3A2E62', '#E8836A') + stars(60, 23) + `<circle cx="500" cy="560" r="300" fill="url(#glow)" opacity=".5"/>`
      + `<g transform="translate(500 0)" opacity=".85">${Array.from({ length: 8 }, (_, i) => { const y = 140 + i * 30; return `<path d="M-30 ${y} L30 ${y} L36 ${y + 30} L-36 ${y + 30}Z" fill="#2E4A6A"/>`; }).join('')}<rect x="-4" y="90" width="8" height="50" fill="#2E4A6A"/></g>`
      + `<path d="M0 470 C160 420 300 440 420 410 L580 410 C700 440 840 420 1000 470 L1000 600 L0 600Z" fill="#1E1A30"/>`
      + [[140, 200], [260, 150], [380, 230], [620, 230], [740, 150], [860, 200]].map(([x, y]) => lantern(x, y, 1)).join(''),
  };
  const svg = (k) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid slice">${(S[k] || S.title)().replace(/id="(sk|glow)"/g, `id="$1-${k}"`).replace(/url\(#(sk|glow)\)/g, `url(#$1-${k})`)}</svg>`;
  return { svg, keys: Object.keys(S) };
})();
