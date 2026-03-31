import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, collection, getDocs, onSnapshot, query, where, updateDoc, arrayUnion, runTransaction } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

const firebaseConfig = { apiKey: "AIzaSyDfaC7sWiz--IXnOQq9Qw0ICNDT8MpZE5o", authDomain: "solo-leveling-server.firebaseapp.com", projectId: "solo-leveling-server", storageBucket: "solo-leveling-server.firebasestorage.app", messagingSenderId: "979607975137", appId: "1:979607975137:web:70224f438280bafebf73a0", measurementId: "G-8E64C4CNSZ" };
const app = initializeApp(firebaseConfig); const db = getFirestore(app);

const SWORD_MODELS = {
    SWORD: `<svg class="weapon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14.5 3L21 9.5M10.5 7L17 13.5M3 21L11 13M10 21L12 19M19 10L21 8" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    DAGGER: `<svg class="weapon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 14L21 3M14 10L17 13" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    HEAVY: `<svg class="weapon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 3L21 6L6 21L3 18L18 3Z" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    SPEAR: `<svg class="weapon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 3L10 14L14 21L21 3ZM3 21L10 14" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    AXE: `<svg class="weapon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 10L3 21M14 10L21 3M14 10L21 17L17 21L10 14Z" stroke-linecap="round" stroke-linejoin="round"/></svg>`
};

const DB = {
    titles: {
        S: ["創世神：萬象起源", "虛空之王：秩序崩壞者", "因果律：命運編織者", "永恆傳說：不朽之冠", "唯一神：降臨之光"],
        A: ["位面守護者","不滅戰神","真理探求者","弒龍大師","諸神黃昏","至高審判長","永恆之光","極暗深淵","時空旅人","萬物生靈主","禁忌魔法師","聖靈大先知","絕對零度","戰場的主宰","混沌掌控者","劍之頂峰","傳奇奠基人","天災化身","銀河開拓者","靈魂收割者","帝國之牆","神聖制裁者","無極劍聖","末日執行官","破法領主"],
        B: ["大地粉碎者","蒼穹之眼","暗夜主宰","王國重臣","災厄終結者","巨龍獵人","戰地指揮官","聖殿執行官","幻影遊俠","秘法大師","鋼鐵要塞","風暴使徒","斷罪之刃","極限生存者","審判官","狂瀾追逐者","守護神盾","破曉之星","血色紅蓮","孤傲之狼","聖域守門人","虛空行者","戰鬥藝術家","王牌尖兵","無懼勇者","輝輝之刃","元素主導者","深淵監視者","重力主宰","鐵血領主"],
        C: ["前線突擊手","荒野獵手","鋼鐵意志","熟練冒險家","戰術小隊長","狂暴戰斧","影之追蹤者","銀翼先鋒","疾風劍士","元素感知者","守望先驅","烈焰行者","重裝步兵","沉默暗殺員","穿雲箭手","黎明守護者","符文操作員","鋼鐵守望","中堅力量","碎石者","極光使者","戰場齒輪","精銳士官","秘法學徒","獵魔小隊","不屈之魂","疾走之影","狂想曲員","寒冰操縱者","堅盾守衛"],
        D: ["村莊守望者","鐵鏽新秀","持劍平民","冒險初學者","見習騎士","準時下班員","小鎮地頭蛇","森林清道夫","略懂皮毛","憤怒的小鳥","正義路人","銅級傭兵","脫殼小龍","剛學會走路","基礎操縱者","先遣部隊","戰地記者","幸運生還者","武器試用員","略有小成","粗糙戰士","模仿大師","鐵打龍套","初級執行者","民間高手","熱血少年","頑強甲蟲","破舊皮甲魂","基礎訓練生","準準冒險者"],
        E: ["戰鬥力 0.5","走路草","實習砲灰","裝備回收員","迷路羔羊","萌新一號","戰場觀光客","史萊姆之友","甚至不是人類","呼吸也會累","落地成盒","走位靠賽","後勤搬運工","萬年候補生","塵埃邊緣人","訓練用假人","尚未覺醒","零戰力戰士","掃地阿伯","路人甲","雜草魂","無名小卒","勇者預備軍","體力廢材","眼神死菜鳥","邊緣雜魚","戰場背景板","脆弱靈魂","純潔無垢","剛下山傻子"]
    },
    swords: {
        UNKNOWN: [{name:"虛空之痕 · 零", desc:"系統管理員專屬，非賣品"}], 
        S: [{name:"天御·雷神切", desc:"連鎖閃電"}, {name:"冥王·枯萎之鐮", desc:"吸血 5%"}, {name:"時空·斷層", desc:"時間靜止"}, {name:"聖光·大領主", desc:"自帶護盾"}],
        A: ["龍脊長刀","碎星者","妖刀·村正","極光細劍","重力粉碎者","寒冰之咬","黑曜石巨劍","風靈疾走"],
        B: ["鋼鐵重刃","影殺短刀","獵人彎刀","符文長劍","烈焰直劍","毒牙匕首","騎士團佩劍","破甲刺劍","巨浪斬馬刀","守望者長槍","精準獵刀","閃爍之刃","荒野戰斧","密林獵手","沉重鐵鎚"],
        C: ["老練長劍","士兵佩刀","強化鐵劍","寬刃大刀","輕量化匕首","巡邏隊長劍","護衛手杖","鋒利切肉刀","雙手巨劍","練習用長刀","鐵製短劍","守城衛士槍","野外求生刀","礦工十字鎬","粗製大劍"],
        D: ["生鏽鐵片","磨損砍刀","舊式刺刀","木柄短劍","歪斜匕首","鈍掉菜刀","破損長槍","重鑄廢鐵","路邊小刀","脆弱竹劍","農用鐮刀","缺口佩刀","簡易長矛","粗糙斧頭","採集小鏟"],
        E: ["傳說木棒","削鉛筆刀","斷掉樹枝","生鏽圖釘","破爛鍋鏟","紙紮劍","髒掉抹布","塑膠玩具刀","爛掉傘骨","沒水原子筆","湯勺","雞毛撣子","小石塊","過期麵包","只有柄的劍"]
    },
    potions: [{id:"p_double",name:"🧪 雙倍經驗藥劑",price:350},{id:"p_time",name:"⏳ 時光沙漏",price:450},{id:"p_luck",name:"🍀 幸運四葉草",price:850},{id:"p_seven",name:"✨ 七葉草藥水",price:3500}],
    cloudGates: []
};

