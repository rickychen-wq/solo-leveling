import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, collection, getDocs, onSnapshot, query, where, updateDoc, arrayUnion, runTransaction } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// 🔥 Firebase 設定
const firebaseConfig = {
    apiKey: "AIzaSyDfaC7sWiz--IXnOQq9Qw0ICNDT8MpZE5o",
    authDomain: "solo-leveling-server.firebaseapp.com",
    projectId: "solo-leveling-server",
    storageBucket: "solo-leveling-server.firebasestorage.app",
    messagingSenderId: "979607975137",
    appId: "1:979607975137:web:70224f438280bafebf73a0",
    measurementId: "G-8E64C4CNSZ"
};
const app = initializeApp(firebaseConfig); 
const db = getFirestore(app);

// 🗡️ 全息武器 SVG 模型庫
const SWORD_MODELS = {
    SWORD: `<svg class="weapon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14.5 3L21 9.5M10.5 7L17 13.5M3 21L11 13M10 21L12 19M19 10L21 8" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    DAGGER: `<svg class="weapon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 14L21 3M14 10L17 13" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    HEAVY: `<svg class="weapon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 3L21 6L6 21L3 18L18 3Z" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    SPEAR: `<svg class="weapon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 3L10 14L14 21L21 3ZM3 21L10 14" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    AXE: `<svg class="weapon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 10L3 21M14 10L21 3M14 10L21 17L17 21L10 14Z" stroke-linecap="round" stroke-linejoin="round"/></svg>`
};

// 📚 終極完整資料庫 (絕對沒閹割！)
const DB = {
    titles: {
        S: ["創世神：萬象起源", "虛空之王：秩序崩壞者", "因果律：命運編織者", "永恆傳說：不朽之冠", "唯一神：降臨之光"],
        A: ["位面守護者", "不滅戰神", "真理探求者", "弒龍大師", "諸神黃昏", "至高審判長", "永恆之光", "極暗深淵", "時空旅人", "萬物生靈主", "禁忌魔法師", "聖靈大先知", "絕對零度", "戰場的主宰", "混沌掌控者", "劍之頂峰", "傳奇奠基人", "天災化身", "銀河開拓者", "靈魂收割者", "帝國之牆", "神聖制裁者", "無極劍聖", "末日執行官", "破法領主"],
        B: ["大地粉碎者", "蒼穹之眼", "暗夜主宰", "王國重臣", "災厄終結者", "巨龍獵人", "戰地指揮官", "聖殿執行官", "幻影遊俠", "秘法大師", "鋼鐵要塞", "風暴使徒", "斷罪之刃", "極限生存者", "審判官", "狂瀾追逐者", "守護神盾", "破曉之星", "血色紅蓮", "孤傲之狼", "聖域守門人", "虛空行者", "戰鬥藝術家", "王牌尖兵", "無懼勇者", "輝煌之刃", "元素主導者", "深淵監視者", "重力主宰", "鐵血領主"],
        C: ["前線突擊手", "荒野獵手", "鋼鐵意志", "熟練冒險家", "戰術小隊長", "狂暴戰斧", "影之追蹤者", "銀翼先鋒", "疾風劍士", "元素感知者", "守望先驅", "烈焰行者", "重裝步兵", "沉默的暗殺員", "穿雲箭手", "黎明守護者", "符文操作員", "鋼鐵守望", "中堅力量", "碎石者", "極光使者", "戰場齒輪", "精銳士官", "秘法學徒", "獵魔小隊", "不屈之魂", "疾走之影", "狂想曲員", "寒冰操縱者", "堅盾守衛"],
        D: ["村莊守望者", "鐵鏽新秀", "持劍平民", "冒險初學者", "見習騎士", "準時下班員", "小鎮地頭蛇", "森林清道夫", "略懂皮毛", "憤怒的小鳥", "正義路人", "銅級傭兵", "脫殼小龍", "剛學會走路", "基礎操縱者", "先遣部隊", "戰地記者", "幸運的生還者", "武器試用員", "略有小成", "粗糙的戰士", "模仿大師", "鐵打的龍套", "初級執行者", "民間高手(自稱)", "熱血少年", "頑強的甲蟲", "破舊皮甲魂", "基礎訓練生", "準準冒險者"],
        E: ["戰鬥力 0.5", "走路草", "實習砲灰", "裝備回收員", "迷路的羔羊", "萌新一號", "戰場觀光客", "史萊姆之友", "甚至不是人類", "呼吸也會累", "落地成盒", "走位靠賽", "後勤搬運工", "萬年候補生", "塵埃邊緣人", "訓練用假人", "尚未覺醒", "零戰力戰士", "掃地阿伯", "路人甲", "雜草魂", "無名小卒", "勇者預備軍", "體力廢材", "眼神死的菜鳥", "邊緣雜魚", "戰場背景板", "脆弱的靈魂", "純潔無垢", "剛下山的傻子"]
    },
    swords: {
        UNKNOWN: [{name:"虛空之痕 · 零", desc:"數值顯示為 ???"}], 
        S: [{name:"天御·雷神切", desc:"攻擊附帶連鎖閃電"}, {name:"冥王·枯萎之鐮", desc:"擊中吸取 5% 生命值"}, {name:"時空·斷層", desc:"機率觸發「時間靜止」1 秒"}, {name:"聖光·大領主", desc:"對暗屬性雙倍傷害，自帶護盾"}],
        A: ["龍脊長刀", "碎星者", "妖刀·村正", "極光細劍", "重力粉碎者", "寒冰之咬", "黑曜石巨劍", "風靈疾走"],
        B: ["鋼鐵重刃", "影殺短刀", "獵人彎刀", "符文長劍", "烈焰直劍", "毒牙匕首", "騎士團佩劍", "破甲刺劍", "巨浪斬馬刀", "守望者長槍", "精準獵刀", "閃爍之刃", "荒野戰斧", "密林獵手", "沉重鐵鎚"],
        C: ["老練長劍", "士兵佩刀", "強化鐵劍", "寬刃大刀", "輕量化匕首", "巡邏隊長之劍", "護衛手杖", "鋒利切肉刀", "雙手巨劍", "練習用長刀", "鐵製短劍", "守城衛士槍", "野外求生刀", "礦工十字鎬", "粗製大劍"],
        D: ["生鏽鐵片", "磨損的砍刀", "舊式刺刀", "木柄短劍", "歪斜的匕首", "鈍掉的菜刀", "破損長槍", "重鑄的廢鐵", "路邊的小刀", "脆弱的竹劍", "農用鐮刀", "缺口的佩刀", "簡易長矛", "粗糙的斧頭", "採集用小鏟"],
        E: ["傳說中的木棒", "削鉛筆刀", "斷掉的樹枝", "生鏽的圖釘", "破爛的鍋鏟", "紙紮的劍", "髒掉的抹布", "塑膠玩具刀", "爛掉的傘骨", "沒水的原子筆", "湯勺", "雞毛撣子", "缺了一角的小石塊", "過期的法棍麵包", "只有柄的劍"]
    },
    potions: [
        { id: "p_double", name: "🧪 雙倍經驗藥劑", price: 350, desc: "下次結算雙倍 XP" }, 
        { id: "p_time", name: "⏳ 時光沙漏", price: 450, desc: "立刻刷新商店物品" }, 
        { id: "p_luck", name: "🍀 幸運四葉草", price: 850, desc: "下次升級保底 B 級以上稱號" }, 
        { id: "p_seven", name: "✨ 七葉草藥水", price: 3500, desc: "直接任選一個 A 級稱號" }
    ],
    cloudGates: []
};

const StorageMgr = { 
    get(key) { try { return localStorage.getItem(key); } catch(e) { return window.tempStore ? window.tempStore[key] : null; } }, 
    set(key, val) { try { localStorage.setItem(key, val); } catch(e) { window.tempStore = window.tempStore || {}; window.tempStore[key] = val; } } 
};

