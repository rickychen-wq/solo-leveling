import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, collection, getDocs, onSnapshot, query, where, updateDoc, arrayUnion, runTransaction } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

const firebaseConfig = { apiKey: "AIzaSyDfaC7sWiz--IXnOQq9Qw0ICNDT8MpZE5o", authDomain: "solo-leveling-server.firebaseapp.com", projectId: "solo-leveling-server", storageBucket: "solo-leveling-server.firebasestorage.app", messagingSenderId: "979607975137", appId: "1:979607975137:web:70224f438280bafebf73a0", measurementId: "G-8E64C4CNSZ" };
const app = initializeApp(firebaseConfig); 
const db = getFirestore(app);

// 🎨 【終極特效注入器】保證畫面絕對不會醜！
const style = document.createElement('style');
style.innerHTML = `
    .cyber-timer-box { background: rgba(0, 212, 255, 0.05); border: 1px solid #00d4ff; box-shadow: 0 0 10px rgba(0, 212, 255, 0.2), inset 0 0 10px rgba(0, 212, 255, 0.1); border-radius: 8px; padding: 10px 20px; text-align: center; }
    .cyber-timer-text { color: #00d4ff; font-family: 'Courier New', monospace; font-size: 1.4rem; font-weight: bold; text-shadow: 0 0 8px #00d4ff; letter-spacing: 2px; margin: 0; }
    .btn-claim-reward { background: linear-gradient(45deg, #00ff88, #00cc66); color: #000 !important; font-weight: 900; font-size: 1.1rem; padding: 10px 25px; border: none; border-radius: 6px; box-shadow: 0 0 15px #00ff88; cursor: pointer; transition: 0.2s; text-transform: uppercase; letter-spacing: 1px; }
    .btn-claim-reward:hover { transform: scale(1.05); box-shadow: 0 0 25px #00ff88, inset 0 0 10px rgba(255,255,255,0.5); }
    .quest-card-premium { background: linear-gradient(135deg, rgba(20,20,20,0.95), rgba(35,35,35,0.95)); border-left: 4px solid var(--purple); border-radius: 10px; padding: 15px 20px; margin-bottom: 15px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 5px 15px rgba(0,0,0,0.5); transition: 0.3s; }
    .quest-card-premium:hover { box-shadow: 0 0 20px rgba(188, 19, 254, 0.3); border-left-color: #bc13fe; }
    .shop-card-premium { background: rgba(15,15,15,0.9); border-radius: 10px; padding: 15px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; transition: 0.3s; }
    .shop-card-premium:hover { transform: translateY(-2px); }
    @keyframes epicPopup { 0% { transform: scale(0.8); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
    @keyframes pulseDungeon { 0% { box-shadow: 0 0 15px rgba(188,19,254,0.4), inset 0 0 10px rgba(188,19,254,0.2); } 50% { box-shadow: 0 0 30px rgba(188,19,254,0.8), inset 0 0 20px rgba(188,19,254,0.5); border-color: #bc13fe; } 100% { box-shadow: 0 0 15px rgba(188,19,254,0.4), inset 0 0 10px rgba(188,19,254,0.2); } }
`;
document.head.appendChild(style);

// 🎬 【全螢幕結算動畫】取代原本無聊的 alert()
function showEpicRewardModal(title, msg, color = "var(--gold)") {
    const overlay = document.createElement('div');
    overlay.style.cssText = "position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.85); z-index:9999; display:flex; flex-direction:column; justify-content:center; align-items:center; backdrop-filter:blur(5px); animation: fadeIn 0.3s forwards;";
    const content = document.createElement('div');
    content.style.cssText = `background:linear-gradient(180deg, rgba(20,20,20,1), rgba(10,10,10,1)); border:2px solid ${color}; box-shadow:0 0 30px ${color}, inset 0 0 20px rgba(255,255,255,0.05); padding:40px 60px; border-radius:15px; text-align:center; animation: epicPopup 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; min-width:300px;`;
    content.innerHTML = `
        <h1 style="color:${color}; font-size:2.5rem; margin:0 0 20px 0; text-shadow:0 0 15px ${color}; letter-spacing:4px; font-weight:900;">${title}</h1>
        <div style="color:#e0e0e0; font-size:1.2rem; line-height:1.8; text-shadow:0 0 5px rgba(255,255,255,0.3); margin-bottom:30px;">${msg.replace(/\n/g, '<br>')}</div>
        <button style="background:${color}; color:#000; border:none; padding:12px 40px; font-size:1.2rem; font-weight:900; border-radius:5px; cursor:pointer; box-shadow:0 0 15px ${color}; transition:0.2s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'" onclick="this.parentElement.parentElement.remove()">確認</button>
    `;
    overlay.appendChild(content); document.body.appendChild(overlay);
}