const StorageMgr = { get(k){try{return localStorage.getItem(k)}catch(e){return window.ts?window.ts[k]:null}}, set(k,v){try{localStorage.setItem(k,v)}catch(e){window.ts=window.ts||{};window.ts[k]=v}} };

const System = {
    p: null, shopCache: null, timerIdx: null, isAdminUnlocked: false, unsubWorld: null, unsubInvites: null,
    rankWeight: {'UNKNOWN':7,'S':6,'A':5,'B':4,'C':3,'D':2,'E':1},
    async login() {
        const acc=document.getElementById('inp-acc').value.trim(), pwd=document.getElementById('inp-pwd').value.trim();
        if(!acc||!pwd) return alert("請輸入 ID 與密碼！"); document.getElementById('btn-login').innerText="CONNECTING...";
        try {
            const ref=doc(db,"players",acc), snap=await getDoc(ref);
            if(snap.exists()){
                let d=snap.data(); if(d.pwd&&d.pwd!==pwd) { document.getElementById('btn-login').innerText="INITIALIZE"; return alert("密碼錯誤"); }
                this.p=d; if(!this.p.bag) this.p.bag={swords:[],potions:{},mats:{logic:0,lang:0,mem:0}}; if(!this.p.buffs) this.p.buffs={doubleXp:false,luck:false};
                if(!this.p.activeQuests) this.p.activeQuests=[]; if(this.p.partner===undefined) this.p.partner=null; if(!this.p.requests) this.p.requests=[];
            } else {
                this.p={acc,pwd,lv:1,exp:0,coins:0,sp:0,iq:1,str:1,mp:1,dex:1,titles:["尚未覺醒"],curTitle:"尚未覺醒",curWeapon:null,bag:{swords:[],potions:{},mats:{logic:0,lang:0,mem:0}},buffs:{doubleXp:false,luck:false},activeQuests:[],partner:null,requests:[]};
                await setDoc(ref,this.p);
            }
            document.getElementById('login-ui').style.display='none'; this.checkShopRefresh(); this.updateUI(); this.startHeartbeat(); this.listenForInvites(); this.startGlobalTimer(); this.fetchWorldGates();
        } catch(e) { alert("連線失敗") }
    },
    async save() { if(this.p){ try{const snap=await getDoc(doc(db,"players",this.p.acc)); if(snap.exists()){this.p.partner=snap.data().partner!==undefined?snap.data().partner:this.p.partner; this.p.requests=snap.data().requests||[];} await setDoc(doc(db,"players",this.p.acc),this.p)}catch(e){} } },
    nav(id,e) {
        document.querySelectorAll('.page').forEach(p=>p.classList.remove('active')); document.getElementById(id).classList.add('active');
        if(e){document.querySelectorAll('.nav-link').forEach(l=>l.classList.remove('active')); e.target.classList.add('active')}
        if(id==='p-world')this.renderWorld(); if(id==='p-dungeon'){this.fetchWorldGates();this.renderQuests()} if(id==='p-enhance')this.renderUpgrades();
        if(id==='p-titles')this.renderTitles(); if(id==='p-inventory')this.renderBag('sword'); if(id==='p-forge')this.renderForge();
        if(id==='p-shop'){if(!this.shopCache)this.checkShopRefresh();this.renderShop('sword')} if(id==='p-rank')this.renderLeaderboard();
        if(id==='p-partner')this.renderPartner(); if(id==='p-code'){ this.renderAdminPanel(); }
    },
    getMaxExp(lv){return lv<=30?100+(lv-1)*50:100+29*50+(lv-30)*100},
    getRank(lv){if(lv>=100)return{r:"國家級獵人",c:"rank-UNKNOWN"};if(lv>=71)return{r:"S-RANK HUNTER",c:"rank-S"};if(lv>=51)return{r:"A-RANK HUNTER",c:"rank-A"};if(lv>=36)return{r:"B-RANK HUNTER",c:"rank-B"};if(lv>=21)return{r:"C-RANK HUNTER",c:"rank-C"};if(lv>=11)return{r:"D-RANK HUNTER",c:"rank-D"};return{r:"E-RANK HUNTER",c:"rank-E"}},
    updateUI() {
        if(!this.p)return; document.getElementById('ui-name').innerText=this.p.acc; 
        if(document.getElementById('ui-lv'))document.getElementById('ui-lv').innerText=`LEVEL: ${this.p.lv}`;
        if(document.getElementById('ui-lv-big'))document.getElementById('ui-lv-big').innerText=this.p.lv;
        document.getElementById('ui-coins').innerText=`💰 ${Math.floor(this.p.coins)}`; document.getElementById('ui-sp').innerText=`剩餘點數: ${this.p.sp}`;
        document.getElementById('ui-title').innerText=`[ ${this.p.curTitle} ]`; document.getElementById('ui-weapon').innerText=this.p.curWeapon?`⚔️ ${this.p.curWeapon.name} [${this.p.curWeapon.rank}]`:"⚔️ 徒手";
        const ri=this.getRank(this.p.lv); if(document.getElementById('ui-rank')){document.getElementById('ui-rank').innerText=ri.r;document.getElementById('ui-rank').className=ri.c}
        const mx=this.getMaxExp(this.p.lv); document.getElementById('ui-xp-fill').style.width=`${Math.min((this.p.exp/mx)*100,100)}%`;
        document.getElementById('ui-xp-txt').innerText=`${Math.floor(this.p.exp)} / ${mx} XP`;
        let bS=0; if(this.p.curWeapon){if(this.p.curWeapon.rank==='B')bS=5;if(this.p.curWeapon.rank==='C')bS=3;if(this.p.curWeapon.rank==='D')bS=1}
        ['iq','str','mp','dex'].forEach(k=>{let d=this.p[k];if(k==='str'&&bS>0)d+=`<span class="stat-bonus">+${bS}</span>`;document.getElementById(`v-${k}`).innerHTML=d});
        let bh=""; if(this.p.buffs.doubleXp)bh+=`<span class="badge badge-buff">2x XP</span>`; if(this.p.buffs.luck)bh+=`<span class="badge badge-buff">幸運保底</span>`;
        if(this.p.partner)bh+=`<span class="badge badge-buff" style="border-color:var(--comrade-green);color:var(--comrade-green);">戰友 +10%</span>`;
        document.getElementById('buff-zone').innerHTML=bh; this.save();
    },
    showWeaponModel(w) {
        const ov=document.getElementById('weapon-preview-overlay'), ia=document.getElementById('wp-icon-area');
        document.getElementById('wp-name').innerText=w.name; const rt=document.getElementById('wp-rank-tag');
        rt.innerText=`${w.rank}-RANK`; rt.className=`rank-${w.rank}`; document.getElementById('wp-desc').innerText=w.desc||"這是一把注入魔力的兵器。";
        let c="#00d4ff"; if(w.rank==='S')c="#ffd700"; if(w.rank==='A')c="#bc13fe"; if(w.rank==='C'||w.rank==='D'||w.rank==='E')c="#aaaaaa"; if(w.rank==='UNKNOWN')c="#ff0055";
        const type=w.name.includes('匕')||w.name.includes('短')?'DAGGER':(w.name.includes('重')||w.name.includes('巨')||w.name.includes('大')?'HEAVY':(w.name.includes('槍')||w.name.includes('矛')?'SPEAR':'SWORD'));
        ia.innerHTML=SWORD_MODELS[type]; const svg=ia.querySelector('svg'); svg.style.color=c; svg.classList.add(`rank-${w.rank}`); ov.style.display='flex';
    },
    inspectCurrentWeapon(){if(this.p.curWeapon)this.showWeaponModel(this.p.curWeapon);else alert("徒手")},
    checkLevelUp(){let m=this.getMaxExp(this.p.lv);while(this.p.exp>=m){this.p.exp-=m;this.p.lv++;this.p.sp+=3;this.p.iq++;this.p.str++;this.p.mp++;this.p.dex++;if(this.p.lv<=50&&this.p.lv%2===0)this.drawTitle();m=this.getMaxExp(this.p.lv)}},
    drawTitle(){
        const r=Math.random()*100; let rk='E'; if(this.p.buffs.luck){if(r<5)rk='S';else if(r<25)rk='A';else rk='B';this.p.buffs.luck=false}else{if(r<0.5)rk='S';else if(r<2)rk='A';else if(r<20)rk='B';else if(r<40)rk='C';else if(r<65)rk='D'}
        const t=DB.titles[rk][Math.floor(Math.random()*DB.titles[rk].length)];
        if(!this.p.titles.includes(t)){this.p.titles.push(t);document.getElementById('gacha-msg').innerText="獲得新稱號"}else{this.p.coins+=500;document.getElementById('gacha-msg').innerText="重複轉為500蓮幣"}
        const gr=document.getElementById('gacha-result'); gr.innerText=t; gr.className=`gacha-glow rank-${rk}`; document.getElementById('gacha-pop').style.display='flex'; this.updateUI()
    },
    async fetchWorldGates(){try{const s=await getDoc(doc(db,"system","global_gates"));if(s.exists()&&s.data().active)DB.cloudGates=s.data().active;else DB.cloudGates=[];if(document.getElementById('p-dungeon').classList.contains('active'))this.renderWorldGates()}catch(e){}},
    renderWorldGates(){
        const a=document.getElementById('world-gates-list'); let h=""; if(DB.cloudGates.length===0){a.innerHTML="<div style='text-align:center;padding:20px;'>無任務</div>";return}
        const m=this.p.activeQuests.map(q=>q.globalId);
        DB.cloudGates.forEach(g=>{
            if(m.includes(g.id))return; let bt=""; if(g.bonus){if(g.bonus.type==='title')bt=`<span class="badge" style="color:var(--gold);border:1px solid var(--gold);">🎁 ${g.bonus.rank}級稱號</span>`;else if(g.bonus.type==='potion')bt=`<span class="badge" style="color:var(--blue);border:1px solid var(--blue);">🎁 藥水</span>`;else if(g.bonus.type==='mat')bt=`<span class="badge" style="color:var(--purple);border:1px solid var(--purple);">🎁 素材</span>`}
            h+=`<div class="card" style="border-left:3px solid var(--gold);"><div class="card-col"><strong style="color:var(--gold);">${g.sub}-${g.task}</strong><span style="font-size:11px;">${g.range}</span><div style="margin-top:5px;"><span style="color:var(--purple);">${g.xp}XP</span> ${bt}</div></div><button class="btn-action" style="background:var(--gold);color:#000;" onclick="System.acceptWorldGate(${g.id})">接取</button></div>`
        }); a.innerHTML=h||"無新任務";
    },
    async acceptWorldGate(id){const g=DB.cloudGates.find(x=>x.id===id);if(!g)return;this.p.activeQuests.push({id:Date.now(),globalId:g.id,sub:g.sub,task:g.task,range:g.range,xp:g.xp,readyAt:Date.now()+(g.time*60000),bonus:g.bonus});await this.save();this.renderWorldGates();this.renderQuests()},
    renderQuests(){
        let h=""; const n=Date.now();
        this.p.activeQuests.forEach(q=>{
            const r=!q.readyAt||n>=q.readyAt; let b=r?`<button class="btn-action" style="background:#00ff88;color:#000;" onclick="System.completeQuest(${q.id})">結算</button>`:`<button class="btn-action cooldown-timer" style="background:#222;" disabled data-until="${q.readyAt}">00:00</button>`;
            h+=`<div class="card" style="border-left:4px solid var(--blue);"><div class="card-col"><strong>${q.sub}-${q.task}</strong><span style="color:#888;font-size:11px;">${q.range} | ${q.xp}XP</span></div>${b}</div>`
        }); document.getElementById('active-quests-list').innerHTML=h||"無進行中任務";
    },
    startGlobalTimer(){if(this.timerIdx)clearInterval(this.timerIdx);this.timerIdx=setInterval(()=>{let nr=false;document.querySelectorAll('.cooldown-timer').forEach(el=>{const d=parseInt(el.dataset.until)-Date.now();if(d<=0)nr=true;else{const m=Math.floor(d/60000),s=Math.floor((d%60000)/1000);el.innerText=`${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`}});if(nr)this.renderQuests()},1000)},
    async completeQuest(id){
        const i=this.p.activeQuests.findIndex(q=>q.id===id);if(i===-1)return;const q=this.p.activeQuests[i];this.p.activeQuests.splice(i,1);
        let fx=q.xp, fc=q.xp; if(this.p.partner){fx=Math.floor(fx*1.1);fc=Math.floor(fc*1.1)}if(this.p.buffs.doubleXp){fx*=2;this.p.buffs.doubleXp=false}
        if(this.p.curWeapon){if(this.p.curWeapon.rank==='S'){fx=Math.floor(fx*1.2);fc=Math.floor(fc*1.5)}else if(this.p.curWeapon.rank==='A'){fx=Math.floor(fx*1.1);fc=Math.floor(fc*1.2)}}
        this.p.exp+=fx; this.p.coins+=fc; let m=`獲得 ${fx}XP 與 ${fc}蓮幣`;
        const rd=Math.random();if(rd<0.1){this.p.bag.mats.logic++;m+="\n🧩 邏輯碎片x1"}else if(rd<0.2){this.p.bag.mats.lang++;m+="\n📖 語文符文x1"}else if(rd<0.3){this.p.bag.mats.mem++;m+="\n🧠 記憶結晶x1"}
        if(q.bonus&&q.bonus.type){if(q.bonus.type==='title'){const t=DB.titles[q.bonus.rank][Math.floor(Math.random()*DB.titles[q.bonus.rank].length)];if(!this.p.titles.includes(t))this.p.titles.push(t);m+=`\n✨ 賞賜稱號：[${t}]`}else if(q.bonus.type==='potion'){this.p.bag.potions[q.bonus.id]=(this.p.bag.potions[q.bonus.id]||0)+1;m+=`\n🧪 賞賜藥水：${q.bonus.name}`}else if(q.bonus.type==='mat'){this.p.bag.mats[q.bonus.id]+=parseInt(q.bonus.amount);m+=`\n📦 賞賜素材：${q.bonus.name}x${q.bonus.amount}`}}
        alert(m);this.checkLevelUp();this.updateUI();this.renderWorldGates();this.renderQuests()
    },
    renderUpgrades(){document.getElementById('up-sp-display').innerText=this.p.sp;let h="";[{id:'iq',n:'IQ'},{id:'str',n:'STR'},{id:'mp',n:'MP'},{id:'dex',n:'DEX'}].forEach(s=>{h+=`<div class="card" style="border-left:3px solid var(--purple);"><div class="card-col"><strong>${s.n}</strong><span style="font-size:2rem;font-weight:900;">${this.p[s.id]}</span></div><button class="btn-action" style="font-size:1.5rem;width:45px;height:45px;" onclick="System.addStat('${s.id}')">+</button></div>`});document.getElementById('upgrade-list').innerHTML=h},
    addStat(id){if(this.p.sp>0){this.p[id]++;this.p.sp--;this.updateUI();this.renderUpgrades()}else alert('點數不足')},
    renderTitles(){let h="";['S','A','B','C','D','E'].forEach(r=>{h+=`<h2 class="section-title rank-${r}">${r}-RANK</h2>`;DB.titles[r].forEach(t=>{if(t==="🚫 卑鄙的作弊者")return;const u=this.p.titles.includes(t),is=this.p.curTitle===t;if(u)h+=`<div class="card ${is?'equipped':''}" onclick="System.equipTitle('${t}')"><strong><span class="rank-${r}">${t}</span></strong>${is?'<span style="color:var(--purple);font-size:10px;">裝備中</span>':''}</div>`;else h+=`<div class="card locked-title"><strong>${r==='S'?'???':t}</strong><span>未解鎖</span></div>`})});document.getElementById('titles-list').innerHTML=h},
    equipTitle(t){this.p.curTitle=t;this.updateUI();this.renderTitles()},
    checkShopRefresh(){const t=new Date().toLocaleDateString();let s=StorageMgr.get('sl_shop_v34');if(s){const p=JSON.parse(s);if(p.date===t){this.shopCache=p.data;document.getElementById('shop-time').innerText=t;return}}this.refreshShop(t,false)},
    refreshShop(t,f){
        let sh={swords:[],titles:[]};Object.keys(DB.swords).forEach(rk=>{DB.swords[rk].forEach(sw=>{let n=typeof sw==='object'?sw.name:sw,d=typeof sw==='object'?sw.desc:'',w=rk==='UNKNOWN'?'???':this.getWearRate(rk),p=rk==='UNKNOWN'?999999:0;if(rk!=='UNKNOWN'){let wf=parseFloat(w);if(rk==='S')p=Math.floor(10000*(10-wf));else if(rk==='A')p=Math.floor(Math.random()*5001)+10000;else if(rk==='B')p=Math.floor(Math.random()*1001)+4000;else if(rk==='C')p=Math.floor(Math.random()*1001)+3000;else if(rk==='D')p=Math.floor(Math.random()*1001)+2000;else p=Math.floor(Math.random()*1001)+1000}sh.swords.push({name:n,rank:rk,wear:w,desc:d,price:p})})});sh.swords.sort((a,b)=>this.rankWeight[b.rank]-this.rankWeight[a.rank]);
        for(let i=0;i<12;i++){const r=Math.random()*100;let rk='E';if(r<1.5)rk='S';else if(r<5)rk='A';else if(r<25)rk='B';else if(r<45)rk='C';else if(r<65)rk='D';let n=DB.titles[rk][Math.floor(Math.random()*DB.titles[rk].length)],p=rk==='S'?5000:rk==='A'?2500:rk==='B'?1000:rk==='C'?500:rk==='D'?200:100;sh.titles.push({name:n,rank:rk,price:p})}sh.titles.sort((a,b)=>this.rankWeight[b.rank]-this.rankWeight[a.rank]);
        this.shopCache=sh;StorageMgr.set('sl_shop_v34',JSON.stringify({date:t,data:sh}));document.getElementById('shop-time').innerText=f?'Refreshed':t;
    },
    getWearRate(r){const d=Math.random();return r==='S'?(0.5+d*4.5).toFixed(3):r==='A'?(5+d*10).toFixed(3):r==='B'?(20+d*5).toFixed(3):r==='C'?(30+d*10).toFixed(3):r==='D'?(45+d*10).toFixed(3):(70+d*20).toFixed(3)},
    renderShop(tab){
        if(!this.shopCache)this.checkShopRefresh();['sword','potion','title'].forEach(t=>{const b=document.getElementById(`tab-${t}`);if(b){b.style.background=t===tab?'var(--purple)':'#222';b.style.color=t===tab?'#fff':'#888'}});
        let h="";if(tab==='sword'){this.shopCache.swords.forEach((s,i)=>{let sp=s.rank==='UNKNOWN'?'border:1px solid #f05':(s.rank==='S'?'border:1px solid var(--gold)':'');h+=`<div class="card" style="${sp}"><div class="card-col" onclick='System.showWeaponModel(${JSON.stringify(s)})'><strong class="rank-${s.rank}">${s.name}</strong><span style="font-size:10px;color:#888;">磨損: ${s.wear}%</span></div><button class="btn-action" ${s.rank==='UNKNOWN'?'disabled':''} onclick="System.buyShop('sword',${i})">${s.rank==='UNKNOWN'?'非賣品':'💰 '+s.price}</button></div>`})}
        else if(tab==='potion'){DB.potions.forEach(p=>{h+=`<div class="card"><div class="card-col"><strong>${p.name}</strong></div><button class="btn-action" onclick="System.buyPotion('${p.id}',${p.price})">💰 ${p.price}</button></div>`})}
        else{this.shopCache.titles.forEach((t,i)=>{const o=this.p.titles.includes(t.name);h+=`<div class="card"><div class="card-col"><strong class="rank-${t.rank}">${t.name}</strong></div><button class="btn-action" ${o?'disabled':''} onclick="System.buyShop('title',${i})">${o?'已解鎖':'💰 '+t.price}</button></div>`})}document.getElementById('shop-list').innerHTML=h;
    },
    buyShop(t,i){
        const it=this.shopCache[`${t}s`][i]; 
        if(it.rank==='UNKNOWN') return alert("這是非賣品！");
        if(this.p.coins>=it.price){
            if(t==='title'){this.p.titles.push(it.name)}else{const newItem=Object.assign({},it); newItem.id=Date.now(); this.p.bag.swords.push(newItem)}
            this.p.coins-=it.price; alert("購買成功"); this.updateUI(); this.renderShop(t);
        } else alert("餘額不足");
    },
    buyPotion(id,pr){if(this.p.coins>=pr){this.p.coins-=pr;this.p.bag.potions[id]=(this.p.bag.potions[id]||0)+1;this.updateUI();alert("購買成功")}else alert("餘額不足")},
    renderBag(tab){
        ['sword','potion','mat'].forEach(t=>{const b=document.getElementById(`bag-tab-${t}`);if(b){b.style.background=t===tab?'var(--purple)':'#222';b.style.color=t===tab?'#fff':'#888'}});
        let h="";if(tab==='sword'){this.p.bag.swords.forEach(s=>{const is=this.p.curWeapon&&this.p.curWeapon.id===s.id;h+=`<div class="card ${is?'equipped':''}"><div class="card-col" onclick='System.showWeaponModel(${JSON.stringify(s)})'><strong class="rank-${s.rank}">${s.name}</strong><small>磨損: ${s.wear}%</small></div><button class="btn-action" onclick="System.equipWeapon(${s.id})">${is?'卸下':'裝備'}</button></div>`})}
        else if(tab==='potion'){DB.potions.forEach(p=>{let a=this.p.bag.potions[p.id]||0;if(a>0)h+=`<div class="card"><div><strong>${p.name} x${a}</strong></div><button class="btn-action" onclick="System.usePotion('${p.id}')">使用</button></div>`})}
        else{h=`<div class="card"><strong>邏輯碎片</strong><span>${this.p.bag.mats.logic}</span></div><div class="card"><strong>語文符文</strong><span>${this.p.bag.mats.lang}</span></div><div class="card"><strong>記憶結晶</strong><span>${this.p.bag.mats.mem}</span></div>`}document.getElementById('bag-list').innerHTML=h||"空";
    },
    equipWeapon(id){if(this.p.curWeapon&&this.p.curWeapon.id===id)this.p.curWeapon=null;else this.p.curWeapon=this.p.bag.swords.find(s=>s.id===id);this.updateUI();this.renderBag('sword')},
    usePotion(id){if(this.p.bag.potions[id]>0){this.p.bag.potions[id]--;if(id==='p_double')this.p.buffs.doubleXp=true;else if(id==='p_time')this.refreshShop(new Date().toLocaleDateString(),true);else if(id==='p_luck')this.p.buffs.luck=true;else if(id==='p_seven')this.openSevenCloverModal();this.updateUI();this.renderBag('potion')}},
    openSevenCloverModal(){let h="";DB.titles['A'].forEach(t=>{const o=this.p.titles.includes(t);h+=`<div class="card"><strong>${t}</strong><button class="btn-action" ${o?'disabled':''} onclick="System.pickATitle('${t}')">選擇</button></div>`});document.getElementById('seven-clover-list').innerHTML=h;document.getElementById('seven-clover-modal').style.display='flex'},
    pickATitle(t){this.p.titles.push(t);this.p.curTitle=t;document.getElementById('seven-clover-modal').style.display='none';this.updateUI()},
    renderForge(){
        document.getElementById('forge-m-logic').innerText=this.p.bag.mats.logic;document.getElementById('forge-m-lang').innerText=this.p.bag.mats.lang;document.getElementById('forge-m-mem').innerText=this.p.bag.mats.mem;
        let h="";this.p.bag.swords.forEach(s=>{let r=s.rank==='S'?7:s.rank==='A'?3:1,c=this.p.bag.mats.logic>=r&&this.p.bag.mats.lang>=r&&this.p.bag.mats.mem>=r;h+=`<div class="card" style="flex-direction:column;align-items:flex-start;"><div style="width:100%;display:flex;justify-content:space-between;"><strong>${s.name}</strong><span>磨損: ${s.wear}%</span></div><div style="width:100%;display:flex;justify-content:space-between;margin-top:5px;"><small>消耗各碎片 x${r}</small><button class="btn-action" ${c?'':'disabled'} onclick="System.forgeWeapon(${s.id},'${s.rank}',${r})">修復</button></div></div>`});document.getElementById('forge-list').innerHTML=h||"無裝備";
    },
    forgeWeapon(id,rk,r){this.p.bag.mats.logic-=r;this.p.bag.mats.lang-=r;this.p.bag.mats.mem-=r;let sw=this.p.bag.swords.find(w=>w.id===id),rd=rk==='S'?(1+Math.random()*0.5):(1+Math.random()*2),nw=parseFloat(sw.wear)-rd;if(nw<0)nw=0;sw.wear=nw.toFixed(3);if(this.p.curWeapon&&this.p.curWeapon.id===id)this.p.curWeapon.wear=sw.wear;alert(`成功修復 ${rd.toFixed(3)}%`);this.save();this.renderForge()},
    async renderLeaderboard(){const e=document.getElementById('leaderboard-list');e.innerHTML="讀取中...";try{const s=await getDocs(collection(db,"players"));let d=[];s.forEach(x=>d.push(x.data()));d.sort((a,b)=>b.lv-a.lv||b.exp-a.exp);let h="";d.forEach((x,i)=>{h+=`<div class="card"><div class="rank-badge">${i+1}</div><div class="card-col"><strong>${x.acc}</strong><br><small>Lv.${x.lv} [${x.curTitle}]</small></div></div>`});e.innerHTML=h}catch(err){e.innerHTML="失敗"}},
    async renderPartner(){
        const e=document.getElementById('partner-status-area');e.innerHTML="連線中...";try{const s=await getDoc(doc(db,"players",this.p.acc));this.p=s.data();let h="";
        if(this.p.partner){const ps=await getDoc(doc(db,"players",this.p.partner));if(ps.exists()){let d=ps.data();h=`<div class="card" style="flex-direction:column;border-color:var(--comrade-green);"><h3>${d.acc}</h3><p>Lv.${d.lv}</p><button class="btn-action" style="background:var(--red-alert)" onclick="System.breakPact()">解除契約</button></div>`}else{h=`<button onclick="System.breakPact()">重置狀態</button>`}}
        else{h=`<div style="padding:10px;"><input id="inp-p-req" style="width:100%;padding:10px;margin-bottom:5px;" placeholder="ID..."><button class="btn-action" style="width:100%" onclick="System.sendPactReq()">發送</button></div>`;this.p.requests.forEach(r=>{h+=`<div class="card"><strong>${r}</strong><button onclick="System.acceptPact('${r}')">同意</button></div>`})}e.innerHTML=h}catch(err){e.innerHTML="失敗"}
    },
    async sendPactReq(){const t=document.getElementById('inp-p-req').value.trim();const r=doc(db,"players",t),s=await getDoc(r);if(s.exists()){let d=s.data();d.requests=d.requests||[];d.requests.push(this.p.acc);await setDoc(r,d);alert("已發送")}else alert("無此人")},
    async acceptPact(t){const r=doc(db,"players",t),s=await getDoc(r);if(s.exists()){let d=s.data();d.partner=this.p.acc;await setDoc(r,d)}this.p.partner=t;this.p.requests=this.p.requests.filter(x=>x!==t);await this.save();this.updateUI();this.renderPartner()},
    async breakPact(){if(this.p.partner){const r=doc(db,"players",this.p.partner),s=await getDoc(r);if(s.exists()){let d=s.data();d.partner=null;await setDoc(r,d)}}this.p.partner=null;await this.save();this.updateUI();this.renderPartner()},
    
    // 👑 終極上帝控制台：保底修復，保證選單不再空
    verifyAdmin(){if(document.getElementById('inp-admin-pwd').value==='Ricky_0414'){this.isAdminUnlocked=true;document.getElementById('admin-login').style.display='none';document.getElementById('admin-panel').style.display='flex';this.renderAdminPanel()}else alert("密碼錯誤")},
    renderAdminPanel(){
        // 渲染基礎數值
        ['lv','coins','sp','iq','str','mp','dex'].forEach(k=>{
            const el = document.getElementById(`adm-${k}`);
            if(el) el.value = Math.floor(this.p[k]);
        });
        
        // 🔥 核心修復：強制重新生成武器選單
        let sOpt="<option value=''>--選擇武具--</option>";
        Object.keys(DB.swords).forEach(rk=>{
            sOpt+=`<optgroup label="${rk}-RANK">`;
            DB.swords[rk].forEach(x=>{
                let name = typeof x==='object'?x.name:x;
                sOpt+=`<option value="${rk}|${name}">${name}</option>`;
            });
            sOpt+=`</optgroup>`;
        });
        document.getElementById('adm-sel-sword').innerHTML = sOpt;

        // 🔥 核心修復：強制重新生成稱號選單
        let tOpt="<option value=''>--選擇稱號--</option>";
        Object.keys(DB.titles).forEach(rk=>{
            tOpt+=`<optgroup label="${rk}-RANK">`;
            DB.titles[rk].forEach(titleName=>{
                tOpt+=`<option value="${titleName}">${titleName}</option>`;
            });
            tOpt+=`</optgroup>`;
        });
        document.getElementById('adm-sel-title').innerHTML = tOpt;
    },
    async adminSetStats(){let t=document.getElementById('adm-target').value.trim();let d={};['lv','coins','sp','iq','str','mp','dex'].forEach(k=>d[k]=parseInt(document.getElementById(`adm-${k}`).value)||1);d.exp=this.getMaxExp(d.lv-1);if(!t||t===this.p.acc){Object.assign(this.p,d);this.updateUI(); alert("自定義完成")}else{const r=doc(db,"players",t),s=await getDoc(r);if(s.exists()){let td=s.data();Object.assign(td,d);await setDoc(r,td);alert("修改同學成功")}}},
    async adminGiveSword(){
        const v=document.getElementById('adm-sel-sword').value; if(!v) return alert("請選擇武器");
        const p=v.split('|'),tg=DB.swords[p[0]].find(x=>(typeof x==='object'?x.name:x)===p[1]);
        const it={id:Date.now(),name:p[1],rank:p[0],wear:'0.000',desc:typeof tg==='object'?tg.desc:'',price:0};
        let t=document.getElementById('adm-target').value.trim();
        if(!t||t===this.p.acc){this.p.bag.swords.push(it);this.updateUI();alert("已放入背包")}
        else{const r=doc(db,"players",t),s=await getDoc(r);if(s.exists()){let td=s.data();td.bag.swords.push(it);await setDoc(r,td);alert("已發送給同學")}}
    },
    async adminGiveTitle(){
        const v=document.getElementById('adm-sel-title').value; if(!v) return alert("請選擇稱號");
        let t=document.getElementById('adm-target').value.trim();
        if(!t||t===this.p.acc){ if(!this.p.titles.includes(v))this.p.titles.push(v); this.updateUI();alert("稱號已解鎖") }
        else{const r=doc(db,"players",t),s=await getDoc(r);if(s.exists()){let td=s.data();if(!td.titles.includes(v))td.titles.push(v);await setDoc(r,td);alert("同學稱號已解鎖")}}
    },
    async adminGiveMats(){let t=document.getElementById('adm-target').value.trim();if(!t||t===this.p.acc){this.p.bag.mats.logic+=100;this.p.bag.mats.lang+=100;this.p.bag.mats.mem+=100;this.updateUI()}else{const r=doc(db,"players",t),s=await getDoc(r);if(s.exists()){let td=s.data();td.bag.mats.logic+=100;td.bag.mats.lang+=100;td.bag.mats.mem+=100;await setDoc(r,td)}}alert("素材已發放")},
    async adminGivePotions(){let t=document.getElementById('adm-target').value.trim();if(!t||t===this.p.acc){['p_double','p_time','p_luck','p_seven'].forEach(id=>this.p.bag.potions[id]=(this.p.bag.potions[id]||0)+10);this.updateUI()}else{const r=doc(db,"players",t),s=await getDoc(r);if(s.exists()){let td=s.data();['p_double','p_time','p_luck','p_seven'].forEach(id=>td.bag.potions[id]=(td.bag.potions[id]||0)+10);await setDoc(r,td)}}alert("藥水已發放")},
    async adminPunish(){const t=document.getElementById('adm-target').value.trim();if(!t)return alert("請輸入目標ID");const r=doc(db,"players",t),s=await getDoc(r);if(s.exists()){let d=s.data();d.lv=1;d.exp=0;d.coins=0;d.sp=0;d.curTitle="🚫 卑鄙的作弊者";d.titles=["🚫 卑鄙的作弊者"];d.curWeapon=null;d.bag={swords:[],potions:{},mats:{logic:0,lang:0,mem:0}};await setDoc(r,d);alert("天罰執行完成")}}else{alert("找不到目標")},
    
    startHeartbeat(){const b=()=>{updateDoc(doc(db,"players",this.p.acc),{lastSeen:Date.now()})};b();setInterval(b,30000)},
    async renderWorld(){
        const a=document.getElementById('online-list');if(this.unsubWorld)this.unsubWorld();
        this.unsubWorld=onSnapshot(collection(db,"players"),(sn)=>{let h="";sn.forEach(d=>{const x=d.data();if(x.acc===this.p.acc||x.acc==='admin')return;const on=x.lastSeen&&(Date.now()-x.lastSeen<65000);h+=`<div class="card"><div><span class="status-dot ${on?'dot-online':'dot-offline'}"></span><strong>${x.acc}</strong> <small>Lv.${x.lv}</small></div>${on?`<button class="btn-action" onclick="TradeSystem.startTrade('${x.acc}')">交易</button>`:'<small style="color:#444">離線</small>'}</div>`});a.innerHTML=h});
    },
    listenForInvites(){
        if(this.unsubInvites)this.unsubInvites();
        this.unsubInvites=onSnapshot(query(collection(db,"trades"),where("target","==",this.p.acc),where("status","==","pending")),(sn)=>{
            sn.docChanges().forEach(c=>{if(c.type==="added"){const d=c.doc.data();if(TradeSystem.cti===c.doc.id)return;setTimeout(()=>{if(confirm(`[${d.sender}] 請求交易？`)){TradeSystem.joinTrade(c.doc.id,d)}else{updateDoc(doc(db,"trades",c.doc.id),{status:"rejected"})}},100)}})
        })
    }
};