// 🎮 遊戲核心系統
const System = {
    p: null, shopCache: null, timerIdx: null, isAdminUnlocked: false, unsubWorld: null,
    rankWeight: { 'UNKNOWN':7, 'S':6, 'A':5, 'B':4, 'C':3, 'D':2, 'E':1 },
    
    async login() {
        const acc = document.getElementById('inp-acc').value.trim(); 
        const pwd = document.getElementById('inp-pwd').value.trim();
        if (!acc || !pwd) return alert("請輸入 ID 與密碼！"); 
        
        document.getElementById('btn-login').innerText = "CONNECTING...";
        try {
            const ref = doc(db, "players", acc); 
            const snap = await getDoc(ref);
            if (snap.exists()) {
                let d = snap.data(); 
                if (d.pwd && d.pwd !== pwd) { 
                    document.getElementById('btn-login').innerText = "INITIALIZE"; 
                    return alert("密碼錯誤！"); 
                }
                if (!d.pwd) { d.pwd = pwd; await setDoc(ref, d); } 
                this.p = d;
                
                // 確保舊帳號欄位齊全
                if(!this.p.bag) this.p.bag = {swords:[], potions:{}, mats:{logic:0, lang:0, mem:0}}; 
                if(!this.p.buffs) this.p.buffs = {doubleXp:false, luck:false};
                if(!this.p.activeQuests) this.p.activeQuests = []; 
                if(this.p.partner === undefined) this.p.partner = null; 
                if(!this.p.requests) this.p.requests = [];
            } else {
                // 創建新角色
                this.p = { 
                    acc, pwd, lv:1, exp:0, coins:0, sp:0, iq:1, str:1, mp:1, dex:1, 
                    titles:["尚未覺醒"], curTitle:"尚未覺醒", curWeapon:null, 
                    bag:{swords:[], potions:{}, mats:{logic:0, lang:0, mem:0}}, 
                    buffs:{doubleXp:false, luck:false}, 
                    activeQuests:[], partner:null, requests:[] 
                };
                await setDoc(ref, this.p);
            }
            
            document.getElementById('login-ui').style.display = 'none';
            this.checkShopRefresh(); 
            this.updateUI(); 
            this.startHeartbeat(); 
            this.listenForInvites(); 
            this.startGlobalTimer(); 
            this.fetchWorldGates();
        } catch (e) { 
            alert("連線失敗"); 
            document.getElementById('btn-login').innerText = "INITIALIZE"; 
        }
    },
    
    async save() { 
        if(this.p) { 
            try { 
                const snap = await getDoc(doc(db,"players",this.p.acc)); 
                if(snap.exists()) {
                    this.p.partner = snap.data().partner !== undefined ? snap.data().partner : this.p.partner; 
                    this.p.requests = snap.data().requests || [];
                } 
                await setDoc(doc(db,"players",this.p.acc), this.p); 
            } catch(e) { console.error(e); } 
        } 
    },
    
    nav(id, e) {
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active')); 
        document.getElementById(id).classList.add('active');
        if(e) { 
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active')); 
            e.target.classList.add('active'); 
        }
        if(id === 'p-world') this.renderWorld(); 
        if(id === 'p-dungeon') { this.fetchWorldGates(); this.renderQuests(); } 
        if(id === 'p-enhance') this.renderUpgrades();
        if(id === 'p-titles') this.renderTitles(); 
        if(id === 'p-inventory') this.renderBag('sword'); 
        if(id === 'p-forge') this.renderForge();
        if(id === 'p-shop') { if(!this.shopCache) this.checkShopRefresh(); this.renderShop('sword'); } 
        if(id === 'p-rank') this.renderLeaderboard();
        if(id === 'p-partner') this.renderPartner(); 
        if(id === 'p-code' && this.isAdminUnlocked) this.renderAdminPanel();
    },
    
    getMaxExp(lv) { return lv <= 30 ? 100 + (lv - 1) * 50 : 100 + 29 * 50 + (lv - 30) * 100; },
    getRank(lv) { 
        if(lv>=100) return{r:"國家級獵人",c:"rank-UNKNOWN"}; 
        if(lv>=71) return{r:"S-RANK HUNTER",c:"rank-S"}; 
        if(lv>=51) return{r:"A-RANK HUNTER",c:"rank-A"}; 
        if(lv>=36) return{r:"B-RANK HUNTER",c:"rank-B"}; 
        if(lv>=21) return{r:"C-RANK HUNTER",c:"rank-C"}; 
        if(lv>=11) return{r:"D-RANK HUNTER",c:"rank-D"}; 
        return{r:"E-RANK HUNTER",c:"rank-E"}; 
    },
    
    updateUI() {
        if(!this.p) return; 
        document.getElementById('ui-name').innerText = this.p.acc; 
        document.getElementById('ui-lv').innerText = `LEVEL: ${this.p.lv}`; 
        document.getElementById('ui-lv-big').innerText = this.p.lv;
        document.getElementById('ui-coins').innerText = `💰 ${Math.floor(this.p.coins)}`; 
        document.getElementById('ui-sp').innerText = `剩餘點數: ${this.p.sp}`; 
        document.getElementById('ui-title').innerText = `[ ${this.p.curTitle} ]`; 
        document.getElementById('ui-weapon').innerText = this.p.curWeapon ? `⚔️ ${this.p.curWeapon.name} [${this.p.curWeapon.rank}]` : "⚔️ 徒手";
        
        const rankInfo = this.getRank(this.p.lv); 
        document.getElementById('ui-rank').innerText = rankInfo.r; 
        document.getElementById('ui-rank').className = rankInfo.c;

        const maxExp = this.getMaxExp(this.p.lv); 
        document.getElementById('ui-xp-fill').style.width = `${Math.min((this.p.exp/maxExp)*100, 100)}%`; 
        document.getElementById('ui-xp-txt').innerText = `${Math.floor(this.p.exp)} / ${maxExp} XP`;
        
        let bonusStr = 0; 
        if(this.p.curWeapon) { 
            if(this.p.curWeapon.rank==='B') bonusStr=5; 
            if(this.p.curWeapon.rank==='C') bonusStr=3; 
            if(this.p.curWeapon.rank==='D') bonusStr=1; 
        }
        
        ['iq','str','mp','dex'].forEach(k => { 
            let disp = this.p[k]; 
            if(k==='str' && bonusStr>0) disp += `<span class="stat-bonus">+${bonusStr}</span>`; 
            document.getElementById(`v-${k}`).innerHTML = disp; 
        });
        
        let buffHtml = ""; 
        if(this.p.buffs.doubleXp) buffHtml += `<span class="badge badge-buff">2x XP</span>`; 
        if(this.p.buffs.luck) buffHtml += `<span class="badge badge-buff">幸運保底</span>`; 
        if(this.p.partner) buffHtml += `<span class="badge badge-buff" style="border-color:var(--comrade-green); color:var(--comrade-green);">戰友 +10%</span>`; 
        document.getElementById('buff-zone').innerHTML = buffHtml; 
        
        this.save();
    },

    getWeaponModelType(name) { 
        if(name.includes('匕首')||name.includes('短刀')||name.includes('小刀')) return 'DAGGER'; 
        if(name.includes('重刃')||name.includes('巨劍')||name.includes('大劍')||name.includes('鐵鎚')||name.includes('大刀')||name.includes('斧')) return 'HEAVY'; 
        if(name.includes('槍')||name.includes('矛')||name.includes('刺刀')) return 'SPEAR'; 
        return 'SWORD'; 
    },
    
    showWeaponModel(weapon) {
        const overlay = document.getElementById('weapon-preview-overlay'); 
        const iconArea = document.getElementById('wp-icon-area');
        
        document.getElementById('wp-name').innerText = weapon.name; 
        const rankEl = document.getElementById('wp-rank-tag'); 
        rankEl.innerText = `${weapon.rank}-RANK`; 
        rankEl.className = `rank-${weapon.rank}`; 
        document.getElementById('wp-desc').innerText = weapon.desc || "這是一把注入魔力的兵器。";
        
        let color = "#00d4ff"; 
        if(weapon.rank==='S') color="#ffd700"; 
        if(weapon.rank==='A') color="#bc13fe"; 
        if(weapon.rank==='C'||weapon.rank==='D'||weapon.rank==='E') color="#aaaaaa"; 
        if(weapon.rank==='UNKNOWN') color="#ff0055";
        
        iconArea.innerHTML = SWORD_MODELS[this.getWeaponModelType(weapon.name)]; 
        const svg = iconArea.querySelector('svg'); 
        svg.style.color = color; 
        svg.classList.add(`rank-${weapon.rank}`); 
        
        overlay.style.display = 'flex';
    },
    
    inspectCurrentWeapon() { 
        if(this.p.curWeapon) this.showWeaponModel(this.p.curWeapon); 
        else alert("目前赤手空拳"); 
    },
    
    checkLevelUp() { 
        let max = this.getMaxExp(this.p.lv); 
        while(this.p.exp >= max) { 
            this.p.exp -= max; this.p.lv++; this.p.sp+=3; this.p.iq++; this.p.str++; this.p.mp++; this.p.dex++; 
            if(this.p.lv <= 50 && this.p.lv % 2 === 0) this.drawTitle(); 
            max = this.getMaxExp(this.p.lv); 
        } 
    },
    
    drawTitle() {
        const r = Math.random()*100; let rank = 'E'; 
        if(this.p.buffs.luck){ 
            if(r<5) rank='S'; else if(r<25) rank='A'; else rank='B'; 
            this.p.buffs.luck=false; 
        } else { 
            if(r<0.5) rank='S'; else if(r<2.0) rank='A'; else if(r<20.0) rank='B'; else if(r<40.0) rank='C'; else if(r<65.0) rank='D'; 
        }
        
        const t = DB.titles[rank][Math.floor(Math.random()*DB.titles[rank].length)];
        if(!this.p.titles.includes(t)){ 
            this.p.titles.push(t); 
            document.getElementById('gacha-msg').innerText="恭喜獲得稱號"; 
        } else { 
            this.p.coins+=500; 
            document.getElementById('gacha-msg').innerText="重複稱號轉化為500蓮幣"; 
        }
        
        document.getElementById('gacha-result').innerText = t; 
        document.getElementById('gacha-result').className = `gacha-glow rank-${rank}`; 
        document.getElementById('gacha-pop').style.display='flex'; 
        this.updateUI();
    },

    async fetchWorldGates() { 
        try { 
            const snap = await getDoc(doc(db,"system","global_gates")); 
            if(snap.exists() && snap.data().active) DB.cloudGates = snap.data().active; 
            else DB.cloudGates = []; 
            if(document.getElementById('p-dungeon').classList.contains('active')) this.renderWorldGates(); 
        } catch(e) {} 
    },
    
    renderWorldGates() {
        const area = document.getElementById('world-gates-list'); 
        let html = ""; 
        if(DB.cloudGates.length === 0){ 
            area.innerHTML = "<div style='text-align:center;color:#555;padding:20px;'>總監尚未發布任務</div>"; 
            return; 
        }
        
        const myActiveIds = this.p.activeQuests.map(q => q.globalId);
        DB.cloudGates.forEach(g => {
            if(myActiveIds.includes(g.id)) return; 
            let bonusTag = ""; 
            if(g.bonus){ 
                if(g.bonus.type==='title') bonusTag=`<span class="badge" style="color:var(--gold); border:1px solid var(--gold);">🎁 ${g.bonus.rank}級稱號</span>`; 
                else if(g.bonus.type==='potion') bonusTag=`<span class="badge" style="color:var(--blue); border:1px solid var(--blue);">🎁 藥水</span>`; 
                else if(g.bonus.type==='mat') bonusTag=`<span class="badge" style="color:var(--purple); border:1px solid var(--purple);">🎁 素材</span>`; 
            }
            html += `<div class="card" style="border-left: 3px solid var(--gold);">
                        <div class="card-col">
                            <strong style="color:var(--gold);">${g.sub}-${g.task}</strong>
                            <span style="font-size:11px;color:#ccc;">${g.range}</span>
                            <div style="margin-top:5px;"><span style="color:var(--purple);">${g.xp}XP</span> <span style="color:#888;font-size:10px;">(${g.time}分)</span> ${bonusTag}</div>
                        </div>
                        <button class="btn-action" style="background:var(--gold);color:#000;" onclick="System.acceptWorldGate(${g.id})">接取</button>
                     </div>`;
        }); 
        area.innerHTML = html || "<div style='text-align:center;color:#555;padding:20px;'>無新任務</div>";
    },
    
    async acceptWorldGate(id) { 
        const g = DB.cloudGates.find(x=>x.id===id); 
        if(!g) return; 
        this.p.activeQuests.push({id:Date.now(), globalId:g.id, sub:g.sub, task:g.task, range:g.range, xp:g.xp, readyAt:Date.now()+(g.time*60000), bonus:g.bonus}); 
        await this.save(); 
        this.renderWorldGates(); 
        this.renderQuests(); 
    },
    
    renderQuests() {
        let html = ""; const now = Date.now();
        this.p.activeQuests.forEach(q => {
            const isReady = !q.readyAt || now >= q.readyAt; 
            let btn = isReady ? `<button class="btn-action" style="background:#00ff88;color:#000;" onclick="System.completeQuest(${q.id})">結算</button>` : `<button class="btn-action cooldown-timer" style="background:#222;border:1px solid #444;" disabled data-until="${q.readyAt}">00:00</button>`;
            html += `<div class="card" style="border-left:4px solid var(--blue);">
                        <div class="card-col">
                            <strong style="color:#fff;">${q.sub}-${q.task}</strong>
                            <span style="color:#888;font-size:11px;">${q.range} | ${q.xp}XP</span>
                        </div>
                        ${btn}
                     </div>`;
        }); 
        document.getElementById('active-quests-list').innerHTML = html || "<div style='text-align:center;color:#555;padding:20px;'>NO ACTIVE QUESTS</div>";
    },
    
    startGlobalTimer() { 
        if(this.timerIdx) clearInterval(this.timerIdx); 
        this.timerIdx = setInterval(() => { 
            let needsRender = false; 
            document.querySelectorAll('.cooldown-timer').forEach(el => { 
                const diff = parseInt(el.dataset.until) - Date.now(); 
                if(diff <= 0) needsRender = true; 
                else { 
                    const m = Math.floor(diff/60000); 
                    const s = Math.floor((diff%60000)/1000); 
                    el.innerText = `${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`; 
                }
            }); 
            if(needsRender) this.renderQuests(); 
        }, 1000); 
    },
    
    async completeQuest(id) {
        const qi = this.p.activeQuests.findIndex(q=>q.id===id); 
        if(qi === -1) return; 
        const q = this.p.activeQuests[qi]; 
        this.p.activeQuests.splice(qi,1);
        
        let fx = q.xp, fc = q.xp; 
        if(this.p.partner) { fx = Math.floor(fx*1.1); fc = Math.floor(fc*1.1); } 
        if(this.p.buffs.doubleXp) { fx *= 2; this.p.buffs.doubleXp = false; alert("雙倍經驗生效！"); }
        if(this.p.curWeapon){ 
            if(this.p.curWeapon.rank==='S'){ fx = Math.floor(fx*1.2); fc = Math.floor(fc*1.5); } 
            else if(this.p.curWeapon.rank==='A'){ fx = Math.floor(fx*1.1); fc = Math.floor(fc*1.2); } 
        }
        
        this.p.exp += fx; 
        this.p.coins += fc; 
        let msg = `獲得 ${fx}XP 與 ${fc}蓮幣`;
        
        const dropRate = Math.random(); 
        if(dropRate < 0.1){ this.p.bag.mats.logic++; msg += "\n🧩 邏輯碎片x1"; } 
        else if(dropRate < 0.2){ this.p.bag.mats.lang++; msg += "\n📖 語文符文x1"; } 
        else if(dropRate < 0.3){ this.p.bag.mats.mem++; msg += "\n🧠 記憶結晶x1"; }
        
        if(q.bonus && q.bonus.type){ 
            if(q.bonus.type === 'title'){
                const titleStr = DB.titles[q.bonus.rank][Math.floor(Math.random()*DB.titles[q.bonus.rank].length)];
                if(!this.p.titles.includes(titleStr)) this.p.titles.push(titleStr);
                msg += `\n✨ 賞賜稱號：[${titleStr}]`;
            } else if(q.bonus.type === 'potion'){
                this.p.bag.potions[q.bonus.id] = (this.p.bag.potions[q.bonus.id]||0) + 1;
                msg += `\n🧪 賞賜藥水：${q.bonus.name}`;
            } else if(q.bonus.type === 'mat'){
                this.p.bag.mats[q.bonus.id] += parseInt(q.bonus.amount);
                msg += `\n📦 賞賜素材：${q.bonus.name}x${q.bonus.amount}`;
            } 
        }
        
        alert(`結算完成！\n${msg}`); 
        this.checkLevelUp(); 
        this.updateUI(); 
        this.renderWorldGates(); 
        this.renderQuests();
    },
    
    renderUpgrades() { 
        document.getElementById('up-sp-display').innerText = this.p.sp; 
        let html = ""; 
        [{id:'iq',n:'IQ'},{id:'str',n:'STR'},{id:'mp',n:'MP'},{id:'dex',n:'DEX'}].forEach(s => { 
            html += `<div class="card" style="border-left:3px solid var(--purple);">
                        <div class="card-col">
                            <strong style="color:var(--blue);">${s.n}</strong>
                            <span style="font-size:2rem;font-weight:900;">${this.p[s.id]}</span>
                        </div>
                        <button class="btn-action" style="font-size:1.6rem;width:45px;height:45px;background:rgba(188,19,254,0.1);border:1px solid var(--purple);" onclick="System.addStat('${s.id}')">+</button>
                     </div>`; 
        }); 
        document.getElementById('upgrade-list').innerHTML = html; 
    },
    addStat(id) { 
        if(this.p.sp > 0){ this.p[id]++; this.p.sp--; this.updateUI(); this.renderUpgrades(); }
        else alert('配點不足'); 
    },
    
    renderTitles() { 
        let html = ""; 
        ['S','A','B','C','D','E'].forEach(r => { 
            html += `<h2 class="section-title rank-${r}">${r}-RANK</h2>`; 
            DB.titles[r].forEach(t => { 
                if(t === "🚫 卑鄙的作弊者") return; 
                const isUnlocked = this.p.titles.includes(t); 
                const isEq = this.p.curTitle === t; 
                if(isUnlocked) html += `<div class="card ${isEq?'equipped':''}" onclick="System.equipTitle('${t}')"><strong><span class="rank-${r}">${t}</span></strong>${isEq?'<span style="color:var(--purple);font-size:10px;">裝備中</span>':''}</div>`; 
                else html += `<div class="card locked-title"><strong class="rank-E">${r==='S'?'???':t}</strong><span style="font-size:10px;">未解鎖</span></div>`; 
            }); 
        }); 
        document.getElementById('titles-list').innerHTML = html; 
    },
    equipTitle(t) { this.p.curTitle = t; this.updateUI(); this.renderTitles(); },
    
    checkShopRefresh() { 
        const today = new Date().toLocaleDateString(); 
        let stored = StorageMgr.get('sl_shop_v33'); 
        if(stored){
            const parsed = JSON.parse(stored);
            if(parsed.date === today){ this.shopCache = parsed.data; document.getElementById('shop-time').innerText = today; return; }
        } 
        this.refreshShop(today, false); 
    },
    getWearRate(r) { 
        const rd = Math.random(); 
        if(r==='S') return (0.5+rd*4.5).toFixed(3); 
        if(r==='A') return (5+rd*10).toFixed(3); 
        if(r==='B') return (20+rd*5).toFixed(3); 
        if(r==='C') return (30+rd*10).toFixed(3); 
        if(r==='D') return (45+rd*10).toFixed(3); 
        return (70+rd*20).toFixed(3); 
    },
    refreshShop(today, force) {
        let shop = { swords:[], titles:[] }; 
        Object.keys(DB.swords).forEach(rank => { 
            DB.swords[rank].forEach(sw => { 
                let name = typeof sw === 'object' ? sw.name : sw; 
                let desc = typeof sw === 'object' ? sw.desc : ''; 
                let wear = rank === 'UNKNOWN' ? '???' : this.getWearRate(rank); 
                let price = 999999; 
                if(rank !== 'UNKNOWN'){
                    let wf = parseFloat(wear); 
                    if(rank==='S') price = Math.floor(10000*(10-wf)); 
                    else if(rank==='A') price = Math.floor(Math.random()*5001)+10000; 
                    else if(rank==='B') price = Math.floor(Math.random()*1001)+4000; 
                    else if(rank==='C') price = Math.floor(Math.random()*1001)+3000; 
                    else if(rank==='D') price = Math.floor(Math.random()*1001)+2000; 
                    else if(rank==='E') price = Math.floor(Math.random()*1001)+1000;
                } 
                shop.swords.push({name, rank, wear, desc, price}); 
            }); 
        }); 
        shop.swords.sort((a,b) => this.rankWeight[b.rank] - this.rankWeight[a.rank]);
        
        for(let i=0; i<12; i++){ 
            const r = Math.random()*100; let rank = 'E'; 
            if(r<1.5) rank='S'; else if(r<5) rank='A'; else if(r<25) rank='B'; else if(r<45) rank='C'; else if(r<65) rank='D'; 
            let name = DB.titles[rank][Math.floor(Math.random()*DB.titles[rank].length)]; 
            let price = rank==='S'?5000 : rank==='A'?2500 : rank==='B'?1000 : rank==='C'?500 : rank==='D'?200 : 100; 
            shop.titles.push({name, rank, price}); 
        } 
        shop.titles.sort((a,b) => this.rankWeight[b.rank] - this.rankWeight[a.rank]);
        
        this.shopCache = shop; 
        StorageMgr.set('sl_shop_v33', JSON.stringify({date: today, data: this.shopCache})); 
        document.getElementById('shop-time').innerText = force ? 'Refreshed' : today;
    },
    renderShop(tab) {
        if(!this.shopCache) this.checkShopRefresh(); 
        if(!this.shopCache) return; 
        
        ['sword','potion','title'].forEach(t => {
            const btn = document.getElementById(`tab-${t}`);
            if(btn){ btn.style.background = t === tab ? 'var(--purple)' : '#222'; btn.style.color = t === tab ? '#fff' : '#888'; }
        });
        
        let html = ""; 
        if(tab === 'sword'){ 
            this.shopCache.swords.forEach((sw, idx) => { 
                let sp = sw.rank==='UNKNOWN' ? 'border:1px solid #ff0055;' : (sw.rank==='S' ? 'border:1px solid var(--gold);' : ''); 
                let bt = sw.rank==='UNKNOWN' ? '非賣品' : `💰 ${sw.price}`; 
                let dis = sw.rank==='UNKNOWN' ? 'disabled' : ''; 
                html += `<div class="card" style="${sp}">
                            <div class="card-col" onclick="System.showWeaponModel(${JSON.stringify(sw).replace(/"/g,'&quot;')})">
                                <strong class="rank-${sw.rank}">${sw.name}</strong>
                                <span style="color:#888;font-size:10px;">磨損度: ${sw.wear}%</span>
                            </div>
                            <button class="btn-action" ${dis} onclick="System.buyShop('sword',${idx})">${bt}</button>
                         </div>`; 
            }); 
        } else if(tab === 'potion'){ 
            DB.potions.forEach(pot => {
                html += `<div class="card">
                            <div class="card-col"><strong>${pot.name}</strong><span style="font-size:10px;color:#aaa;">${pot.desc}</span></div>
                            <button class="btn-action" onclick="System.buyPotion('${pot.id}',${pot.price})">💰 ${pot.price}</button>
                         </div>`;
            }); 
        } else if(tab === 'title'){ 
            this.shopCache.titles.forEach((t, idx) => { 
                const own = this.p.titles.includes(t.name); 
                html += `<div class="card">
                            <div class="card-col"><strong class="rank-${t.rank}">${t.name}</strong></div>
                            <button class="btn-action" ${own?'disabled':''} onclick="System.buyShop('title',${idx})">${own?'已解鎖':'💰 '+t.price}</button>
                         </div>`; 
            }); 
        } 
        document.getElementById('shop-list').innerHTML = html;
    },
    buyShop(t, i) { 
        const item = this.shopCache[`${t}s`][i]; 
        if(!item) return; 
        if(this.p.coins >= item.price){ 
            if(t === 'title'){
                if(this.p.titles.includes(item.name)) return alert("已有此稱號"); 
                this.p.coins -= item.price; 
                this.p.titles.push(item.name); 
                alert("解鎖成功");
            } else {
                this.p.coins -= item.price; 
                item.id = Date.now(); 
                this.p.bag.swords.push(item); 
                alert("購買成功");
            } 
            this.updateUI(); 
            this.renderShop(t); 
        } else alert("餘額不足"); 
    },
    buyPotion(p, pr) { 
        if(this.p.coins >= pr){ this.p.coins -= pr; this.p.bag.potions[p] = (this.p.bag.potions[p]||0)+1; this.updateUI(); alert("購買成功"); }
        else alert("餘額不足"); 
    },
    
    renderBag(tab) {
        ['sword','potion','mat'].forEach(t => {
            const btn = document.getElementById(`bag-tab-${t}`);
            if(btn){ btn.style.background = t === tab ? 'var(--purple)' : '#222'; btn.style.color = t === tab ? '#fff' : '#888'; }
        }); 
        let html = "";
        if(tab === 'sword'){ 
            if(this.p.bag.swords.length === 0) html = "<div style='padding:15px;color:#555;text-align:center;'>空</div>"; 
            this.p.bag.swords.forEach(sw => {
                let isE = (this.p.curWeapon && this.p.curWeapon.id === sw.id); 
                html += `<div class="card ${isE?'equipped':''}">
                            <div class="card-col" onclick="System.showWeaponModel(${JSON.stringify(sw).replace(/"/g,'&quot;')})">
                                <strong class="rank-${sw.rank}">${sw.name}</strong><small>磨損: ${sw.wear}%</small>
                            </div>
                            <button class="btn-action" style="${isE?'background:#333;color:#888;':''}" onclick="System.equipWeapon(${sw.id})">${isE?'卸下':'裝備'}</button>
                         </div>`; 
            }); 
        } else if(tab === 'potion'){ 
            let has = false; 
            DB.potions.forEach(pot => {
                let amt = this.p.bag.potions[pot.id] || 0; 
                if(amt > 0){
                    has = true; 
                    html += `<div class="card">
                                <div><strong>${pot.name} <span style="color:var(--gold)">x${amt}</span></strong></div>
                                <button class="btn-action" onclick="System.usePotion('${pot.id}')">使用</button>
                             </div>`;
                }
            }); 
            if(!has) html = "<div style='padding:15px;color:#555;text-align:center;'>空</div>"; 
        } else { 
            html += `<div class="card"><div class="card-col"><strong style="color:var(--blue)">邏輯碎片</strong></div><span style="font-size:1.5rem;font-weight:900;">${this.p.bag.mats.logic}</span></div>
                     <div class="card"><div class="card-col"><strong style="color:var(--gold)">語文符文</strong></div><span style="font-size:1.5rem;font-weight:900;">${this.p.bag.mats.lang}</span></div>
                     <div class="card"><div class="card-col"><strong style="color:var(--purple)">記憶結晶</strong></div><span style="font-size:1.5rem;font-weight:900;">${this.p.bag.mats.mem}</span></div>`; 
        } 
        document.getElementById('bag-list').innerHTML = html;
    },
    equipWeapon(id) { 
        if(this.p.curWeapon && this.p.curWeapon.id === id) this.p.curWeapon = null; 
        else this.p.curWeapon = this.p.bag.swords.find(s => s.id === id); 
        this.updateUI(); 
        this.renderBag('sword'); 
    },
    usePotion(pid) { 
        if(this.p.bag.potions[pid] <= 0) return; 
        this.p.bag.potions[pid]--; 
        if(pid === 'p_double') { this.p.buffs.doubleXp = true; alert("雙倍經驗生效！"); } 
        else if(pid === 'p_time') { this.refreshShop(new Date().toLocaleDateString(), true); alert("商店已刷新"); } 
        else if(pid === 'p_luck') { this.p.buffs.luck = true; alert("保底生效"); } 
        else if(pid === 'p_seven') this.openSevenCloverModal(); 
        this.updateUI(); 
        this.renderBag('potion'); 
    },
    openSevenCloverModal() { 
        let html = ""; 
        DB.titles['A'].forEach(t => {
            const own = this.p.titles.includes(t); 
            html += `<div class="card"><span class="rank-A">${t}</span><button class="btn-action" ${own?'disabled':''} onclick="System.pickATitle('${t}')">${own?'擁有':'選擇'}</button></div>`;
        }); 
        document.getElementById('seven-clover-list').innerHTML = html; 
        document.getElementById('seven-clover-modal').style.display = 'flex'; 
    },
    pickATitle(t) { 
        this.p.titles.push(t); 
        this.p.curTitle = t; 
        document.getElementById('seven-clover-modal').style.display = 'none'; 
        alert(`獲得 ${t}`); 
        this.updateUI(); 
    },
    
    renderForge() {
        document.getElementById('forge-m-logic').innerText = this.p.bag.mats.logic; 
        document.getElementById('forge-m-lang').innerText = this.p.bag.mats.lang; 
        document.getElementById('forge-m-mem').innerText = this.p.bag.mats.mem; 
        let html = ""; 
        if(this.p.bag.swords.length === 0) html = "<div style='padding:20px;text-align:center;color:#555;'>空</div>";
        this.p.bag.swords.forEach(sw => { 
            let req = sw.rank === 'S' ? 7 : (sw.rank === 'A' ? 3 : 1); 
            let can = (this.p.bag.mats.logic >= req && this.p.bag.mats.lang >= req && this.p.bag.mats.mem >= req); 
            html += `<div class="card" style="flex-direction:column;align-items:flex-start;">
                        <div style="width:100%;display:flex;justify-content:space-between;margin-bottom:5px;">
                            <strong class="rank-${sw.rank}">${sw.name}</strong><span style="color:#aaa;font-size:12px;">磨損: ${sw.wear}%</span>
                        </div>
                        <div style="width:100%;display:flex;justify-content:space-between;align-items:center;">
                            <span style="font-size:10px;color:#888;">消耗各碎片 x${req}</span>
                            <button class="btn-action" style="${can?'background:#ff8c00;':'background:#333;color:#666;'}" ${can?'':'disabled'} onclick="System.forgeWeapon(${sw.id},'${sw.rank}',${req})">修復</button>
                        </div>
                     </div>`; 
        }); 
        document.getElementById('forge-list').innerHTML = html;
    },
    forgeWeapon(id, r, req) { 
        if(this.p.bag.mats.logic<req || this.p.bag.mats.lang<req || this.p.bag.mats.mem<req) return; 
        this.p.bag.mats.logic -= req; this.p.bag.mats.lang -= req; this.p.bag.mats.mem -= req; 
        let sw = this.p.bag.swords.find(w => w.id === id); 
        let red = r === 'S' ? (1 + Math.random()*0.5) : (1 + Math.random()*2); 
        let nw = parseFloat(sw.wear) - red; 
        if(nw < 0) nw = 0; 
        sw.wear = nw.toFixed(3); 
        if(this.p.curWeapon && this.p.curWeapon.id === id) this.p.curWeapon.wear = sw.wear; 
        alert(`鍛造成功！降低 ${red.toFixed(3)}%`); 
        this.save(); 
        this.renderForge(); 
    },
    
    async renderLeaderboard() { 
        const el = document.getElementById('leaderboard-list'); 
        el.innerHTML = "<div style='text-align:center;padding:30px;'>連線中...</div>"; 
        try { 
            const snap = await getDocs(collection(db,"players")); 
            let pD = []; 
            snap.forEach(d => pD.push(d.data())); 
            pD.sort((a,b) => { if(b.lv !== a.lv) return b.lv - a.lv; return b.exp - a.exp; }); 
            let html = ""; 
            pD.forEach((d,i) => { 
                let w = d.curWeapon ? `<span class="rank-${d.curWeapon.rank}">${d.curWeapon.name}</span>` : "徒手"; 
                html += `<div class="card">
                            <div class="rank-badge ${i===0?'top-1':(i===1?'top-2':(i===2?'top-3':''))}">${i+1}</div>
                            <div class="card-col">
                                <div style="display:flex;justify-content:space-between;"><strong>${d.acc}</strong><span style="color:var(--purple);font-weight:900;">Lv.${d.lv}</span></div>
                                <div style="font-size:11px;color:var(--gold);">[ ${d.curTitle} ]</div>
                                <div style="font-size:11px;color:#888;">⚔️ ${w}</div>
                            </div>
                         </div>`; 
            }); 
            el.innerHTML = html; 
        } catch(e) { el.innerHTML="<div style='color:red;'>連線失敗</div>"; } 
    },
    
    async renderPartner() {
        const el = document.getElementById('partner-status-area'); 
        el.innerHTML = "<div style='text-align:center;padding:30px;'>連線中...</div>"; 
        try { 
            const ms = await getDoc(doc(db,"players",this.p.acc)); 
            if(ms.exists()) this.p = ms.data(); 
            let html = "";
            if(this.p.partner){ 
                const ps = await getDoc(doc(db,"players",this.p.partner)); 
                if(ps.exists()){ 
                    let pd = ps.data(); 
                    let w = pd.curWeapon ? `<span class="rank-${pd.curWeapon.rank}">${pd.curWeapon.name}</span>` : "徒手"; 
                    html += `<div style="text-align:center;color:var(--comrade-green);font-weight:900;margin-bottom:15px;">🔗 PACT ESTABLISHED</div>
                             <div class="card" style="flex-direction:column;padding:20px;border-color:var(--comrade-green);">
                                <h3 style="color:var(--comrade-green);margin:0 0 10px 0;font-size:1.8rem;">${pd.acc}</h3>
                                <div style="width:100%;display:flex;justify-content:space-between;font-weight:900;"><span>Level:</span><span style="color:var(--purple);">${pd.lv}</span></div>
                                <div style="width:100%;display:flex;justify-content:space-between;"><span>Title:</span><span style="color:var(--gold);font-size:12px;">[ ${pd.curTitle} ]</span></div>
                                <div style="width:100%;display:flex;justify-content:space-between;margin-bottom:15px;"><span style="color:#aaa;font-size:12px;">Weapon:</span><span style="font-size:12px;">${w}</span></div>
                                <button class="btn-action" style="width:100%;background:var(--red-alert);" onclick="System.breakPact()">解除契約</button>
                             </div>`; 
                } else { html += `<button class="btn-action" onclick="System.breakPact()">強制解除異常</button>`; } 
            } else { 
                html += `<div style="background:rgba(0,255,170,0.05);border:1px solid rgba(0,255,170,0.3);padding:15px;border-radius:10px;">
                            <input type="text" id="inp-partner-req" style="width:100%;padding:10px;background:#000;border:1px solid #555;color:#fff;margin-bottom:10px;" placeholder="輸入同學 ID...">
                            <button class="btn-action" style="width:100%;background:var(--comrade-green);color:#000;" onclick="System.sendPactReq()">發送邀請</button>
                         </div><h3 class="section-title">收到邀請</h3>`; 
                if(this.p.requests && this.p.requests.length > 0){ 
                    this.p.requests.forEach(r => { 
                        html += `<div class="card" style="border-left:3px solid var(--comrade-green);">
                                    <strong>${r}</strong>
                                    <div><button class="btn-action" style="background:var(--comrade-green);color:#000;margin-right:5px;" onclick="System.acceptPact('${r}')">同意</button>
                                    <button class="btn-action" style="background:#444;" onclick="System.rejectPact('${r}')">拒絕</button></div>
                                 </div>`; 
                    }); 
                } else html += "<div style='padding:15px;text-align:center;'>無</div>"; 
            } 
            el.innerHTML = html; 
        } catch(e) { el.innerHTML="<div style='color:red;'>連線失敗</div>"; }
    },
    async sendPactReq() { 
        const tgt = document.getElementById('inp-partner-req').value.trim(); 
        if(!tgt || tgt === this.p.acc) return alert("無效ID"); 
        try { 
            const ref = doc(db,"players",tgt); 
            const snap = await getDoc(ref); 
            if(!snap.exists()) return alert("無此人"); 
            let td = snap.data(); 
            if(td.partner) return alert("對方已有戰友"); 
            if(!td.requests) td.requests=[]; 
            if(td.requests.includes(this.p.acc)) return alert("已邀請"); 
            td.requests.push(this.p.acc); 
            await setDoc(ref,td); 
            alert("發送成功！"); 
            document.getElementById('inp-partner-req').value=""; 
        } catch(e) {} 
    },
    async acceptPact(tgt) { 
        try { 
            const ref = doc(db,"players",tgt); 
            const snap = await getDoc(ref); 
            if(snap.exists()){ 
                let td = snap.data(); 
                if(td.partner){ alert("對方已結盟"); this.rejectPact(tgt); return; } 
                td.partner = this.p.acc; 
                await setDoc(ref,td); 
            } 
            this.p.partner = tgt; 
            this.p.requests = this.p.requests.filter(r => r !== tgt); 
            await this.save(); 
            alert("契約成立"); 
            this.updateUI(); 
            this.renderPartner(); 
        } catch(e) {} 
    },
    async rejectPact(tgt) { this.p.requests = this.p.requests.filter(r => r !== tgt); await this.save(); this.renderPartner(); },
    async breakPact() { 
        if(!confirm("確定解除?")) return; 
        try { 
            if(this.p.partner){ 
                const ref = doc(db,"players",this.p.partner); 
                const snap = await getDoc(ref); 
                if(snap.exists()){ let td = snap.data(); td.partner=null; await setDoc(ref,td); } 
            } 
            this.p.partner = null; 
            await this.save(); 
            alert("解除成功"); 
            this.updateUI(); 
            this.renderPartner(); 
        } catch(e) {} 
    },

    // 👑 上帝終端機
    verifyAdmin() { 
        if(document.getElementById('inp-admin-pwd').value === 'Ricky_0414'){
            this.isAdminUnlocked = true; 
            document.getElementById('admin-login').style.display = 'none'; 
            document.getElementById('admin-panel').style.display = 'flex'; 
            this.renderAdminPanel();
        } else alert("密碼錯誤"); 
    },
    renderAdminPanel() {
        ['lv','coins','sp','iq','str','mp','dex'].forEach(k => document.getElementById(`adm-${k}`).value = Math.floor(this.p[k]));
        let swH = "<option value=''>--武器--</option>"; 
        Object.keys(DB.swords).forEach(r => {
            swH += `<optgroup label="${r}">`;
            DB.swords[r].forEach(s => { let n = typeof s === 'object' ? s.name : s; swH += `<option value="${r}|${n}">${n}</option>`; });
            swH += `</optgroup>`;
        }); 
        document.getElementById('adm-sel-sword').innerHTML = swH;

        let tH = "<option value=''>--稱號--</option>"; 
        Object.keys(DB.titles).forEach(r => {
            tH += `<optgroup label="${r}">`;
            DB.titles[r].forEach(t => { tH += `<option value="${t}">${t}</option>`; });
            tH += `</optgroup>`;
        }); 
        document.getElementById('adm-sel-title').innerHTML = tH;
    },
    async adminSetStats() {
        let tgt = document.getElementById('adm-target').value.trim(); 
        let d = {}; 
        ['lv','coins','sp','iq','str','mp','dex'].forEach(k => d[k] = parseInt(document.getElementById(`adm-${k}`).value)||1); 
        d.exp = this.getMaxExp(d.lv-1); 
        if(d.lv === 1) d.exp = 0;
        
        if(!tgt || tgt === this.p.acc){ 
            Object.assign(this.p,d); 
            this.updateUI(); 
            alert("已竄改自己數值"); 
        } else { 
            try {
                const r = doc(db,"players",tgt); const s = await getDoc(r); 
                if(s.exists()){ let td = s.data(); Object.assign(td,d); await setDoc(r,td); alert("竄改成功"); } 
                else alert("找不到"); 
            } catch(e) {} 
        }
    },
    async adminGiveSword() {
        const val = document.getElementById('adm-sel-sword').value; 
        if(!val) return; 
        const p = val.split('|'); 
        const tgtD = DB.swords[p[0]].find(s => (typeof s === 'object' ? s.name : s) === p[1]); 
        let itm = {id:Date.now(), name:p[1], rank:p[0], wear:p[0]==='UNKNOWN'?'???':'0.000', desc:typeof tgtD==='object'?tgtD.desc:'', price:0};
        
        let tgt = document.getElementById('adm-target').value.trim(); 
        if(!tgt || tgt === this.p.acc){ this.p.bag.swords.push(itm); this.save(); alert("已塞入自己背包"); } 
        else { 
            try {
                const r = doc(db,"players",tgt); const s = await getDoc(r);
                if(s.exists()){ let td = s.data(); td.bag.swords.push(itm); await setDoc(r,td); alert("已塞入同學背包"); }
            } catch(e) {} 
        }
    },
    async adminGiveTitle() {
        const val = document.getElementById('adm-sel-title').value; 
        if(!val) return; 
        let tgt = document.getElementById('adm-target').value.trim();
        if(!tgt || tgt === this.p.acc){
            if(!this.p.titles.includes(val)){ this.p.titles.push(val); this.save(); alert("解鎖成功"); }
        } else { 
            try {
                const r = doc(db,"players",tgt); const s = await getDoc(r);
                if(s.exists()){ let td = s.data(); if(!td.titles.includes(val)){ td.titles.push(val); await setDoc(r,td); alert("已解鎖給同學"); } }
            } catch(e) {} 
        }
    },
    async adminGiveMats() { 
        let tgt = document.getElementById('adm-target').value.trim(); 
        if(!tgt || tgt === this.p.acc){ this.p.bag.mats.logic+=100; this.p.bag.mats.lang+=100; this.p.bag.mats.mem+=100; this.save(); alert("發放成功"); }
        else {
            try{ const r=doc(db,"players",tgt); const s=await getDoc(r); if(s.exists()){ let td=s.data(); td.bag.mats.logic+=100; td.bag.mats.lang+=100; td.bag.mats.mem+=100; await setDoc(r,td); alert("發放成功"); } }catch(e){}
        } 
    },
    async adminGivePotions() { 
        let tgt = document.getElementById('adm-target').value.trim(); 
        if(!tgt || tgt === this.p.acc){ ['p_double','p_time','p_luck','p_seven'].forEach(p => this.p.bag.potions[p]=(this.p.bag.potions[p]||0)+10); this.save(); alert("發放成功"); }
        else {
            try{ const r=doc(db,"players",tgt); const s=await getDoc(r); if(s.exists()){ let td=s.data(); ['p_double','p_time','p_luck','p_seven'].forEach(p=>td.bag.potions[p]=(td.bag.potions[p]||0)+10); await setDoc(r,td); alert("發放成功"); } }catch(e){}
        } 
    },
    async adminPunish() {
        const tgt = document.getElementById('adm-target').value.trim(); 
        if(!tgt) return; 
        try {
            const r = doc(db,"players",tgt); const s = await getDoc(r);
            if(s.exists()){
                let d = s.data();
                if(d.partner){ const pr = doc(db,"players",d.partner); const ps = await getDoc(pr); if(ps.exists()){ let pd = ps.data(); pd.partner=null; await setDoc(pr,pd); } }
                d.lv=1; d.exp=0; d.coins=0; d.sp=0; d.iq=1; d.str=1; d.mp=1; d.dex=1;
                d.curTitle="🚫 卑鄙的作弊者"; d.titles=["🚫 卑鄙的作弊者"]; 
                d.bag={swords:[],potions:{},mats:{logic:0,lang:0,mem:0}};
                d.curWeapon=null; d.activeQuests=[]; d.partner=null; d.requests=[];
                await setDoc(r,d); alert("天罰執行完畢");
            } else alert("無此人");
        } catch(e) {}
    },

    // 🟢 上線狀態系統 (心跳)
    startHeartbeat() { 
        const beat = () => { updateDoc(doc(db,"players",this.p.acc), {lastSeen: Date.now()}); }; 
        beat(); 
        setInterval(beat, 30000); 
    },
    
    async renderWorld() {
        const area = document.getElementById('online-list'); 
        area.innerHTML = "掃描中..."; 
        if(this.unsubWorld) this.unsubWorld();
        
        this.unsubWorld = onSnapshot(collection(db,"players"), (snap) => { 
            let html = ""; 
            snap.forEach(d => { 
                const data = d.data(); 
                if(data.acc === this.p.acc || data.acc === 'admin') return; 
                const isOn = data.lastSeen && (Date.now() - data.lastSeen < 65000); 
                html += `<div class="card">
                            <div><span class="status-dot ${isOn?'dot-online':'dot-offline'}"></span><strong>${data.acc}</strong> <small style="color:#666">Lv.${data.lv}</small></div>
                            ${isOn ? `<button class="btn-action" style="background:var(--comrade-green);color:#000;" onclick="TradeSystem.startTrade('${data.acc}')">交易</button>` : `<small style="color:#444">離線</small>`}
                         </div>`; 
            }); 
            area.innerHTML = html; 
        });
    },

    // 📲 監聽交易請求
    listenForInvites() {
        onSnapshot(query(collection(db,"trades"), where("target","==",this.p.acc), where("status","==","pending")), (snap) => { 
            snap.forEach(c => { 
                const d = c.data(); 
                if(confirm(`📦 收到 [${d.sender}] 交易請求！進入交易室？`)){ 
                    TradeSystem.joinTrade(c.id, d); 
                } else { 
                    updateDoc(doc(db,"trades",c.id), {status:"rejected"}); 
                } 
            }); 
        });
    }
};