const SWORD_MODELS = {
    SWORD: `<svg class="weapon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14.5 3L21 9.5M10.5 7L17 13.5M3 21L11 13M10 21L12 19M19 10L21 8" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    DAGGER: `<svg class="weapon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 14L21 3M14 10L17 13" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    HEAVY: `<svg class="weapon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 3L21 6L6 21L3 18L18 3Z" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    SPEAR: `<svg class="weapon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 3L10 14L14 21L21 3ZM3 21L10 14" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    AXE: `<svg class="weapon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 10L3 21M14 10L21 3M14 10L21 17L17 21L10 14Z" stroke-linecap="round" stroke-linejoin="round"/></svg>`
};

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
        UNKNOWN: [{name:"虛空之痕 · 零", desc:"系統管理員專屬，非賣品"}], 
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
            
            // 🔥 進入地下城按鈕特效綁定 (修復)
            const enterBtn = document.querySelector('.page#p-main button');
            if(enterBtn && enterBtn.innerText.includes('地下城')) {
                enterBtn.style.animation = "pulseDungeon 2s infinite";
            }

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
        if(id==='p-partner')this.renderPartner(); if(id==='p-code') this.renderAdminPanel(); // 就算沒解鎖密碼也先渲染結構
    },

    getMaxExp(lv){return lv<=30?100+(lv-1)*50:100+29*50+(lv-30)*100},
    getRank(lv){if(lv>=100)return{r:"國家級獵人",c:"rank-UNKNOWN"};if(lv>=71)return{r:"S-RANK HUNTER",c:"rank-S"};if(lv>=51)return{r:"A-RANK HUNTER",c:"rank-A"};if(lv>=36)return{r:"B-RANK HUNTER",c:"rank-B"};if(lv>=21)return{r:"C-RANK HUNTER",c:"rank-C"};if(lv>=11)return{r:"D-RANK HUNTER",c:"rank-D"};return{r:"E-RANK HUNTER",c:"rank-E"}},
    
    updateUI() {
        if(!this.p)return; document.getElementById('ui-name').innerText=this.p.acc; 
        if(document.getElementById('ui-lv-small')) document.getElementById('ui-lv-small').innerText=`LEVEL: ${this.p.lv}`;
        if(document.getElementById('ui-lv-big')) document.getElementById('ui-lv-big').innerText=this.p.lv;
        document.getElementById('ui-coins').innerText=`💰 ${Math.floor(this.p.coins)}`; document.getElementById('ui-sp').innerText=`剩餘點數: ${this.p.sp}`;
        document.getElementById('ui-title').innerText=`[ ${this.p.curTitle} ]`; document.getElementById('ui-weapon').innerText=this.p.curWeapon?`⚔️ ${this.p.curWeapon.name}`:"⚔️ 徒手";
        
        const ri=this.getRank(this.p.lv); if(document.getElementById('ui-rank')){document.getElementById('ui-rank').innerText=ri.r;document.getElementById('ui-rank').className=ri.c}
        const mx=this.getMaxExp(this.p.lv); document.getElementById('ui-xp-fill').style.width=`${Math.min((this.p.exp/mx)*100,100)}%`; document.getElementById('ui-xp-txt').innerText=`${Math.floor(this.p.exp)} / ${mx} XP`;
        
        let bS=0; if(this.p.curWeapon){if(this.p.curWeapon.rank==='B')bS=5;if(this.p.curWeapon.rank==='C')bS=3;if(this.p.curWeapon.rank==='D')bS=1}
        ['iq','str','mp','dex'].forEach(k=>{let d=this.p[k];if(k==='str'&&bS>0)d+=`<span class="stat-bonus" style="color:var(--gold); font-weight:bold; margin-left:8px;">+${bS}</span>`;document.getElementById(`v-${k}`).innerHTML=d});
        this.save();
    },

    getWeaponModelType(name) { if(name.includes('匕首')||name.includes('短刀')||name.includes('小刀')) return 'DAGGER'; if(name.includes('重刃')||name.includes('巨劍')||name.includes('大劍')||name.includes('鐵鎚')||name.includes('大刀')||name.includes('斧')) return 'HEAVY'; if(name.includes('槍')||name.includes('矛')||name.includes('刺刀')) return 'SPEAR'; return 'SWORD'; },
    
    // 🎨 特效修復：武器預覽與浮動發光
    showWeaponModel(w) {
        const ov=document.getElementById('weapon-preview-overlay'), ia=document.getElementById('wp-icon-area');
        document.getElementById('wp-name').innerText=w.name; const rt=document.getElementById('wp-rank-tag');
        rt.innerText=`${w.rank}-RANK`; rt.className=`rank-${w.rank}`; document.getElementById('wp-desc').innerText=w.desc||"充滿魔力的致命兵器。";
        let c="#00d4ff"; if(w.rank==='S')c="#ffd700"; if(w.rank==='A')c="#bc13fe"; if(w.rank==='UNKNOWN')c="#ff0055";
        const type=this.getWeaponModelType(w.name);
        ia.innerHTML=SWORD_MODELS[type]; 
        const svg = ia.querySelector('svg');
        svg.style.color=c; 
        svg.classList.add('weapon-svg'); 
        svg.classList.add(`rank-${w.rank}`); // 恢復光暈
        ov.style.display='flex';
    },

    inspectCurrentWeapon(){if(this.p.curWeapon)this.showWeaponModel(this.p.curWeapon);else showEpicRewardModal("提示", "目前赤手空拳", "#fff")},
    checkLevelUp(){let m=this.getMaxExp(this.p.lv);while(this.p.exp>=m){this.p.exp-=m;this.p.lv++;this.p.sp+=3;this.p.iq++;this.p.str++;this.p.mp++;this.p.dex++;if(this.p.lv<=50&&this.p.lv%2===0)this.drawTitle();m=this.getMaxExp(this.p.lv)}},
    
    drawTitle(){
        const r=Math.random()*100; let rk='E'; if(this.p.buffs.luck){if(r<5)rk='S';else if(r<25)rk='A';else rk='B';this.p.buffs.luck=false}else{if(r<0.5)rk='S';else if(r<2)rk='A';else if(r<20)rk='B';else if(r<40)rk='C';else if(r<65)rk='D'}
        const t=DB.titles[rk][Math.floor(Math.random()*DB.titles[rk].length)];
        if(!this.p.titles.includes(t)){ this.p.titles.push(t); document.getElementById('gacha-msg').innerText="恭喜獲得稱號"; }
        else{ this.p.coins+=500; document.getElementById('gacha-msg').innerText="重複稱號轉化為 500 蓮幣"; }
        document.getElementById('gacha-result').innerText=t; document.getElementById('gacha-result').className=`gacha-glow rank-${rk}`; document.getElementById('gacha-pop').style.display='flex'; this.updateUI();
    },

    async fetchWorldGates(){ try{const s=await getDoc(doc(db,"system","global_gates"));if(s.exists()&&s.data().active)DB.cloudGates=s.data().active;this.renderWorldGates()}catch(e){} },
    
    // 🎨 傳送門 UI 升級
    renderWorldGates(){
        const a=document.getElementById('world-gates-list'); let h=""; if(DB.cloudGates.length===0){a.innerHTML="<div style='text-align:center;padding:30px;color:#555;font-size:1.2rem;'>總監尚未發布任務</div>";return}
        const m=this.p.activeQuests.map(q=>q.globalId);
        DB.cloudGates.forEach(g=>{ 
            if(!m.includes(g.id)) {
                let bonusTag=""; 
                if(g.bonus){ if(g.bonus.type==='title') bonusTag=`<span class="badge" style="color:var(--gold); border:1px solid var(--gold);">🎁 ${g.bonus.rank}級稱號</span>`; else if(g.bonus.type==='potion') bonusTag=`<span class="badge" style="color:var(--blue); border:1px solid var(--blue);">🎁 藥水</span>`; else if(g.bonus.type==='mat') bonusTag=`<span class="badge" style="color:var(--purple); border:1px solid var(--purple);">🎁 素材</span>`; }
                h+=`<div class="quest-card-premium" style="border-left-color:var(--gold);">
                        <div style="flex:1;">
                            <strong style="color:var(--gold);font-size:1.2rem;text-shadow:0 0 5px var(--gold);">${g.sub}-${g.task}</strong>
                            <div style="font-size:11px;color:#aaa;margin-top:5px;">${g.range}</div>
                            <div style="margin-top:8px;">
                                <span style="color:var(--purple);font-weight:bold;margin-right:10px;">${g.xp}XP</span> 
                                <span style="color:#666;font-size:12px;margin-right:10px;">⏳ ${g.time}分鐘</span>
                                ${bonusTag}
                            </div>
                        </div>
                        <button class="btn-claim-reward" style="background:var(--gold);color:#000;box-shadow:0 0 10px var(--gold);" onclick="System.acceptWorldGate(${g.id})">接取</button>
                    </div>`;
            }
        }); 
        a.innerHTML=h;
    },

    async acceptWorldGate(id){const g=DB.cloudGates.find(x=>x.id===id);this.p.activeQuests.push({id:Date.now(),globalId:g.id,sub:g.sub,task:g.task,range:g.range,xp:g.xp,readyAt:Date.now()+(g.time*60000),bonus:g.bonus});await this.save();this.renderWorldGates();this.renderQuests()},
    
    // 🎨 特效修復：霓虹倒數計時器
    renderQuests(){
        let h=""; const n=Date.now();
        this.p.activeQuests.forEach(q=>{
            const isReady = !q.readyAt||n>=q.readyAt; 
            let timerHtml = isReady 
                ? `<button class="btn-claim-reward" onclick="System.completeQuest(${q.id})">⚡ 結算報酬</button>` 
                : `<div class="cyber-timer-box"><p class="cyber-timer-text cooldown-timer" data-until="${q.readyAt}">00:00</p></div>`;
            
            h+=`<div class="quest-card-premium" style="border-left-color:var(--blue);">
                    <div style="flex:1;">
                        <strong style="color:#fff;font-size:1.2rem;">${q.sub}-${q.task}</strong>
                        <div style="font-size:11px;color:#888;margin-top:5px;">${q.range}</div>
                        <div style="margin-top:5px;"><span style="color:var(--purple);font-weight:bold;">${q.xp}XP</span></div>
                    </div>
                    <div>${timerHtml}</div>
                </div>`;
        }); 
        document.getElementById('active-quests-list').innerHTML=h || "<div style='text-align:center;color:#555;padding:30px;font-size:1.2rem;'>沒有進行中的任務</div>";
    },

    startGlobalTimer(){if(this.timerIdx)clearInterval(this.timerIdx);this.timerIdx=setInterval(()=>{let nr=false;document.querySelectorAll('.cooldown-timer').forEach(el=>{const d=parseInt(el.dataset.until)-Date.now();if(d<=0)nr=true;else{const m=Math.floor(d/60000),s=Math.floor((d%60000)/1000);el.innerText=`${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;}});if(nr)this.renderQuests()},1000)},
    
    // 🎨 特效修復：地下城結算使用全螢幕動畫 Modal
    async completeQuest(id){
        const i=this.p.activeQuests.findIndex(q=>q.id===id);if(i===-1)return;const q=this.p.activeQuests[i];this.p.activeQuests.splice(i,1);
        let fx=q.xp, fc=q.xp; 
        let doubleMsg = "";
        if(this.p.partner){fx=Math.floor(fx*1.1);fc=Math.floor(fc*1.1)}
        if(this.p.buffs.doubleXp){fx*=2;this.p.buffs.doubleXp=false; doubleMsg="<br><span style='color:var(--gold)'>[ 雙倍經驗藥劑生效 ]</span>";}
        if(this.p.curWeapon){if(this.p.curWeapon.rank==='S'){fx=Math.floor(fx*1.2);fc=Math.floor(fc*1.5)}else if(this.p.curWeapon.rank==='A'){fx=Math.floor(fx*1.1);fc=Math.floor(fc*1.2)}}
        
        this.p.exp+=fx; this.p.coins+=fc; 
        let m=`獲得 <strong style="color:var(--purple)">${fx} XP</strong> 與 <strong style="color:var(--gold)">${fc} 蓮幣</strong>${doubleMsg}`;
        
        const rd=Math.random();if(rd<0.1){this.p.bag.mats.logic++;m+="<br><br>🧩 邏輯碎片 x1";}else if(rd<0.2){this.p.bag.mats.lang++;m+="<br><br>📖 語文符文 x1";}else if(rd<0.3){this.p.bag.mats.mem++;m+="<br><br>🧠 記憶結晶 x1";}
        
        if(q.bonus&&q.bonus.type){if(q.bonus.type==='title'){const t=DB.titles[q.bonus.rank][Math.floor(Math.random()*DB.titles[q.bonus.rank].length)];if(!this.p.titles.includes(t))this.p.titles.push(t);m+=`<br><br>✨ 賞賜稱號：[ <span class="rank-${q.bonus.rank}">${t}</span> ]`;}else if(q.bonus.type==='potion'){this.p.bag.potions[q.bonus.id]=(this.p.bag.potions[q.bonus.id]||0)+1;m+=`<br><br>🧪 賞賜藥水：${q.bonus.name}`;}else if(q.bonus.type==='mat'){this.p.bag.mats[q.bonus.id]+=parseInt(q.bonus.amount);m+=`<br><br>📦 賞賜素材：${q.bonus.name} x${q.bonus.amount}`;}}
        
        this.checkLevelUp();this.updateUI();this.renderWorldGates();this.renderQuests();
        showEpicRewardModal("QUEST CLEARED", m, "#00ff88");
    },

    renderUpgrades(){document.getElementById('up-sp-display').innerText=this.p.sp;let h="";[{id:'iq',n:'IQ'},{id:'str',n:'STR'},{id:'mp',n:'MP'},{id:'dex',n:'DEX'}].forEach(s=>{h+=`<div class="card" style="border-left:3px solid var(--purple);"><div class="card-col"><strong style="color:var(--blue);">${s.n}</strong><span style="font-size:2rem;font-weight:900;">${this.p[s.id]}</span></div><button class="btn-action" style="font-size:1.6rem;width:45px;height:45px;background:rgba(188,19,254,0.1);border:1px solid var(--purple);" onclick="System.addStat('${s.id}')">+</button></div>`});document.getElementById('upgrade-list').innerHTML=h},
    addStat(id){if(this.p.sp>0){this.p[id]++;this.p.sp--;this.updateUI();this.renderUpgrades()}else showEpicRewardModal("錯誤", "配點不足", "#ff0055")},
    
    renderTitles(){let h="";['S','A','B','C','D','E'].forEach(r=>{h+=`<h2 class="section-title rank-${r}">${r}-RANK</h2>`;DB.titles[r].forEach(t=>{if(t==="🚫 卑鄙的作弊者")return;const u=this.p.titles.includes(t),is=this.p.curTitle===t;if(u)h+=`<div class="card ${is?'equipped':''}" style="${is?'border:1px solid var(--purple);box-shadow:inset 0 0 10px rgba(188,19,254,0.3);':''}" onclick="System.equipTitle('${t}')"><strong><span class="rank-${r}">${t}</span></strong>${is?'<span style="color:var(--purple);font-size:10px;border:1px solid var(--purple);padding:2px 5px;border-radius:3px;">裝備中</span>':''}</div>`;else h+=`<div class="card locked-title" style="opacity:0.5;"><strong class="rank-E">${r==='S'?'???':t}</strong><span style="font-size:10px;color:#555;">未解鎖</span></div>`})});document.getElementById('titles-list').innerHTML=h},
    equipTitle(t){this.p.curTitle=t;this.updateUI();this.renderTitles()},
    
    checkShopRefresh(){const t=new Date().toLocaleDateString();let s=StorageMgr.get('sl_shop_v37');if(s){const p=JSON.parse(s);if(p.date===t){this.shopCache=p.data;document.getElementById('shop-time').innerText=t;return}}this.refreshShop(t,false)},
    getWearRate(r){const d=Math.random();return r==='S'?(0.5+d*4.5).toFixed(3):r==='A'?(5+d*10).toFixed(3):r==='B'?(20+d*5).toFixed(3):r==='C'?(30+d*10).toFixed(3):r==='D'?(45+d*10).toFixed(3):(70+d*20).toFixed(3)},
    
    refreshShop(t,f){
        let sh={swords:[],titles:[]};Object.keys(DB.swords).forEach(rk=>{DB.swords[rk].forEach(sw=>{let n=typeof sw==='object'?sw.name:sw,d=typeof sw==='object'?sw.desc:'',w=rk==='UNKNOWN'?'???':this.getWearRate(rk),p=999999;if(rk!=='UNKNOWN'){let wf=parseFloat(w);if(rk==='S')p=Math.floor(10000*(10-wf));else if(rk==='A')p=Math.floor(Math.random()*5001)+10000;else if(rk==='B')p=Math.floor(Math.random()*1001)+4000;else if(rk==='C')p=Math.floor(Math.random()*1001)+3000;else if(rk==='D')p=Math.floor(Math.random()*1001)+2000;else p=Math.floor(Math.random()*1001)+1000}sh.swords.push({name:n,rank:rk,wear:w,desc:d,price:p})})});sh.swords.sort((a,b)=>this.rankWeight[b.rank]-this.rankWeight[a.rank]);
        for(let i=0;i<12;i++){const r=Math.random()*100;let rk='E';if(r<1.5)rk='S';else if(r<5)rk='A';else if(r<25)rk='B';else if(r<45)rk='C';else if(r<65)rk='D';let n=DB.titles[rk][Math.floor(Math.random()*DB.titles[rk].length)],p=rk==='S'?5000:rk==='A'?2500:rk==='B'?1000:rk==='C'?500:rk==='D'?200:100;sh.titles.push({name:n,rank:rk,price:p})}sh.titles.sort((a,b)=>this.rankWeight[b.rank]-this.rankWeight[a.rank]);
        this.shopCache=sh;StorageMgr.set('sl_shop_v37',JSON.stringify({date:t,data:sh}));document.getElementById('shop-time').innerText=f?'Refreshed':t;
    },
    
    // 🎨 特效修復：商店切換按鈕亮起
    renderShop(tab){
        if(!this.shopCache)this.checkShopRefresh(); if(!this.shopCache)return; 
        ['sword','potion','title'].forEach(t=>{
            const btn=document.getElementById(`tab-${t}`);
            if(btn){
                if(t===tab) { btn.style.background='var(--purple)'; btn.style.color='#fff'; btn.style.boxShadow='0 0 15px var(--purple)'; btn.style.border='1px solid var(--purple)'; }
                else { btn.style.background='#111'; btn.style.color='#888'; btn.style.boxShadow='none'; btn.style.border='1px solid #333'; }
            }
        });
        
        let h=""; 
        if(tab==='sword'){ 
            this.shopCache.swords.forEach((sw,idx)=>{ 
                let isS = sw.rank==='S'||sw.rank==='UNKNOWN';
                let bColor = sw.rank==='UNKNOWN'?'#ff0055':(sw.rank==='S'?'var(--gold)':(sw.rank==='A'?'var(--purple)':'#444'));
                let shadow = isS ? `box-shadow:inset 0 0 20px rgba(0,0,0,0.8), 0 0 10px ${bColor};` : '';
                let sp=`border:2px solid ${bColor}; ${shadow}`; 
                let bt=sw.rank==='UNKNOWN'?'🔒 非賣品':`💰 ${sw.price}`; let dis=sw.rank==='UNKNOWN'?'disabled':''; 
                h+=`<div class="shop-card-premium" style="${sp}">
                        <div class="card-col" onclick='System.showWeaponModel(${JSON.stringify(sw).replace(/"/g,"&quot;")})' style="cursor:pointer;">
                            <strong class="rank-${sw.rank}" style="font-size:1.2rem;text-shadow:0 0 8px ${bColor};">${sw.name}</strong>
                            <div style="color:#aaa;font-size:11px;margin-top:5px;">磨損度: ${sw.wear}%</div>
                        </div>
                        <button class="btn-claim-reward" style="${sw.rank==='UNKNOWN'?'background:#333;color:#666;box-shadow:none;':'background:var(--purple);color:#fff;box-shadow:0 0 15px var(--purple);'}" ${dis} onclick="System.buyShop('sword',${idx})">${bt}</button>
                    </div>`; 
            }); 
        } else if(tab==='potion'){ 
            DB.potions.forEach(pot=>{h+=`<div class="shop-card-premium" style="border:1px solid var(--blue);"><div class="card-col"><strong style="color:var(--blue);font-size:1.2rem;">${pot.name}</strong></div><button class="btn-claim-reward" style="background:var(--blue);color:#000;box-shadow:0 0 15px var(--blue);" onclick="System.buyPotion('${pot.id}',${pot.price})">💰 ${pot.price}</button></div>`;}); 
        } else if(tab==='title'){ 
            this.shopCache.titles.forEach((t,idx)=>{ 
                const own=this.p.titles.includes(t.name); 
                h+=`<div class="shop-card-premium" style="border:1px solid #444;"><div class="card-col"><strong class="rank-${t.rank}">${t.name}</strong></div><button class="btn-claim-reward" style="${own?'background:#333;color:#666;box-shadow:none;':'background:#fff;color:#000;box-shadow:0 0 15px #fff;'}" ${own?'disabled':''} onclick="System.buyShop('title',${idx})">${own?'已解鎖':'💰 '+t.price}</button></div>`; 
            }); 
        } 
        document.getElementById('shop-list').innerHTML=h;
    },
    
    buyShop(t,i){
        const it=this.shopCache[`${t}s`][i]; 
        if(it.rank==='UNKNOWN') return showEpicRewardModal("警告", "管理員專屬，禁止購買", "#ff0055");
        if(this.p.coins>=it.price){
            if(t==='title'){ if(this.p.titles.includes(it.name)) return showEpicRewardModal("提示", "已有此稱號", "#aaa"); this.p.titles.push(it.name); showEpicRewardModal("解鎖成功", `獲得稱號 [${it.name}]`, "var(--gold)"); }
            else{ const newItem=Object.assign({},it); newItem.id=Date.now(); this.p.bag.swords.push(newItem); showEpicRewardModal("購買成功", `獲得武器 [${it.name}]`, "var(--purple)"); }
            this.p.coins-=it.price; this.updateUI(); this.renderShop(t);
        } else showEpicRewardModal("拒絕交易", "蓮幣餘額不足", "#ff0055");
    },
    buyPotion(p,pr){if(this.p.coins>=pr){this.p.coins-=pr;this.p.bag.potions[p]=(this.p.bag.potions[p]||0)+1;this.updateUI();showEpicRewardModal("購買成功", "藥水已放入背包", "var(--blue)");}else showEpicRewardModal("拒絕交易", "蓮幣餘額不足", "#ff0055");},
    
    // 🎨 特效修復：背包切換按鈕亮起
    renderBag(tab){
        ['sword','potion','mat'].forEach(t=>{
            const btn=document.getElementById(`bag-tab-${t}`);
            if(btn){
                if(t===tab) { btn.style.background='var(--purple)'; btn.style.color='#fff'; btn.style.boxShadow='0 0 15px var(--purple)'; btn.style.border='1px solid var(--purple)'; }
                else { btn.style.background='#111'; btn.style.color='#888'; btn.style.boxShadow='none'; btn.style.border='1px solid #333'; }
            }
        }); 
        
        let h="";
        if(tab==='sword'){ 
            if(this.p.bag.swords.length===0) h="<div style='padding:30px;color:#555;text-align:center;font-size:1.2rem;'>背包空空如也</div>"; 
            this.p.bag.swords.forEach(sw=>{
                let isE=(this.p.curWeapon&&this.p.curWeapon.id===sw.id); 
                let bdr=isE?'border:2px solid var(--purple);box-shadow:inset 0 0 20px rgba(188,19,254,0.3), 0 0 10px rgba(188,19,254,0.5);':'border:1px solid #444;';
                h+=`<div class="shop-card-premium" style="${bdr}"><div class="card-col" onclick='System.showWeaponModel(${JSON.stringify(sw).replace(/"/g,"&quot;")})' style="cursor:pointer;"><strong class="rank-${sw.rank}" style="font-size:1.2rem;">${sw.name}</strong><small style="color:#aaa;display:block;margin-top:5px;">磨損: ${sw.wear}%</small></div><button class="btn-claim-reward" style="${isE?'background:#222;color:#888;box-shadow:none;':'background:var(--purple);color:#fff;box-shadow:0 0 15px var(--purple);'}" onclick="System.equipWeapon(${sw.id})">${isE?'卸下裝備':'裝備'}</button></div>`; 
            }); 
        } else if(tab==='potion'){ 
            let has=false; DB.potions.forEach(pot=>{let amt=this.p.bag.potions[pot.id]||0; if(amt>0){has=true;h+=`<div class="shop-card-premium" style="border:1px solid var(--blue);"><div><strong style="color:var(--blue);font-size:1.2rem;">${pot.name} <span style="color:var(--gold)">x${amt}</span></strong></div><button class="btn-claim-reward" style="background:var(--blue);color:#000;box-shadow:0 0 15px var(--blue);" onclick="System.usePotion('${pot.id}')">使用</button></div>`;}}); 
            if(!has) h="<div style='padding:30px;color:#555;text-align:center;font-size:1.2rem;'>沒有任何藥水</div>"; 
        } else { 
            h+=`<div class="shop-card-premium" style="border-left:4px solid var(--blue)"><div class="card-col"><strong style="color:var(--blue);font-size:1.2rem;">邏輯碎片</strong></div><span style="font-size:2rem;font-weight:900;text-shadow:0 0 10px var(--blue);">${this.p.bag.mats.logic}</span></div>
                <div class="shop-card-premium" style="border-left:4px solid var(--gold)"><div class="card-col"><strong style="color:var(--gold);font-size:1.2rem;">語文符文</strong></div><span style="font-size:2rem;font-weight:900;text-shadow:0 0 10px var(--gold);">${this.p.bag.mats.lang}</span></div>
                <div class="shop-card-premium" style="border-left:4px solid var(--purple)"><div class="card-col"><strong style="color:var(--purple);font-size:1.2rem;">記憶結晶</strong></div><span style="font-size:2rem;font-weight:900;text-shadow:0 0 10px var(--purple);">${this.p.bag.mats.mem}</span></div>`; 
        } 
        document.getElementById('bag-list').innerHTML=h;
    },

    equipWeapon(id){if(this.p.curWeapon&&this.p.curWeapon.id===id)this.p.curWeapon=null;else this.p.curWeapon=this.p.bag.swords.find(s=>s.id===id);this.updateUI();this.renderBag('sword')},
    usePotion(pid){if(this.p.bag.potions[pid]<=0)return;this.p.bag.potions[pid]--;if(pid==='p_double'){this.p.buffs.doubleXp=true;showEpicRewardModal("BUFF 啟動", "下一次任務雙倍經驗生效！", "var(--gold)");}else if(pid==='p_time'){this.refreshShop(new Date().toLocaleDateString(),true);showEpicRewardModal("時光倒流", "商店已強制刷新", "var(--blue)");}else if(pid==='p_luck'){this.p.buffs.luck=true;showEpicRewardModal("幸運降臨", "下次抽稱號保底提升", "var(--gold)");}else if(pid==='p_seven')this.openSevenCloverModal();this.updateUI();this.renderBag('potion')},
    openSevenCloverModal(){let h="";DB.titles['A'].forEach(t=>{const o=this.p.titles.includes(t);h+=`<div class="card"><span class="rank-A">${t}</span><button class="btn-action" style="${o?'':'background:var(--gold);color:#000;'}" ${o?'disabled':''} onclick="System.pickATitle('${t}')">${o?'擁有':'選擇'}</button></div>`});document.getElementById('seven-clover-list').innerHTML=h;document.getElementById('seven-clover-modal').style.display='flex'},
    pickATitle(t){this.p.titles.push(t);this.p.curTitle=t;document.getElementById('seven-clover-modal').style.display='none';showEpicRewardModal("神級選擇", `成功獲得稱號：[${t}]`, "var(--gold)");this.updateUI()},
    
    renderForge(){
        document.getElementById('forge-m-logic').innerText=this.p.bag.mats.logic;document.getElementById('forge-m-lang').innerText=this.p.bag.mats.lang;document.getElementById('forge-m-mem').innerText=this.p.bag.mats.mem;
        let h="";if(this.p.bag.swords.length===0)h="<div style='padding:30px;text-align:center;color:#555;font-size:1.2rem;'>背包中無裝備可鍛造</div>";
        this.p.bag.swords.forEach(sw=>{ let req=sw.rank==='S'?7:(sw.rank==='A'?3:1); let can=(this.p.bag.mats.logic>=req&&this.p.bag.mats.lang>=req&&this.p.bag.mats.mem>=req); h+=`<div class="shop-card-premium" style="flex-direction:column;align-items:flex-start;"><div style="width:100%;display:flex;justify-content:space-between;margin-bottom:10px;"><strong class="rank-${sw.rank}" style="font-size:1.2rem;">${sw.name}</strong><span style="color:#aaa;font-size:12px;">磨損: ${sw.wear}%</span></div><div style="width:100%;display:flex;justify-content:space-between;align-items:center;"><span style="font-size:12px;color:#888;">消耗各碎片 x${req}</span><button class="btn-claim-reward" style="${can?'background:#ff8c00;color:#000;box-shadow:0 0 15px #ff8c00;':'background:#333;color:#666;box-shadow:none;'}" ${can?'':'disabled'} onclick="System.forgeWeapon(${sw.id},'${sw.rank}',${req})">⚒️ 修復</button></div></div>`; }); document.getElementById('forge-list').innerHTML=h;
    },
    forgeWeapon(id,rk,req){if(this.p.bag.mats.logic<req||this.p.bag.mats.lang<req||this.p.bag.mats.mem<req)return;this.p.bag.mats.logic-=req;this.p.bag.mats.lang-=req;this.p.bag.mats.mem-=req;let sw=this.p.bag.swords.find(w=>w.id===id);let red=rk==='S'?(1+Math.random()*0.5):(1+Math.random()*2);let nw=parseFloat(sw.wear)-red;if(nw<0)nw=0;sw.wear=nw.toFixed(3);if(this.p.curWeapon&&this.p.curWeapon.id===id)this.p.curWeapon.wear=sw.wear;showEpicRewardModal("⚒️ 鍛造成功", `兵器重獲新生！\n磨損度降低了 ${red.toFixed(3)}%`, "#ff8c00");this.save();this.renderForge()},
    
    async renderLeaderboard(){const el=document.getElementById('leaderboard-list');el.innerHTML="<div style='text-align:center;padding:30px;color:var(--gold);'>掃描全球獵人數據中...</div>";try{const snap=await getDocs(collection(db,"players"));let pD=[];snap.forEach(d=>pD.push(d.data()));pD.sort((a,b)=>{if(b.lv!==a.lv)return b.lv-a.lv;return b.exp-a.exp;});let h="";pD.forEach((d,i)=>{let w=d.curWeapon?`<span class="rank-${d.curWeapon.rank}">${d.curWeapon.name}</span>`:"徒手";h+=`<div class="quest-card-premium"><div class="rank-badge ${i===0?'top-1':(i===1?'top-2':(i===2?'top-3':''))}">${i+1}</div><div class="card-col" style="margin-left:15px;"><div style="display:flex;justify-content:space-between;"><strong style="font-size:1.2rem;">${d.acc}</strong><span style="color:var(--purple);font-weight:900;font-size:1.2rem;">Lv.${d.lv}</span></div><div style="font-size:11px;color:var(--gold);margin-top:5px;">[ ${d.curTitle} ]</div><div style="font-size:11px;color:#888;margin-top:2px;">⚔️ ${w}</div></div></div>`;});el.innerHTML=h}catch(e){el.innerHTML="<div style='color:red;'>連線失敗</div>"}},
    
    async renderPartner(){
        const el=document.getElementById('partner-status-area');el.innerHTML="<div style='text-align:center;padding:30px;'>連線中...</div>";try{const ms=await getDoc(doc(db,"players",this.p.acc));if(ms.exists())this.p=ms.data();let h="";
        if(this.p.partner){const ps=await getDoc(doc(db,"players",this.p.partner));if(ps.exists()){let pd=ps.data();let w=pd.curWeapon?`<span class="rank-${pd.curWeapon.rank}">${pd.curWeapon.name}</span>`:"徒手";h+=`<div style="text-align:center;color:var(--comrade-green);font-weight:900;margin-bottom:15px;text-shadow:0 0 10px var(--comrade-green);font-size:1.2rem;">🔗 PACT ESTABLISHED</div><div class="quest-card-premium" style="flex-direction:column;padding:30px;border:2px solid var(--comrade-green);box-shadow:inset 0 0 30px rgba(0,255,170,0.1);"><h3 style="color:var(--comrade-green);margin:0 0 15px 0;font-size:2rem;text-shadow:0 0 10px var(--comrade-green);">${pd.acc}</h3><div style="width:100%;display:flex;justify-content:space-between;font-weight:900;font-size:1.2rem;margin-bottom:10px;"><span>Level:</span><span style="color:var(--purple);">${pd.lv}</span></div><div style="width:100%;display:flex;justify-content:space-between;margin-bottom:10px;"><span>Title:</span><span style="color:var(--gold);font-size:1rem;">[ ${pd.curTitle} ]</span></div><div style="width:100%;display:flex;justify-content:space-between;margin-bottom:20px;"><span style="color:#aaa;font-size:1rem;">Weapon:</span><span style="font-size:1rem;">${w}</span></div><button class="btn-claim-reward" style="width:100%;background:#ff0055;color:#fff;box-shadow:0 0 15px #ff0055;" onclick="System.breakPact()">強制解除契約</button></div>`;}else{h+=`<button class="btn-claim-reward" style="background:#ff0055;box-shadow:0 0 15px #ff0055;" onclick="System.breakPact()">強制解除異常連線</button>`;}}
        else{h+=`<div style="background:rgba(0,255,170,0.05);border:1px solid var(--comrade-green);padding:20px;border-radius:10px;box-shadow:0 0 15px rgba(0,255,170,0.1);"><input type="text" id="inp-partner-req" style="width:100%;padding:15px;background:#000;border:1px solid #555;color:#fff;margin-bottom:15px;border-radius:5px;font-size:1.1rem;" placeholder="輸入同學的 ID..."><button class="btn-claim-reward" style="width:100%;background:var(--comrade-green);color:#000;" onclick="System.sendPactReq()">發送組隊邀請</button></div><h3 class="section-title" style="margin-top:30px;">收到邀請</h3>`;if(this.p.requests&&this.p.requests.length>0){this.p.requests.forEach(r=>{h+=`<div class="shop-card-premium" style="border-left:4px solid var(--comrade-green);"><strong style="font-size:1.2rem;">${r}</strong><div><button class="btn-claim-reward" style="background:var(--comrade-green);color:#000;margin-right:10px;padding:8px 15px;" onclick="System.acceptPact('${r}')">同意</button><button class="btn-claim-reward" style="background:#444;box-shadow:none;padding:8px 15px;" onclick="System.rejectPact('${r}')">拒絕</button></div></div>`;});}else h+="<div style='padding:20px;text-align:center;color:#555;'>目前無人邀請</div>";}el.innerHTML=h}catch(e){el.innerHTML="<div style='color:red;'>連線失敗</div>"}
    },
    async sendPactReq(){const tgt=document.getElementById('inp-partner-req').value.trim();if(!tgt||tgt===this.p.acc)return showEpicRewardModal("錯誤", "無效的ID", "#ff0055");try{const ref=doc(db,"players",tgt);const snap=await getDoc(ref);if(!snap.exists())return showEpicRewardModal("錯誤", "查無此人", "#ff0055");let td=snap.data();if(td.partner)return showEpicRewardModal("錯誤", "對方已有戰友", "#ff0055");if(!td.requests)td.requests=[];if(td.requests.includes(this.p.acc))return showEpicRewardModal("提示", "已經發送過邀請", "#aaa");td.requests.push(this.p.acc);await setDoc(ref,td);showEpicRewardModal("成功", "邀請已送出", "var(--comrade-green)");document.getElementById('inp-partner-req').value="";}catch(e){}},
    async acceptPact(tgt){try{const ref=doc(db,"players",tgt);const snap=await getDoc(ref);if(snap.exists()){let td=snap.data();if(td.partner){showEpicRewardModal("錯誤", "對方已跟別人結盟", "#ff0055");this.rejectPact(tgt);return;}td.partner=this.p.acc;await setDoc(ref,td);}}catch(e){}this.p.partner=tgt;this.p.requests=this.p.requests.filter(r=>r!==tgt);await this.save();showEpicRewardModal("契約成立", "能力值加成已啟動！", "var(--comrade-green)");this.updateUI();this.renderPartner()},
    async rejectPact(tgt){this.p.requests=this.p.requests.filter(r=>r!==tgt);await this.save();this.renderPartner()},
    async breakPact(){if(!confirm("確定要解除契約嗎?"))return;try{if(this.p.partner){const ref=doc(db,"players",this.p.partner);const snap=await getDoc(ref);if(snap.exists()){let td=snap.data();td.partner=null;await setDoc(ref,td);}}}catch(e){}this.p.partner=null;await this.save();showEpicRewardModal("提示", "契約已解除", "#ff0055");this.updateUI();this.renderPartner()},

    // 👑 終極修復：上帝終端機存檔與選單
    verifyAdmin(){if(document.getElementById('inp-admin-pwd').value==='Ricky_0414'){this.isAdminUnlocked=true;document.getElementById('admin-login').style.display='none';document.getElementById('admin-panel').style.display='flex';this.renderAdminPanel()}else showEpicRewardModal("存取拒絕", "密碼錯誤", "#ff0055")},
    renderAdminPanel(){
        ['lv','coins','sp','iq','str','mp','dex'].forEach(k=>{const el=document.getElementById(`adm-${k}`); if(el) el.value=Math.floor(this.p[k])});
        let sOpt="<option value=''>-- 選擇武具 --</option>";Object.keys(DB.swords).forEach(rk=>{sOpt+=`<optgroup label="${rk}-RANK">`;DB.swords[rk].forEach(x=>{let name=typeof x==='object'?x.name:x;sOpt+=`<option value="${rk}|${name}">${name}</option>`;});sOpt+=`</optgroup>`;});document.getElementById('adm-sel-sword').innerHTML=sOpt;
        let tOpt="<option value=''>-- 選擇稱號 --</option>";Object.keys(DB.titles).forEach(rk=>{tOpt+=`<optgroup label="${rk}-RANK">`;DB.titles[rk].forEach(tName=>{tOpt+=`<option value="${tName}">${tName}</option>`;});tOpt+=`</optgroup>`;});document.getElementById('adm-sel-title').innerHTML=tOpt;
    },
    async adminSetStats(){
        let t=document.getElementById('adm-target').value.trim();
        let d={};
        ['lv','coins','sp','iq','str','mp','dex'].forEach(k=>{ const val=document.getElementById(`adm-${k}`).value; d[k]=val?parseInt(val):1; });
        d.exp=this.getMaxExp(d.lv-1); if(d.lv===1) d.exp=0;
        if(!t||t===this.p.acc){
            Object.assign(this.p,d);
            this.save(); // 🔥 這個我之前漏掉了！補上才能強制存檔！
            this.updateUI();
            showEpicRewardModal("SYSTEM OVERRIDE", "數值已強制竄改！", "var(--purple)");
        }else{
            try{const r=doc(db,"players",t);const s=await getDoc(r);if(s.exists()){let td=s.data();Object.assign(td,d);await setDoc(r,td);showEpicRewardModal("SYSTEM OVERRIDE", `已竄改目標 [${t}] 的數值`, "var(--purple)")}else showEpicRewardModal("錯誤", "找不到該玩家", "#ff0055")}catch(e){}
        }
    },
    async adminGiveSword(){
        const val=document.getElementById('adm-sel-sword').value;if(!val)return showEpicRewardModal("提示", "請先選擇武器", "#aaa");const p=val.split('|');const tgtD=DB.swords[p[0]].find(s=>(typeof s==='object'?s.name:s)===p[1]);let itm={id:Date.now(),name:p[1],rank:p[0],wear:p[0]==='UNKNOWN'?'???':'0.000',desc:typeof tgtD==='object'?tgtD.desc:'',price:0};let t=document.getElementById('adm-target').value.trim();
        if(!t||t===this.p.acc){this.p.bag.swords.push(itm);this.save();showEpicRewardModal("發放成功", `兵器 [${p[1]}] 已放入背包`, "var(--purple)")}else{try{const r=doc(db,"players",t);const s=await getDoc(r);if(s.exists()){let td=s.data();td.bag.swords.push(itm);await setDoc(r,td);showEpicRewardModal("發放成功", `已將 [${p[1]}] 發送給 ${t}`, "var(--purple)")}}catch(e){}}
    },
    async adminGiveTitle(){
        const val=document.getElementById('adm-sel-title').value;if(!val)return showEpicRewardModal("提示", "請先選擇稱號", "#aaa");let t=document.getElementById('adm-target').value.trim();
        if(!t||t===this.p.acc){if(!this.p.titles.includes(val)){this.p.titles.push(val);this.save();showEpicRewardModal("解鎖成功", `已取得稱號 [${val}]`, "var(--gold)")}}else{try{const r=doc(db,"players",t);const s=await getDoc(r);if(s.exists()){let td=s.data();if(!td.titles.includes(val)){td.titles.push(val);await setDoc(r,td);showEpicRewardModal("發放成功", `已為 ${t} 解鎖稱號`, "var(--gold)")}}}catch(e){}}
    },
    async adminGiveMats(){let t=document.getElementById('adm-target').value.trim();if(!t||t===this.p.acc){this.p.bag.mats.logic+=100;this.p.bag.mats.lang+=100;this.p.bag.mats.mem+=100;this.save();showEpicRewardModal("資源注入", "全素材 +100", "var(--purple)")}else{try{const r=doc(db,"players",t);const s=await getDoc(r);if(s.exists()){let td=s.data();td.bag.mats.logic+=100;td.bag.mats.lang+=100;td.bag.mats.mem+=100;await setDoc(r,td);showEpicRewardModal("資源注入", `已給予 ${t} 全素材`, "var(--purple)")}}catch(e){}}},
    async adminGivePotions(){let t=document.getElementById('adm-target').value.trim();if(!t||t===this.p.acc){['p_double','p_time','p_luck','p_seven'].forEach(p=>this.p.bag.potions[p]=(this.p.bag.potions[p]||0)+10);this.save();showEpicRewardModal("資源注入", "全藥水 +10", "var(--blue)")}else{try{const r=doc(db,"players",t);const s=await getDoc(r);if(s.exists()){let td=s.data();['p_double','p_time','p_luck','p_seven'].forEach(p=>td.bag.potions[p]=(td.bag.potions[p]||0)+10);await setDoc(r,td);showEpicRewardModal("資源注入", `已給予 ${t} 全藥水`, "var(--blue)")}}catch(e){}}},
    async adminPunish(){const tgt=document.getElementById('adm-target').value.trim();if(!tgt)return;try{const r=doc(db,"players",tgt);const s=await getDoc(r);if(s.exists()){let d=s.data();if(d.partner){const pr=doc(db,"players",d.partner);const ps=await getDoc(pr);if(ps.exists()){let pd=ps.data();pd.partner=null;await setDoc(pr,pd)}}d.lv=1;d.exp=0;d.coins=0;d.sp=0;d.iq=1;d.str=1;d.mp=1;d.dex=1;d.curTitle="🚫 卑鄙的作弊者";d.titles=["🚫 卑鄙的作弊者"];d.bag={swords:[],potions:{},mats:{logic:0,lang:0,mem:0}};d.curWeapon=null;d.activeQuests=[];d.partner=null;d.requests=[];await setDoc(r,d);showEpicRewardModal("天罰", `玩家 ${tgt} 已被徹底重置`, "#ff0055")}else showEpicRewardModal("錯誤", "無此人", "#ff0055")}catch(e){}},

    startHeartbeat(){const b=()=>{if(this.p)updateDoc(doc(db,"players",this.p.acc),{lastSeen:Date.now()})};b();setInterval(b,30000)},
    async renderWorld(){const a=document.getElementById('online-list');if(this.unsubWorld)this.unsubWorld();this.unsubWorld=onSnapshot(collection(db,"players"),(sn)=>{let h="";sn.forEach(d=>{const x=d.data();if(x.acc!==this.p?.acc && x.acc!=='admin'){const on=x.lastSeen&&(Date.now()-x.lastSeen<65000);h+=`<div class="shop-card-premium"><div><span class="status-dot ${on?'dot-online':'dot-offline'}"></span><strong style="${on?'color:#fff;text-shadow:0 0 5px #fff;':'color:#888;'}font-size:1.2rem;">${x.acc}</strong> <small style="color:#666">Lv.${x.lv}</small></div>${on?`<button class="btn-claim-reward" style="background:var(--comrade-green);color:#000;box-shadow:0 0 10px rgba(0,255,170,0.5);padding:8px 15px;" onclick="TradeSystem.startTrade('${x.acc}')">🤝 交易</button>`:'<small style="color:#444">離線</small>'}</div>`}});a.innerHTML=h})},
    listenForInvites(){if(this.unsubInvites)this.unsubInvites();this.unsubInvites=onSnapshot(query(collection(db,"trades"),where("target","==",this.p.acc),where("status","==","pending")),(sn)=>{sn.docChanges().forEach(c=>{if(c.type==="added"){const d=c.doc.data();if(TradeSystem.currentTradeId===c.doc.id)return;setTimeout(()=>{if(confirm(`📦 收到 [${d.sender}] 的交易請求！進入交易室？`)){TradeSystem.joinTrade(c.doc.id,d)}else{updateDoc(doc(db,"trades",c.doc.id),{status:"rejected"})}},100)}})})}
};

// 🤝 交易系統保持原本的究極安全防護
const TradeSystem = {
    currentTradeId: null, unsubTrade: null, countdownInterval: null, countdownSec: 5, isExecuting: false,
    async startTrade(tgt){const id=`trade_${Date.now()}`;const d={id,sender:System.p.acc,target:tgt,status:"pending",offerA:{coins:0,items:[]},offerB:{coins:0,items:[]},readyA:false,readyB:false,chat:[]};await setDoc(doc(db,"trades",id),d);this.joinTrade(id,d)},
    joinTrade(id,data){
        this.currentTradeId=id;this.isExecuting=false;document.getElementById('trade-overlay').style.display='flex';document.getElementById('peer-name-label').innerText=(data.sender===System.p.acc?data.target:data.sender);this.buildItemSelect();
        if(this.unsubTrade)this.unsubTrade();this.unsubTrade=onSnapshot(doc(db,"trades",id),async(snap)=>{if(!snap.exists())return this.cancelTrade();const d=snap.data();if(d.status==="rejected"){alert("❌ 交易已取消");this.cancelTrade()}if(d.status==="completed"){showEpicRewardModal("交易成功", "物品已放入背包", "var(--purple)");try{System.p=(await getDoc(doc(db,"players",System.p.acc))).data();System.updateUI()}catch(e){}this.cancelTrade()}if(d.status==="pending")this.renderTradeUI(d)})
    },
    buildItemSelect(){
        let sel=document.getElementById('trade-item-select');let h="<option value=''>-- 選背包物品 (每次1個) --</option>";
        System.p.bag.swords.forEach(s=>{h+=`<option value="s|${s.id}">⚔️ ${s.name} [${s.wear}%]</option>`});
        ['logic','lang','mem'].forEach(m=>{if(System.p.bag.mats[m]>0)h+=`<option value="m|${m}">🧩 ${m==='logic'?'邏輯碎片':m==='lang'?'語文符文':'記憶結晶'} (有${System.p.bag.mats[m]}個)</option>`});sel.innerHTML=h
    },
    async addItemToOffer(){
        const val=document.getElementById('trade-item-select').value;if(!val)return;const d=(await getDoc(doc(db,"trades",this.currentTradeId))).data();const isA=(System.p.acc===d.sender);const myO=isA?d.offerA:d.offerB;const p=val.split('|');
        if(p[0]==='s'){let itm=System.p.bag.swords.find(x=>x.id===parseInt(p[1]));if(itm&&!myO.items.find(x=>x.id===itm.id))myO.items.push(itm)}else if(p[0]==='m'){const n=p[1]==='logic'?'邏輯碎片':p[1]==='lang'?'語文符文':'記憶結晶';let ex=myO.items.find(x=>x.id===p[1]);if(ex){if(ex.amt<System.p.bag.mats[p[1]])ex.amt++}else myO.items.push({id:p[1],type:'mat',name:n,amt:1})}
        updateDoc(doc(db,"trades",this.currentTradeId),isA?{"offerA.items":myO.items,readyA:false,readyB:false}:{"offerB.items":myO.items,readyA:false,readyB:false});document.getElementById('trade-item-select').value=""
    },
    renderTradeUI(d){
        const isA=(d.sender===System.p.acc);const myO=isA?d.offerA:d.offerB;const peO=isA?d.offerB:d.offerA;const myR=isA?d.readyA:d.readyB;const peR=isA?d.readyB:d.readyA;const btn=document.getElementById('btn-confirm-trade');
        document.getElementById('my-offer-list').innerHTML=`<span style="color:var(--gold);font-size:1.2rem;font-weight:900;text-shadow:0 0 5px var(--gold);">💰 ${myO.coins}</span><br>`+myO.items.map(i=>`[${i.name}${i.amt?' x'+i.amt:''}]`).join('<br>');
        document.getElementById('peer-offer-list').innerHTML=`<span style="color:var(--gold);font-size:1.2rem;font-weight:900;text-shadow:0 0 5px var(--gold);">💰 ${peO.coins}</span><br>`+peO.items.map(i=>`[${i.name}${i.amt?' x'+i.amt:''}]`).join('<br>');
        document.getElementById('peer-ready-status').innerHTML=peR?"<span style='color:var(--comrade-green);text-shadow:0 0 5px var(--comrade-green);font-weight:bold;'>🟢 對方已確認</span>":"<span style='color:#888;'>⚪ 等待中</span>";
        document.getElementById('peer-trade-box').style.borderColor=peR?"var(--comrade-green)":"#333";
        if(d.readyA&&d.readyB&&d.status==="pending"){if(!this.countdownInterval&&!this.isExecuting){this.countdownSec=5;btn.innerHTML=`🔒 鎖定倒數... <span style="font-size:1.2rem;color:#ff0055">${this.countdownSec}s</span>`;btn.style.background="var(--gold)";btn.style.color="#000";btn.style.boxShadow="0 0 20px var(--gold)";btn.disabled=true;this.countdownInterval=setInterval(()=>{this.countdownSec--;if(this.countdownSec>0){btn.innerHTML=`🔒 鎖定倒數... <span style="font-size:1.2rem;color:#ff0055">${this.countdownSec}s</span>`;}else{clearInterval(this.countdownInterval);this.countdownInterval=null;btn.innerText="處理中...";if(isA&&!this.isExecuting){this.isExecuting=true;this.executeFinal(d)}}},1000)}}else{if(this.countdownInterval){clearInterval(this.countdownInterval);this.countdownInterval=null}btn.disabled=false;btn.innerText=myR?"⏳ 等待對方...":"✔️ 確認提議";btn.style.background=myR?"#004422":"#222";btn.style.color=myR?"#888":"var(--comrade-green)";btn.style.border=myR?"1px solid #004422":"1px solid var(--comrade-green)";btn.style.boxShadow=myR?"none":"0 0 10px rgba(0,255,170,0.2)";}
        const cb=document.getElementById('trade-chat');cb.innerHTML=d.chat.map(m=>`<div class="chat-msg"><span class="chat-name" style="color:var(--blue)">${m.user}:</span> <span style="color:#fff">${m.msg}</span></div>`).join('');cb.scrollTop=cb.scrollHeight
    },
    async updateOffer(){const c=parseInt(document.getElementById('trade-coin-input').value)||0;if(c>System.p.coins)return alert("蓮幣不足");const d=(await getDoc(doc(db,"trades",this.currentTradeId))).data();const isA=(System.p.acc===d.sender);updateDoc(doc(db,"trades",this.currentTradeId),isA?{"offerA.coins":c,readyA:false,readyB:false}:{"offerB.coins":c,readyA:false,readyB:false})},
    async confirmReady(){const d=(await getDoc(doc(db,"trades",this.currentTradeId))).data();const isA=(System.p.acc===d.sender);updateDoc(doc(db,"trades",this.currentTradeId),isA?{readyA:true}:{readyB:true})},
    async sendChat(){const i=document.getElementById('trade-msg-input');const m=i.value.trim();if(!m)return;updateDoc(doc(db,"trades",this.currentTradeId),{chat:arrayUnion({user:System.p.acc,msg:m})});i.value=""},
    async cancelTrade(){if(this.countdownInterval){clearInterval(this.countdownInterval);this.countdownInterval=null}if(this.currentTradeId)updateDoc(doc(db,"trades",this.currentTradeId),{status:"rejected"});if(this.unsubTrade)this.unsubTrade();this.currentTradeId=null;document.getElementById('trade-overlay').style.display='none'},
    async executeFinal(d){try{await runTransaction(db,async(t)=>{const rA=doc(db,"players",d.sender);const rB=doc(db,"players",d.target);const rT=doc(db,"trades",d.id);const tradeSnap=await t.get(rT);if(tradeSnap.data().status!=="pending")throw "交易已處理過";const uA=(await t.get(rA)).data();const uB=(await t.get(rB)).data();if(uA.coins<d.offerA.coins||uB.coins<d.offerB.coins)throw "金額不足";uA.coins=uA.coins-d.offerA.coins+d.offerB.coins;uB.coins=uB.coins-d.offerB.coins+d.offerA.coins;d.offerA.items.forEach(i=>{if(i.type==='mat'){uA.bag.mats[i.id]-=i.amt;uB.bag.mats[i.id]+=i.amt}else{uA.bag.swords=uA.bag.swords.filter(s=>s.id!==i.id);uB.bag.swords.push(i);if(uA.curWeapon&&uA.curWeapon.id===i.id)uA.curWeapon=null}});d.offerB.items.forEach(i=>{if(i.type==='mat'){uB.bag.mats[i.id]-=i.amt;uA.bag.mats[i.id]+=i.amt}else{uB.bag.swords=uB.bag.swords.filter(s=>s.id!==i.id);uA.bag.swords.push(i);if(uB.curWeapon&&uB.curWeapon.id===i.id)uB.curWeapon=null}});t.update(rA,uA);t.update(rB,uB);t.update(rT,{status:"completed"})})}catch(e){if(e!=="交易已處理過"){alert("交易失敗: "+e);this.cancelTrade()}}}
};

window.System = System; 
window.TradeSystem = TradeSystem;