const TradeSystem = {
    cti: null, ut: null, ci: null, cs: 5, ie: false,
    async startTrade(t){const id=`trade_${Date.now()}`,d={id,sender:System.p.acc,target:t,status:"pending",offerA:{coins:0,items:[]},offerB:{coins:0,items:[]},readyA:false,readyB:false,chat:[]};await setDoc(doc(db,"trades",id),d);this.joinTrade(id,d)},
    joinTrade(id,d){
        this.cti=id;this.ie=false;document.getElementById('trade-overlay').style.display='flex';document.getElementById('peer-name-label').innerText=d.sender===System.p.acc?d.target:d.sender;this.buildSel();
        if(this.ut)this.ut();this.ut=onSnapshot(doc(db,"trades",id),async(s)=>{
            if(!s.exists())return this.cancel();const x=s.data();
            if(x.status==="rejected"){alert("中斷");this.cancel()}if(x.status==="completed"){alert("成功");System.p=(await getDoc(doc(db,"players",System.p.acc))).data();System.updateUI();this.cancel()}
            if(x.status==="pending")this.render(x);
        })
    },
    buildSel(){
        let sl=document.getElementById('trade-item-select'),h="<option value=''>--選擇物品--</option>";
        System.p.bag.swords.forEach(s=>h+=`<option value="s|${s.id}">${s.name}</option>`);
        ['logic','lang','mem'].forEach(m=>{if(System.p.bag.mats[m]>0)h+=`<option value="m|${m}">${m==='logic'?'邏輯碎片':m==='lang'?'語文符文':'記憶結晶'}</option>`});sl.innerHTML=h;
    },
    async addItemToOffer(){
        const v=document.getElementById('trade-item-select').value;if(!v)return;const d=(await getDoc(doc(db,"trades",this.cti))).data(),is=System.p.acc===d.sender,my=is?d.offerA:d.offerB,p=v.split('|');
        if(p[0]==='s'){let it=System.p.bag.swords.find(x=>x.id===parseInt(p[1]));if(it&&!my.items.find(x=>x.id===it.id))my.items.push(it)}
        else{let n=p[1]==='logic'?'邏輯碎片':p[1]==='lang'?'語文符文':'記憶結晶',ex=my.items.find(x=>x.id===p[1]);if(ex){if(ex.amt<System.p.bag.mats[p[1]])ex.amt++}else my.items.push({id:p[1],type:'mat',name:n,amt:1})}
        updateDoc(doc(db,"trades",this.cti),is?{"offerA.items":my.items,readyA:false,readyB:false}:{"offerB.items":my.items,readyA:false,readyB:false});document.getElementById('trade-item-select').value="";
    },
    render(d){
        const is=System.p.acc===d.sender,my=is?d.offerA:d.offerB,pe=is?d.offerB:d.offerA,mr=is?d.readyA:d.readyB,pr=is?d.readyB:d.readyA,b=document.getElementById('btn-confirm-trade');
        document.getElementById('my-offer-list').innerHTML=`💰 ${my.coins}<br>`+my.items.map(i=>`[${i.name}${i.amt?'x'+i.amt:''}]`).join('<br>');
        document.getElementById('peer-offer-list').innerHTML=`💰 ${pe.coins}<br>`+pe.items.map(i=>`[${i.name}${i.amt?'x'+i.amt:''}]`).join('<br>');
        document.getElementById('peer-ready-status').innerText=pr?"🟢 就緒":"⚪ 等待";
        if(d.readyA&&d.readyB){
            if(!this.ci&&!this.ie){this.cs=5;b.innerText=`${this.cs}s`;b.disabled=true;this.ci=setInterval(()=>{this.cs--;b.innerText=`${this.cs}s`;if(this.cs<=0){clearInterval(this.ci);this.ci=null;if(is&&!this.ie){this.ie=true;this.ex(d)}}},1000)}
        }else{if(this.ci){clearInterval(this.ci);this.ci=null}b.disabled=false;b.innerText=mr?"等待對方":"確認"}
        const ch=document.getElementById('trade-chat');ch.innerHTML=d.chat.map(m=>`<div>${m.user}: ${m.msg}</div>`).join('');ch.scrollTop=ch.scrollHeight;
    },
    async updateOffer(){const c=parseInt(document.getElementById('trade-coin-input').value)||0;if(c>System.p.coins)return alert("錢不夠");const d=(await getDoc(doc(db,"trades",this.cti))).data(),is=System.p.acc===d.sender;updateDoc(doc(db,"trades",this.cti),is?{"offerA.coins":c,readyA:false,readyB:false}:{"offerB.coins":c,readyA:false,readyB:false})},
    async confirmReady(){const d=(await getDoc(doc(db,"trades",this.cti))).data(),is=System.p.acc===d.sender;updateDoc(doc(db,"trades",this.cti),is?{readyA:true}:{readyB:true})},
    sendChat(){const i=document.getElementById('trade-msg-input'),m=i.value.trim();if(m){updateDoc(doc(db,"trades",this.cti),{chat:arrayUnion({user:System.p.acc,msg:m})});i.value=""}},
    cancel(){if(this.ci){clearInterval(this.ci);this.ci=null}if(this.cti)updateDoc(doc(db,"trades",this.cti),{status:"rejected"});if(this.ut)this.ut();this.cti=null;document.getElementById('trade-overlay').style.display='none'},
    async ex(d){
        try{await runTransaction(db,async(t)=>{
            const rA=doc(db,"players",d.sender),rB=doc(db,"players",d.target),rT=doc(db,"trades",d.id),sT=await t.get(rT);
            if(sT.data().status!=="pending")throw "已結算";const uA=(await t.get(rA)).data(),uB=(await t.get(rB)).data();
            if(uA.coins<d.offerA.coins||uB.coins<d.offerB.coins)throw "錢不夠";
            uA.coins=uA.coins-d.offerA.coins+d.offerB.coins; uB.coins=uB.coins-d.offerB.coins+d.offerA.coins;
            d.offerA.items.forEach(i=>{if(i.type==='mat'){uA.bag.mats[i.id]-=i.amt;uB.bag.mats[i.id]+=i.amt}else{uA.bag.swords=uA.bag.swords.filter(s=>s.id!==i.id);uB.bag.swords.push(i);if(uA.curWeapon&&uA.curWeapon.id===i.id)uA.curWeapon=null}});
            d.offerB.items.forEach(i=>{if(i.type==='mat'){uB.bag.mats[i.id]-=i.amt;uA.bag.mats[i.id]+=i.amt}else{uB.bag.swords=uB.bag.swords.filter(s=>s.id!==i.id);uA.bag.swords.push(i);if(uB.curWeapon&&uB.curWeapon.id===i.id)uB.curWeapon=null}});
            t.update(rA,uA);t.update(rB,uB);t.update(rT,{status:"completed"})
        })}catch(e){if(e!=="已結算")alert(e);this.cancel()}
    }
};

window.System=System; window.TradeSystem=TradeSystem;