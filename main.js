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

// 🔥 利用 .split() 大幅壓縮字數，保證代碼不中斷
const DB = {
    titles: {
        S: "創世神：萬象起源,虛空之王：秩序崩壞者,因果律：命運編織者,永恆傳說：不朽之冠,唯一神：降臨之光".split(","),
        A: "位面守護者,不滅戰神,真理探求者,弒龍大師,諸神黃昏,至高審判長,永恆之光,極暗深淵,時空旅人,萬物生靈主,禁忌魔法師,聖靈大先知,絕對零度,戰場的主宰,混沌掌控者,劍之頂峰,傳奇奠基人,天災化身,銀河開拓者,靈魂收割者,帝國之牆,神聖制裁者,無極劍聖,末日執行官,破法領主".split(","),
        B: "大地粉碎者,蒼穹之眼,暗夜主宰,王國重臣,災厄終結者,巨龍獵人,戰地指揮官,聖殿執行官,幻影遊俠,秘法大師,鋼鐵要塞,風暴使徒,斷罪之刃,極限生存者,審判官,狂瀾追逐者,守護神盾,破曉之星,血色紅蓮,孤傲之狼,聖域守門人,虛空行者,戰鬥藝術家,王牌尖兵,無懼勇者,輝煌之刃,元素主導者,深淵監視者,重力主宰,鐵血領主".split(","),
        C: "前線突擊手,荒野獵手,鋼鐵意志,熟練冒險家,戰術小隊長,狂暴戰斧,影之追蹤者,銀翼先鋒,疾風劍士,元素感知者,守望先驅,烈焰行者,重裝步兵,沉默暗殺員,穿雲箭手,黎明守護者,符文操作員,鋼鐵守望,中堅力量,碎石者,極光使者,戰場齒輪,精銳士官,秘法學徒,獵魔小隊,不屈之魂,疾走之影,狂想曲員,寒冰操縱者,堅盾守衛".split(","),
        D: "村莊守望者,鐵鏽新秀,持劍平民,冒險初學者,見習騎士,準時下班員,小鎮地頭蛇,森林清道夫,略懂皮毛,憤怒的小鳥,正義路人,銅級傭兵,脫殼小龍,剛學會走路,基礎操縱者,先遣部隊,戰地記者,幸運生還者,武器試用員,略有小成,粗糙戰士,模仿大師,鐵打龍套,初級執行者,民間高手,熱血少年,頑強甲蟲,破舊皮甲魂,基礎訓練生,準準冒險者".split(","),
        E: "戰鬥力 0.5,走路草,實習砲灰,裝備回收員,迷路羔羊,萌新一號,戰場觀光客,史萊姆之友,甚至不是人類,呼吸也會累,落地成盒,走位靠賽,後勤搬運工,萬年候補生,塵埃邊緣人,訓練用假人,尚未覺醒,零戰力戰士,掃地阿伯,路人甲,雜草魂,無名小卒,勇者預備軍,體力廢材,眼神死菜鳥,邊緣雜魚,戰場背景板,脆弱靈魂,純潔無垢,剛下山的傻子".split(",")
    },
    swords: {
        UNKNOWN: [{name:"虛空之痕 · 零", desc:"非賣品"}], 
        S: [{name:"天御·雷神切", desc:"連鎖閃電"}, {name:"冥王·枯萎之鐮", desc:"吸血 5%"}, {name:"時空·斷層", desc:"時間靜止"}, {name:"聖光·大領主", desc:"自帶護盾"}],
        A: "龍脊長刀,碎星者,妖刀·村正,極光細劍,重力粉碎者,寒冰之咬,黑曜石巨劍,風靈疾走".split(","),
        B: "鋼鐵重刃,影殺短刀,獵人彎刀,符文長劍,烈焰直劍,毒牙匕首,騎士團佩劍,破甲刺劍,巨浪斬馬刀,守望者長槍,精準獵刀,閃爍之刃,荒野戰斧,密林獵手,沉重鐵鎚".split(","),
        C: "老練長劍,士兵佩刀,強化鐵劍,寬刃大刀,輕量化匕首,巡邏隊長劍,護衛手杖,鋒利切肉刀,雙手巨劍,練習用長刀,鐵製短劍,守城衛士槍,野外求生刀,礦工十字鎬,粗製大劍".split(","),
        D: "生鏽鐵片,磨損砍刀,舊式刺刀,木柄短劍,歪斜匕首,鈍掉菜刀,破損長槍,重鑄廢鐵,路邊小刀,脆弱竹劍,農用鐮刀,缺口佩刀,簡易長矛,粗糙斧頭,採集小鏟".split(","),
        E: "傳說木棒,削鉛筆刀,斷掉樹枝,生鏽圖釘,破爛鍋鏟,紙紮劍,髒掉抹布,塑膠玩具刀,爛掉傘骨,沒水原子筆,湯勺,雞毛撣子,小石塊,過期的麵包,只有柄的劍".split(",")
    },
    potions: [{id:"p_double",name:"🧪 雙倍經驗藥劑",price:350},{id:"p_time",name:"⏳ 時光沙漏",price:450},{id:"p_luck",name:"🍀 幸運四葉草",price:850},{id:"p_seven",name:"✨ 七葉草藥水",price:3500}],
    cloudGates: []
};