// 🤝 獵人交易所 (即時)
const TradeSystem = {
    currentTradeId: null, unsubTrade: null,
    
    async startTrade(tgt) { 
        const id = `trade_${Date.now()}`; 
        const d = {
            id, sender: System.p.acc, target: tgt, status: "pending",
            offerA: {coins:0, items:[]}, offerB: {coins:0, items:[]},
            readyA: false, readyB: false, chat: []
        }; 
        await setDoc(doc(db,"trades",id), d); 
        this.joinTrade(id, d); 
    },
    
    joinTrade(id, data) {
        this.currentTradeId = id; 
        document.getElementById('trade-overlay').style.display = 'flex'; 
        document.getElementById('peer-name-label').innerText = (data.sender === System.p.acc ? data.target : data.sender); 
        this.buildItemSelect();
        
        if(this.unsubTrade) this.unsubTrade();
        this.unsubTrade = onSnapshot(doc(db,"trades",id), (snap) => {
            if(!snap.exists()) return this.cancelTrade(); 
            const d = snap.data();
            if(d.status === "rejected"){ alert("交易中斷"); this.cancelTrade(); } 
            if(d.status === "completed"){ alert("✅ 交易成功！"); System.login(); this.cancelTrade(); } 
            this.renderTradeUI(d);
        });
    },
    
    buildItemSelect() {
        let sel = document.getElementById('trade-item-select'); 
        let h = "<option value=''>--選背包物品(每次1個)--</option>";
        System.p.bag.swords.forEach(s => { h += `<option value="s|${s.id}">${s.name} [${s.wear}%]</option>`; });
        ['logic','lang','mem'].forEach(m => { 
            if(System.p.bag.mats[m] > 0) h += `<option value="m|${m}">${m==='logic'?'邏輯碎片':m==='lang'?'語文符文':'記憶結晶'} (有${System.p.bag.mats[m]}個)</option>`; 
        });
        sel.innerHTML = h;
    },
    
    async addItemToOffer() {
        const val = document.getElementById('trade-item-select').value; 
        if(!val) return; 
        
        const d = (await getDoc(doc(db,"trades",this.currentTradeId))).data(); 
        const isA = (System.p.acc === d.sender); 
        const myO = isA ? d.offerA : d.offerB;
        
        const p = val.split('|'); 
        if(p[0] === 's'){ 
            let itm = System.p.bag.swords.find(x => x.id === parseInt(p[1])); 
            if(itm && !myO.items.find(x => x.id === itm.id)) myO.items.push(itm); 
        }
        else if(p[0] === 'm'){ 
            const n = p[1]==='logic' ? '邏輯碎片' : p[1]==='lang' ? '語文符文' : '記憶結晶'; 
            let ex = myO.items.find(x => x.id === p[1]); 
            if(ex){ if(ex.amt < System.p.bag.mats[p[1]]) ex.amt++; } 
            else myO.items.push({id:p[1], type:'mat', name:n, amt:1}); 
        }
        
        updateDoc(doc(db,"trades",this.currentTradeId), isA ? {"offerA.items":myO.items, readyA:false, readyB:false} : {"offerB.items":myO.items, readyA:false, readyB:false}); 
        document.getElementById('trade-item-select').value = "";
    },
    
    renderTradeUI(d) {
        const isA = (d.sender === System.p.acc); 
        const myO = isA ? d.offerA : d.offerB; 
        const peO = isA ? d.offerB : d.offerA; 
        const myR = isA ? d.readyA : d.readyB; 
        const peR = isA ? d.readyB : d.readyA;
        
        document.getElementById('my-offer-list').innerHTML = `💰 ${myO.coins}<br>` + myO.items.map(i => `[${i.name}${i.amt?' x'+i.amt:''}]`).join('<br>');
        document.getElementById('peer-offer-list').innerHTML = `💰 ${peO.coins}<br>` + peO.items.map(i => `[${i.name}${i.amt?' x'+i.amt:''}]`).join('<br>');
        
        document.getElementById('peer-ready-status').innerText = peR ? "🟢 對方已確認" : "⚪ 等待中"; 
        document.getElementById('peer-trade-box').style.borderColor = peR ? "var(--comrade-green)" : "#333";
        
        const btn = document.getElementById('btn-confirm-trade'); 
        btn.innerText = myR ? "等待對方..." : "確認提議"; 
        btn.style.background = myR ? "#004422" : "#222";
        
        const cb = document.getElementById('trade-chat'); 
        cb.innerHTML = d.chat.map(m => `<div class="chat-msg"><span class="chat-name">${m.user}:</span>${m.msg}</div>`).join(''); 
        cb.scrollTop = cb.scrollHeight;
        
        if(d.readyA && d.readyB && d.status === "pending") this.executeFinal(d);
    },
    
    async updateOffer() { 
        const c = parseInt(document.getElementById('trade-coin-input').value) || 0; 
        if(c > System.p.coins) return alert("蓮幣不足"); 
        const d = (await getDoc(doc(db,"trades",this.currentTradeId))).data(); 
        const isA = (System.p.acc === d.sender); 
        updateDoc(doc(db,"trades",this.currentTradeId), isA ? {"offerA.coins":c, readyA:false, readyB:false} : {"offerB.coins":c, readyA:false, readyB:false}); 
    },
    
    async confirmReady() { 
        const d = (await getDoc(doc(db,"trades",this.currentTradeId))).data(); 
        const isA = (System.p.acc === d.sender); 
        updateDoc(doc(db,"trades",this.currentTradeId), isA ? {readyA:true} : {readyB:true}); 
    },
    
    async sendChat() { 
        const i = document.getElementById('trade-msg-input'); 
        const m = i.value.trim(); 
        if(!m) return; 
        updateDoc(doc(db,"trades",this.currentTradeId), {chat: arrayUnion({user:System.p.acc, msg:m})}); 
        i.value = ""; 
    },
    
    async cancelTrade() { 
        if(this.currentTradeId) updateDoc(doc(db,"trades",this.currentTradeId), {status:"rejected"}); 
        if(this.unsubTrade) this.unsubTrade(); 
        this.currentTradeId = null; 
        document.getElementById('trade-overlay').style.display = 'none'; 
    },
    
    async executeFinal(d) {
        try {
            await runTransaction(db, async (t) => {
                const rA = doc(db,"players",d.sender); 
                const rB = doc(db,"players",d.target); 
                const rT = doc(db,"trades",d.id);
                
                const uA = (await t.get(rA)).data(); 
                const uB = (await t.get(rB)).data();
                
                if(uA.coins < d.offerA.coins || uB.coins < d.offerB.coins) throw "金額不足";
                
                uA.coins = uA.coins - d.offerA.coins + d.offerB.coins; 
                uB.coins = uB.coins - d.offerB.coins + d.offerA.coins;
                
                d.offerA.items.forEach(i => { 
                    if(i.type === 'mat'){ uA.bag.mats[i.id] -= i.amt; uB.bag.mats[i.id] += i.amt; } 
                    else { uA.bag.swords = uA.bag.swords.filter(s => s.id !== i.id); uB.bag.swords.push(i); if(uA.curWeapon && uA.curWeapon.id === i.id) uA.curWeapon = null; } 
                });
                
                d.offerB.items.forEach(i => { 
                    if(i.type === 'mat'){ uB.bag.mats[i.id] -= i.amt; uA.bag.mats[i.id] += i.amt; } 
                    else { uB.bag.swords = uB.bag.swords.filter(s => s.id !== i.id); uA.bag.swords.push(i); if(uB.curWeapon && uB.curWeapon.id === i.id) uB.curWeapon = null; } 
                });
                
                t.update(rA, uA); 
                t.update(rB, uB); 
                t.update(rT, {status:"completed"});
            });
        } catch(e) { 
            alert("交易失敗: " + e); 
            this.cancelTrade(); 
        }
    }
};

// 暴露到全域供 HTML 呼叫
window.System = System; 
window.TradeSystem = TradeSystem;