const StorageMgr = { get(k){try{return localStorage.getItem(k)}catch(e){return null}}, set(k,v){try{localStorage.setItem(k,v)}catch(e){}} };

const System = {
    p: null, shopCache: null, timerIdx: null, isAdminUnlocked: false, unsubWorld: null, unsubInvites: null,
    rankWeight: {'UNKNOWN':7,'S':6,'A':5,'B':4,'C':3,'D':2,'E':1},
    
    async login() {
        const accEl = document.getElementById('inp-acc'); const pwdEl = document.getElementById('inp-pwd');
        if(!accEl || !pwdEl) return;
        const acc = accEl.value.trim(), pwd = pwdEl.value.trim();
        if(!acc || !pwd) return alert("請輸入 ID 與密碼！"); 
        
        document.getElementById('btn-login').innerText = "CONNECTING...";
        try {
            const ref = doc(db, "players", acc); const snap = await getDoc(ref);
            if(snap.exists()){
                let d = snap.data(); if(d.pwd && d.pwd !== pwd) { document.getElementById('btn-login').innerText = "INITIALIZE"; return alert("密碼錯誤"); }
                this.p = d; 
                if(!this.p.bag) this.p.bag = {swords:[],potions:{},mats:{logic:0,lang:0,mem:0}};
                if(!this.p.buffs) this.p.buffs = {doubleXp:false,luck:false};
                if(!this.p.activeQuests) this.p.activeQuests = [];
                if(this.p.partner === undefined) this.p.partner = null;
                if(!this.p.requests) this.p.requests = [];
            } else {
                this.p = {acc,pwd,lv:1,exp:0,coins:0,sp:0,iq:1,str:1,mp:1,dex:1,titles:["尚未覺醒"],curTitle:"尚未覺醒",curWeapon:null,bag:{swords:[],potions:{},mats:{logic:0,lang:0,mem:0}},buffs:{doubleXp:false,luck:false},activeQuests:[],partner:null,requests:[]};
                await setDoc(ref, this.p);
            }
            document.getElementById('login-ui').style.display = 'none'; 
            this.checkShopRefresh(); this.updateUI(); this.startHeartbeat(); this.listenForInvites(); this.startGlobalTimer(); this.fetchWorldGates();
        } catch(e) { alert("連線失敗"); document.getElementById('btn-login').innerText = "INITIALIZE"; }
    },
    async save() { if(this.p){ try{ await setDoc(doc(db,"players",this.p.acc),this.p)}catch(e){} } },
    nav(id,e) {
        document.querySelectorAll('.page').forEach(p=>p.classList.remove('active')); document.getElementById(id).classList.add('active');
        if(e){ document.querySelectorAll('.nav-link').forEach(l=>l.classList.remove('active')); e.target.classList.add('active'); }
        if(!this.p) return;
        if(id==='p-world')this.renderWorld(); if(id==='p-dungeon'){this.fetchWorldGates();this.renderQuests()} if(id==='p-enhance')this.renderUpgrades();
        if(id==='p-titles')this.renderTitles(); if(id==='p-inventory')this.renderBag('sword'); if(id==='p-forge')this.renderForge();
        if(id==='p-shop'){if(!this.shopCache)this.checkShopRefresh();this.renderShop('sword')} if(id==='p-rank')this.renderLeaderboard();
        if(id==='p-partner')this.renderPartner(); if(id==='p-code' && this.isAdminUnlocked) this.renderAdminPanel();
    },
    getMaxExp(lv){return lv<=30?100+(lv-1)*50:100+29*50+(lv-30)*100},
    getRank(lv){if(lv>=100)return{r:"國家級獵人",c:"rank-UNKNOWN"};if(lv>=71)return{r:"S-RANK HUNTER",c:"rank-S"};if(lv>=51)return{r:"A-RANK HUNTER",c:"rank-A"};if(lv>=36)return{r:"B-RANK HUNTER",c:"rank-B"};if(lv>=21)return{r:"C-RANK HUNTER",c:"rank-C"};if(lv>=11)return{r:"D-RANK HUNTER",c:"rank-D"};return{r:"E-RANK HUNTER",c:"rank-E"}},
    updateUI() {
        if(!this.p)return; document.getElementById('ui-name').innerText=this.p.acc; 
        if(document.getElementById('ui-lv-big')) document.getElementById('ui-lv-big').innerText=this.p.lv;
        document.getElementById('ui-coins').innerText=`💰 ${Math.floor(this.p.coins)}`; document.getElementById('ui-sp').innerText=`剩餘點數: ${this.p.sp}`;
        document.getElementById('ui-title').innerText=`[ ${this.p.curTitle} ]`; document.getElementById('ui-weapon').innerText=this.p.curWeapon?`⚔️ ${this.p.curWeapon.name}`:"⚔️ 徒手";
        const ri=this.getRank(this.p.lv); if(document.getElementById('ui-rank')){document.getElementById('ui-rank').innerText=ri.r;document.getElementById('ui-rank').className=ri.c}
        const mx=this.getMaxExp(this.p.lv); document.getElementById('ui-xp-fill').style.width=`${Math.min((this.p.exp/mx)*100,100)}%`; document.getElementById('ui-xp-txt').innerText=`${Math.floor(this.p.exp)} / ${mx} XP`;
        let bS=0; if(this.p.curWeapon){if(this.p.curWeapon.rank==='B')bS=5;if(this.p.curWeapon.rank==='C')bS=3;if(this.p.curWeapon.rank==='D')bS=1}
        ['iq','str','mp','dex'].forEach(k=>{let d=this.p[k];if(k==='str'&&bS>0)d+=`<span class="stat-bonus">+${bS}</span>`;document.getElementById(`v-${k}`).innerHTML=d});
        this.save();
    },
    showWeaponModel(w) {
        const ov=document.getElementById('weapon-preview-overlay'), ia=document.getElementById('wp-icon-area');
        document.getElementById('wp-name').innerText=w.name; const rt=document.getElementById('wp-rank-tag');
        rt.innerText=`${w.rank}-RANK`; rt.className=`rank-${w.rank}`; document.getElementById('wp-desc').innerText=w.desc||"魔力兵器。";
        let c="#00d4ff"; if(w.rank==='S')c="#ffd700"; if(w.rank==='A')c="#bc13fe"; if(w.rank==='UNKNOWN')c="#ff0055";
        const type=w.name.includes('匕')||w.name.includes('短')?'DAGGER':(w.name.includes('重')||w.name.includes('巨')||w.name.includes('大')?'HEAVY':(w.name.includes('槍')||w.name.includes('矛')?'SPEAR':'SWORD'));
        ia.innerHTML=SWORD_MODELS[type]; ia.querySelector('svg').style.color=c; ov.style.display='flex';
    },
    inspectCurrentWeapon(){if(this.p.curWeapon)this.showWeaponModel(this.p.curWeapon);else alert("徒手")},
    checkLevelUp(){let m=this.getMaxExp(this.p.lv);while(this.p.exp>=m){this.p.exp-=m;this.p.lv++;this.p.sp+=3;this.p.iq++;this.p.str++;this.p.mp++;this.p.dex++;if(this.p.lv<=50&&this.p.lv%2===0)this.drawTitle();m=this.getMaxExp(this.p.lv)}},
    drawTitle(){
        const r=Math.random()*100; let rk='E'; if(this.p.buffs.luck){if(r<5)rk='S';else if(r<25)rk='A';else rk='B';this.p.buffs.luck=false}else{if(r<0.5)rk='S';else if(r<2)rk='A';else if(r<20)rk='B';else if(r<40)rk='C';else if(r<65)rk='D'}
        const t=DB.titles[rk][Math.floor(Math.random()*DB.titles[rk].length)];
        if(!this.p.titles.includes(t)) this.p.titles.push(t);
        document.getElementById('gacha-result').innerText=t; document.getElementById('gacha-result').className=`gacha-glow rank-${rk}`; document.getElementById('gacha-pop').style.display='flex'; this.updateUI();
    },
    async fetchWorldGates(){ try{const s=await getDoc(doc(db,"system","global_gates"));if(s.exists()&&s.data().active)DB.cloudGates=s.data().active;this.renderWorldGates()}catch(e){} },
    renderWorldGates(){
        const a=document.getElementById('world-gates-list'); let h=""; if(DB.cloudGates.length===0){a.innerHTML="<div style='text-align:center;padding:20px;'>無任務</div>";return}
        const m=this.p.activeQuests.map(q=>q.globalId);
        DB.cloudGates.forEach(g=>{ if(!m.includes(g.id)) h+=`<div class="card"><strong>${g.sub}-${g.task}</strong><button onclick="System.acceptWorldGate(${g.id})">接取</button></div>` }); a.innerHTML=h;
    },
    async acceptWorldGate(id){const g=DB.cloudGates.find(x=>x.id===id);this.p.activeQuests.push({id:Date.now(),globalId:g.id,sub:g.sub,task:g.task,range:g.range,xp:g.xp,readyAt:Date.now()+(g.time*60000),bonus:g.bonus});await this.save();this.renderWorldGates();this.renderQuests()},
    renderQuests(){
        let h=""; const n=Date.now();
        this.p.activeQuests.forEach(q=>{ const r=!q.readyAt||n>=q.readyAt; h+=`<div class="card"><strong>${q.sub}</strong>${r?`<button onclick="System.completeQuest(${q.id})">結算</button>`:`<span>等待中</span>`}</div>` }); document.getElementById('active-quests-list').innerHTML=h;
    },
    startGlobalTimer(){if(this.timerIdx)clearInterval(this.timerIdx);this.timerIdx=setInterval(()=>{let nr=false;document.querySelectorAll('.cooldown-timer').forEach(el=>{const d=parseInt(el.dataset.until)-Date.now();if(d<=0)nr=true});if(nr)this.renderQuests()},1000)},
    async completeQuest(id){
        const i=this.p.activeQuests.findIndex(q=>q.id===id);if(i===-1)return;const q=this.p.activeQuests[i];this.p.activeQuests.splice(i,1);
        this.p.exp+=q.xp; this.p.coins+=q.xp; alert(`獲得 ${q.xp}XP`);this.checkLevelUp();this.updateUI();this.renderQuests()
    },
    renderUpgrades(){document.getElementById('up-sp-display').innerText=this.p.sp;let h="";['iq','str','mp','dex'].forEach(s=>{h+=`<div class="card"><strong>${s} ${this.p[s]}</strong><button onclick="System.addStat('${s}')">+</button></div>`});document.getElementById('upgrade-list').innerHTML=h},
    addStat(id){if(this.p.sp>0){this.p[id]++;this.p.sp--;this.updateUI();this.renderUpgrades()}},
    renderTitles(){let h="";['S','A','B','C','D','E'].forEach(r=>{h+=`<h3>${r}</h3>`;DB.titles[r].forEach(t=>{h+=`<div class="card" onclick="System.equipTitle('${t}')">${t}</div>`})});document.getElementById('titles-list').innerHTML=h},
    equipTitle(t){this.p.curTitle=t;this.updateUI();this.renderTitles()},
    checkShopRefresh(){const t=new Date().toLocaleDateString();this.refreshShop(t,false)},
    refreshShop(t,f){
        let sh={swords:[],titles:[]};Object.keys(DB.swords).forEach(rk=>{DB.swords[rk].forEach(sw=>{sh.swords.push({name:typeof sw==='object'?sw.name:sw,rank:rk,price:1000})})});
        this.shopCache=sh; this.renderShop('sword');
    },
    renderShop(tab){let h="";this.shopCache.swords.forEach((s,i)=>h+=`<div class="card"><strong>${s.name}</strong><button onclick="System.buyShop('sword',${i})">💰${s.price}</button></div>`);document.getElementById('shop-list').innerHTML=h},
    buyShop(t,i){
        const it=this.shopCache[`${t}s`][i]; 
        if(it.rank==='UNKNOWN') return alert("這是非賣品！");
        if(this.p.coins>=it.price){it.id=Date.now();this.p.bag.swords.push(it);this.p.coins-=it.price;this.updateUI();this.renderShop(t)}
    },
    renderBag(tab){let h="";this.p.bag.swords.forEach(s=>h+=`<div class="card"><strong>${s.name}</strong><button onclick="System.equipWeapon(${s.id})">裝備</button></div>`);document.getElementById('bag-list').innerHTML=h},
    equipWeapon(id){this.p.curWeapon=this.p.bag.swords.find(s=>s.id===id);this.updateUI();this.renderBag('sword')},
    renderForge(){let h="";this.p.bag.swords.forEach(s=>h+=`<div class="card"><strong>${s.name}</strong><button onclick="System.forgeWeapon(${s.id})">修復</button></div>`);document.getElementById('forge-list').innerHTML=h},
    forgeWeapon(id){alert("鍛造功能修復中");},
    async renderLeaderboard(){const e=document.getElementById('leaderboard-list');e.innerHTML="載入中...";const sn=await getDocs(collection(db,"players"));let d=[];sn.forEach(x=>d.push(x.data()));d.sort((a,b)=>b.lv-a.lv);let h="";d.forEach(x=>h+=`<div class="card">${x.acc} Lv.${x.lv}</div>`);e.innerHTML=h},
    async renderPartner(){document.getElementById('partner-status-area').innerHTML="戰友系統連線中...";},
    verifyAdmin(){
        if(document.getElementById('inp-admin-pwd').value==='Ricky_0414'){
            this.isAdminUnlocked=true; document.getElementById('admin-login').style.display='none'; document.getElementById('admin-panel').style.display='flex'; this.renderAdminPanel();
        }else alert("密碼錯誤");
    },
    renderAdminPanel(){
        let s="<option value=''>--武器--</option>";Object.keys(DB.swords).forEach(rk=>DB.swords[rk].forEach(x=>s+=`<option value="${rk}|${typeof x==='object'?x.name:x}">${typeof x==='object'?x.name:x}</option>`));document.getElementById('adm-sel-sword').innerHTML=s;
        let t="<option value=''>--稱號--</option>";Object.keys(DB.titles).forEach(rk=>DB.titles[rk].forEach(x=>t+=`<option value="${x}">${x}</option>`));document.getElementById('adm-sel-title').innerHTML=t;
    },
    async adminSetStats(){let t=document.getElementById('adm-target').value.trim();if(!t||t===this.p.acc){this.p.lv=parseInt(document.getElementById('adm-lv').value);this.updateUI();alert("完成")}else{alert("僅支援修改自己")}},
    async adminGiveSword(){
        const v=document.getElementById('adm-sel-sword').value;if(!v)return;const p=v.split('|');
        const it={id:Date.now(),name:p[1],rank:p[0],wear:'0.00',price:0};
        let t=document.getElementById('adm-target').value.trim();
        if(!t||t===this.p.acc){this.p.bag.swords.push(it);this.save();alert("成功")}
        else{const r=doc(db,"players",t),s=await getDoc(r);if(s.exists()){let td=s.data();td.bag.swords.push(it);await setDoc(r,td);alert("發送成功")}}
    },
    async adminGiveTitle(){
        const v=document.getElementById('adm-sel-title').value;if(!v)return;
        let t=document.getElementById('adm-target').value.trim();
        if(!t||t===this.p.acc){this.p.titles.push(v);this.save();alert("成功")}
        else{const r=doc(db,"players",t),s=await getDoc(r);if(s.exists()){let td=s.data();td.titles.push(v);await setDoc(r,td);alert("發送成功")}}
    },
    async adminGiveMats(){alert("成功")}, async adminGivePotions(){alert("成功")}, async adminPunish(){alert("天罰執行")},
    startHeartbeat(){const b=()=>{if(this.p)updateDoc(doc(db,"players",this.p.acc),{lastSeen:Date.now()})};b();setInterval(b,30000)},
    async renderWorld(){const a=document.getElementById('online-list');onSnapshot(collection(db,"players"),(sn)=>{let h="";sn.forEach(d=>{const x=d.data();if(x.acc!==this.p?.acc){const on=x.lastSeen&&(Date.now()-x.lastSeen<65000);h+=`<div class="card"><strong>${x.acc}</strong> ${on?`<button onclick="TradeSystem.startTrade('${x.acc}')">交易</button>`:'離線'}</div>`}});a.innerHTML=h})},
    listenForInvites(){onSnapshot(query(collection(db,"trades"),where("target","==",this.p.acc),where("status","==","pending")),(sn)=>{sn.docChanges().forEach(c=>{if(c.type==="added"){if(confirm(`收到交易請求？`))TradeSystem.joinTrade(c.doc.id,c.doc.data())}})})},
};

const TradeSystem = {
    cti: null, ut: null, ci: null, cs: 5, ie: false,
    async startTrade(t){const id=`trade_${Date.now()}`,d={id,sender:System.p.acc,target:t,status:"pending",offerA:{coins:0,items:[]},offerB:{coins:0,items:[]},readyA:false,readyB:false,chat:[]};await setDoc(doc(db,"trades",id),d);this.joinTrade(id,d)},
    joinTrade(id,d){
        this.cti=id;document.getElementById('trade-overlay').style.display='flex';
        onSnapshot(doc(db,"trades",id),(s)=>{if(s.exists()){const x=s.data();if(x.status==="completed"){alert("成功交易");System.login();this.cancel()}if(x.status==="rejected")this.cancel();if(x.status==="pending")this.render(x)}else this.cancel()})
    },
    async addItemToOffer(){
        const v=document.getElementById('trade-item-select').value;if(!v)return;const d=(await getDoc(doc(db,"trades",this.cti))).data(),is=System.p.acc===d.sender,my=is?d.offerA:d.offerB;
        if(v.startsWith('s')){const id=parseInt(v.split('|')[1]);if(!my.items.find(x=>x.id===id))my.items.push(System.p.bag.swords.find(x=>x.id===id))}
        updateDoc(doc(db,"trades",this.cti),is?{"offerA.items":my.items,readyA:false,readyB:false}:{"offerB.items":my.items,readyA:false,readyB:false})
    },
    render(d){
        const is=System.p.acc===d.sender,my=is?d.offerA:d.offerB,pe=is?d.offerB:d.offerA,mr=is?d.readyA:d.readyB,pr=is?d.readyB:d.readyA,b=document.getElementById('btn-confirm-trade');
        document.getElementById('my-offer-list').innerText=`💰 ${my.coins} Items: ${my.items.length}`;document.getElementById('peer-offer-list').innerText=`💰 ${pe.coins} Items: ${pe.items.length}`;
        document.getElementById('peer-ready-status').innerText=pr?"🟢 就緒":"⚪ 等待";
        if(d.readyA&&d.readyB){if(!this.ci&&!this.ie){this.cs=5;this.ci=setInterval(()=>{this.cs--;b.innerText=`鎖定 ${this.cs}s`;if(this.cs<=0){clearInterval(this.ci);this.ci=null;if(is){this.ie=true;this.ex(d)}}},1000)}}
        else{if(this.ci){clearInterval(this.ci);this.ci=null}b.disabled=false;b.innerText=mr?"等待對方":"確認"}
    },
    async updateOffer(){const c=parseInt(document.getElementById('trade-coin-input').value)||0;if(c>System.p.coins)return;const d=(await getDoc(doc(db,"trades",this.cti))).data(),is=System.p.acc===d.sender;updateDoc(doc(db,"trades",this.cti),is?{"offerA.coins":c,readyA:false,readyB:false}:{"offerB.coins":c,readyA:false,readyB:false})},
    async confirmReady(){const d=(await getDoc(doc(db,"trades",this.cti))).data(),is=System.p.acc===d.sender;updateDoc(doc(db,"trades",this.cti),is?{readyA:true}:{readyB:true})},
    cancel(){if(this.cti)updateDoc(doc(db,"trades",this.cti),{status:"rejected"});if(this.ut)this.ut();this.cti=null;document.getElementById('trade-overlay').style.display='none'},
    async ex(d){
        try{await runTransaction(db,async(t)=>{
            const rA=doc(db,"players",d.sender),rB=doc(db,"players",d.target),rT=doc(db,"trades",d.id);
            const uA=(await t.get(rA)).data(),uB=(await t.get(rB)).data();
            uA.coins=uA.coins-d.offerA.coins+d.offerB.coins; uB.coins=uB.coins-d.offerB.coins+d.offerA.coins;
            d.offerA.items.forEach(i=>{uA.bag.swords=uA.bag.swords.filter(s=>s.id!==i.id);uB.bag.swords.push(i)});
            d.offerB.items.forEach(i=>{uB.bag.swords=uB.bag.swords.filter(s=>s.id!==i.id);uA.bag.swords.push(i)});
            t.update(rA,uA);t.update(rB,uB);t.update(rT,{status:"completed"})
        })}catch(e){this.cancel()}
    }
};

window.System = System; 
window.TradeSystem = TradeSystem;