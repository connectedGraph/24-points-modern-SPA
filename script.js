/**
 * 24 Point Game Logic
 * Features:
 * - Fraction math engine
 * - Drag & Drop with collision highlight (Point 1)
 * - Fixed slot positioning (Point 2)
 * - Home confirm logic (Point 3)
 * - Markdown export (Point 4)
 * - Themes (Point 5 support)
 * - Input validation (Point 6)
 */

// --- Themes Configuration ---
const THEMES = [
    { name: 'Glass (Default)', id: 'glass', vars: {} }, // 默认不覆盖
    { name: '🪵 Paper', id: 'paper', vars: { '--bg-body': '#E5DEC9', '--bg-container': '#F8F4E6', '--border-container': '#d4cbb8', '--text-main': '#2b2b2b' } },
    { name: '🎋 Bamboo', id: 'bamboo', vars: { '--bg-body': '#C3D0B9', '--bg-container': '#E2EFE1', '--border-container': '#B7C9B9', '--text-main': '#2C3E2E' } },
    { name: '📜 Leather', id: 'leather', vars: { '--bg-body': '#D4B895', '--bg-container': '#E8D5B7', '--border-container': '#C2A882', '--text-main': '#4A3625' } },
    { name: '🩸 Dark', id: 'dark', vars: { '--bg-body': '#121212', '--bg-container': '#2A2A2A', '--border-container': '#333333', '--text-main': '#A3A3A3' } },
    {name:'⚪ Plain White', id:'simple-white',vars:{'--bg-body':'#F5F5F5','--bg-container':'#FFFFFF','--border-container':'#E0E0E0','--text-main':'#333333'}}
];
const I18N = {
    en: {
        start_game: "Start Game",
        calculator: "Calculator",
        settings: "Settings",
        op_add: "Add",
        op_sub: "Sub",
        op_mul: "Mul",
        op_div: "Div",
        no_solution: "No Solution",
        next_level: "Next Level",
        view_history: "End & View History",
        language: "Language",
        card_style: "Card Style",
        style_modern: "Modern",
        style_magic: "Magic",
        style_colorful: "Colorful",
        solve: "Solve",
        game_history: "Game History",
        success: "Success!",
        fail: "Failed!",
        stamina_out: "Stamina Depleted!",
        timeout: "Time's Up!",
        setting_no_sol: "Allow No Solution",
        hint_paid: "Stamina -1(Hint)",
        error_paid: "Stamina -1(Error)",
        already_paid: "No extra penalty",
        export_all: "📥 Export All",
        export_wrong: "📥 Export Wrong",
        print_all: "🖨️ Print All",
        print_wrong: "🖨️ Print Wrong",
        claim_no_solution: "Declare No Solution",
        introduction:   "A fast-paced math game suits for K-5 students",
        game_rule: "Players drag number cards and press different WASD keys during dragging to determine the operation method. Make the cards collide and merge, and finally synthesize a '24-point block' to win.",
        title: "24 Point Game"
    },
    zh: {
        start_game: "开始游戏",
        calculator: "计算器",
        settings: "设置",
        op_add: "加",
        op_sub: "减",
        op_mul: "乘",
        op_div: "除",
        no_solution: "无解",
        next_level: "下一关",
        view_history: "结束并查看",
        language: "语言",
        card_style: "卡片样式",
        style_modern: "现代",
        style_magic: "魔法",
        style_colorful: "多彩",
        solve: "求解",
        game_history: "游戏记录",
        success: "挑战成功！",
        fail: "挑战失败！",
        stamina_out: "体力耗尽！",
        timeout: "时间到！",
        setting_no_sol: "允许无解题目",
        hint_paid: "体力 -1(使用提示)",
        error_paid: "体力 -1(回答错误)",
        already_paid: "本关已扣除体力",
        export_all: "📥 全部导出",
        export_wrong: "📥 错题导出",
        print_all: "🖨️ 全部打印",
        print_wrong: "🖨️ 错题打印",
        claim_no_solution: "声明无解",
        introduction:"一款适合小学1-2年级学生的快节奏数学游戏",
        game_rule:"玩家通过拖动数字卡片、在拖拽过程中按下不同的WASD键来决定加减乘除的运算方式，让卡片碰撞合并，最终合成一个“24点块”即为胜利。",
        title: "24点"
    
    },
    // 西班牙语 (es)
es: {
    start_game: "Comenzar Juego",
    calculator: "Calculadora",
    settings: "Ajustes",
    op_add: "Sumar",
    op_sub: "Restar",
    op_mul: "Multiplicar",
    op_div: "Dividir",
    no_solution: "Sin Solución",
    next_level: "Siguiente Nivel",
    view_history: "Finalizar & Ver Historial",
    language: "Idioma",
    card_style: "Estilo de Tarjeta",
    style_modern: "Moderno",
    style_magic: "Mágico",
    style_colorful: "Colorido",
    solve: "Resolver",
    game_history: "Historial de Juego",
    success: "¡Éxito!",
    fail: "¡Fracaso!",
    stamina_out: "¡Energía Agotada!",
    timeout: "¡Se Acabó el Tiempo!",
    setting_no_sol: "Permitir Sin Solución",
    hint_paid: "Energía -1 (Pista)",
    error_paid: "Energía -1 (Error)",
    already_paid: "Sin sanción extra",
    export_all: "📥 Exportar Todo",
    export_wrong: "📥 Exportar Errores",
    print_all: "🖨️ Imprimir Todo",
    print_wrong: "🖨️ Imprimir Errores",
    claim_no_solution: "Declarar Sin Solución",
    introduction: "Un juego de matemáticas de ritmo rápido adecuado para estudiantes de 1° a 5° grado",
    game_rule: "Los jugadores arrastran las tarjetas numéricas y presionan diferentes teclas WASD durante el arrastre para determinar el método de operación. Haz que las tarjetas colisionen y se fusionen, y finalmente sintetiza un 'bloque de 24 puntos' para ganar.",
    title: "Juego de los 24 Puntos"
},

// 德语 (de)
de: {
    start_game: "Spiel Starten",
    calculator: "Taschenrechner",
    settings: "Einstellungen",
    op_add: "Addieren",
    op_sub: "Subtrahieren",
    op_mul: "Multiplizieren",
    op_div: "Dividieren",
    no_solution: "Keine Lösung",
    next_level: "Nächstes Level",
    view_history: "Beenden & Verlauf Anzeigen",
    language: "Sprache",
    card_style: "Kartenstil",
    style_modern: "Modern",
    style_magic: "Magisch",
    style_colorful: "Bunt",
    solve: "Lösen",
    game_history: "Spielverlauf",
    success: "Erfolg!",
    fail: "Fehlgeschlagen!",
    stamina_out: "Ausdauer aufgebraucht!",
    timeout: "Zeit abgelaufen!",
    setting_no_sol: "Keine Lösung zulassen",
    hint_paid: "Ausdauer -1 (Hinweis)",
    error_paid: "Ausdauer -1 (Fehler)",
    already_paid: "Keine zusätzliche Strafe",
    export_all: "📥 Alles Exportieren",
    export_wrong: "📥 Fehler Exportieren",
    print_all: "🖨️ Alles Drucken",
    print_wrong: "🖨️ Fehler Drucken",
    claim_no_solution: "Keine Lösung melden",
    introduction: "Ein temporeiches Mathespiel für Schüler der Klassen 1 bis 5",
    game_rule: "Spieler ziehen Zahlkarten und drücken während des Ziehens verschiedene WASD-Tasten, um die Rechenmethode zu bestimmen. Lassen Sie die Karten kollidieren und fusionieren, und synthetisieren Sie schließlich einen '24-Punkte-Block', um zu gewinnen.",
    title: "24-Punkte-Spiel"
},

// 法语 (fr)
fr: {
    start_game: "Démarrer le Jeu",
    calculator: "Calculatrice",
    settings: "Paramètres",
    op_add: "Ajouter",
    op_sub: "Soustraire",
    op_mul: "Multiplier",
    op_div: "Diviser",
    no_solution: "Pas de Solution",
    next_level: "Niveau Suivant",
    view_history: "Terminer & Voir l'Historique",
    language: "Langue",
    card_style: "Style de Carte",
    style_modern: "Moderne",
    style_magic: "Magique",
    style_colorful: "Coloré",
    solve: "Résoudre",
    game_history: "Historique du Jeu",
    success: "Succès !",
    fail: "Échec !",
    stamina_out: "Endurance Épuisée !",
    timeout: "Temps Écoulé !",
    setting_no_sol: "Autoriser Pas de Solution",
    hint_paid: "Endurance -1 (Indice)",
    error_paid: "Endurance -1 (Erreur)",
    already_paid: "Aucune pénalité supplémentaire",
    export_all: "📥 Exporter Tout",
    export_wrong: "📥 Exporter les Erreurs",
    print_all: "🖨️ Imprimer Tout",
    print_wrong: "🖨️ Imprimer les Erreurs",
    claim_no_solution: "Déclarer Pas de Solution",
    introduction: "Un jeu de mathématiques rapide adapté aux élèves de CP à CM2 (1ère à 5ème année)",
    game_rule: "Les joueurs déplacent les cartes numériques et appuient sur différentes touches WASD pendant le déplacement pour déterminer la méthode d'opération. Faites entrer les cartes en collision et fusionner, puis synthétisez enfin un 'bloc de 24 points' pour gagner.",
    title: "Jeu des 24 Points"
},

};
function showToast(message, type = 'info', duration = 3000) {
    // 1. 获取或创建容器 (使用 ID 确保唯一性)
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }

    // 2. 创建 Toast 元素
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.setAttribute('role', 'alert'); // 无障碍支持
    
    // 补充一个 warning 类型的图标
    const iconMap = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ'
    };
    const icon = iconMap[type] || iconMap.info;
    
    // 3. 构建内部 HTML (消息内容单独用 textContent 赋值以防 XSS)
    toast.innerHTML = `
        <span class="toast-icon">${icon}</span>
        <span class="toast-message"></span>
    `;
    toast.querySelector('.toast-message').textContent = message;

    // 4. 插入到页面
    container.appendChild(toast);
    
    // 5. 触发浏览器重排 (Reflow) 以确保 CSS 动画生效
    toast.offsetHeight; 
    toast.classList.add('show');

    // 6. 定时移除
    setTimeout(() => {
        toast.classList.remove('show');
        
        // 监听 CSS 过渡动画结束，然后再真正移除 DOM 节点
        toast.addEventListener('transitionend', () => {
            toast.remove();
            // 如果容器内没有其他 toast 了，顺手把容器也清理掉
            if (container.childNodes.length === 0) {
                container.remove();
            }
        }, { once: true }); 
    }, duration);
}
function showConfirm(message, title = '提示', type = 'info') {
    return new Promise((resolve) => {
        // 1. 创建遮罩层
        const overlay = document.createElement('div');
        overlay.className = 'confirm-overlay';

        // 2. 创建对话框主体
        const dialog = document.createElement('div');
        // 根据类型（如果是 danger，可以用来后续扩展特殊样式）
        dialog.className = `confirm-dialog confirm-${type}`;

        // 3. 安全地插入文本 (防止 XSS)
        const titleEl = document.createElement('h3');
        titleEl.className = 'confirm-title';
        titleEl.textContent = title;

        const messageEl = document.createElement('p');
        messageEl.className = 'confirm-message';
        messageEl.textContent = message;

        // 4. 创建按钮容器
        const btnContainer = document.createElement('div');
        btnContainer.className = 'confirm-buttons';

        // 取消按钮 (使用默认 .btn 样式)
        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'btn';
        cancelBtn.textContent = '取消';

        // 确定按钮 (支持警告操作变红)
        const confirmBtn = document.createElement('button');
        confirmBtn.className = `btn ${type === 'danger' ? 'btn-danger' : 'btn-primary'}`;
        confirmBtn.textContent = '确定';

        // 5. 组装 DOM
        btnContainer.appendChild(cancelBtn);
        btnContainer.appendChild(confirmBtn);
        
        dialog.appendChild(titleEl);
        dialog.appendChild(messageEl);
        dialog.appendChild(btnContainer);
        overlay.appendChild(dialog);
        document.body.appendChild(overlay);

        // 6. 触发重排并添加动画类
        overlay.offsetHeight; 
        overlay.classList.add('show');

        // 7. 统一的关闭和清理逻辑
        const closeDialog = (result) => {
            overlay.classList.remove('show');
            // 等待退出动画结束后销毁 DOM 并 resolve Promise
            overlay.addEventListener('transitionend', (e) => {
                if (e.target === overlay) { // 确保是 overlay 触发的
                    overlay.remove();
                    resolve(result);
                }
            }, { once: true });
        };

        // 8. 绑定事件
        cancelBtn.addEventListener('click', () => closeDialog(false));
        confirmBtn.addEventListener('click', () => closeDialog(true));
    });
}


// --- Math Engine ---

// const Solver = {
//     // 定义操作符类型，用于识别纯加减法链路
//     ops: [
//         { s:'+', apply: (x,y)=>x.add(y), type: 'add' },
//         { s:'-', apply: (x,y)=>x.sub(y), type: 'sub' },
//         { s:'*', apply: (x,y)=>x.mul(y), type: 'mul' },
//         { s:'/', apply: (x,y)=>y.n!==0?x.div(y):null, type: 'div' }
//     ],

//     solve(nums) {
//         let uniqueKeys = new Set();
//         let solutionObjects = [];

//         // 递归求解
//         // Item: { val: Fraction, exp: String, lastOp: String, terms: Object|null }
//         const recurse = (list) => {
//             if (list.length === 1) {
//                 // 检查结果是否为 24
//                 if (Math.abs(list[0].val.val() - 24) < 0.000001) {
//                     let key;
                    
//                     // [算法核心] 如果存在线性项谱，使用它作为指纹
//                     if (list[0].terms) {
//                         // 将 {13:1, 1:-1, 3:1} 序列化为 "1:-1|3:1|13:1"
//                         // 这样顺序不同的纯加减法会被视为相同
//                         const sortedTerms = Object.entries(list[0].terms)
//                             .sort((a, b) => parseFloat(a[0]) - parseFloat(b[0])) // 按数字大小排序
//                             .map(([n, coef]) => `${n}:${coef}`)
//                             .join('|');
//                         key = "TERMS:" + sortedTerms;
//                     } else {
//                         // 包含乘除法，回退到字符串去重
//                         key = "EXP:" + list[0].exp;
//                     }

//                     if (!uniqueKeys.has(key)) {
//                         uniqueKeys.add(key);
//                         solutionObjects.push(list[0]);
//                     }
//                 }
//                 return;
//             }

//             for (let i = 0; i < list.length; i++) {
//                 for (let j = 0; j < list.length; j++) {
//                     if (i === j) continue;
//                     const a = list[i];
//                     const b = list[j];

//                     this.ops.forEach(op => {
//                         const res = op.apply(a.val, b.val);
//                         if (!res) return;

//                         // 1. 构建表达式字符串 (用于显示)
//                         let lExp = a.exp, rExp = b.exp;
//                         // 括号逻辑：如果当前优先级高于子项，加括号
//                         const isMulDiv = (t) => t === 'mul' || t === 'div';
//                         if (isMulDiv(op.type)) {
//                              if (a.lastOp && !isMulDiv(a.lastOp)) lExp = `(${lExp})`;
//                              if (b.lastOp && !isMulDiv(b.lastOp)) rExp = `(${rExp})`;
//                         }
//                         // 减法/除法右侧特殊处理
//                         if (op.type === 'sub' && (b.lastOp === 'sub' || b.lastOp === 'add')) rExp = `(${rExp})`;
//                         if (op.type === 'div' && (b.lastOp === 'div' || b.lastOp === 'mul')) rExp = `(${rExp})`;

//                         // 交换律美化 (仅显示用)
//                         let newExp = (op.type === 'add' || op.type === 'mul') && lExp.length > rExp.length
//                             ? `${rExp} ${op.s} ${lExp}`
//                             : `${lExp} ${op.s} ${rExp}`;

//                         // 2. [算法核心] 维护线性项 (Terms)
//                         let newTerms = null;
//                         if (op.type === 'add' && a.terms && b.terms) {
//                             // (A + B) -> 合并系数
//                             newTerms = { ...a.terms };
//                             for (let k in b.terms) newTerms[k] = (newTerms[k] || 0) + b.terms[k];
//                         } else if (op.type === 'sub' && a.terms && b.terms) {
//                             // (A - B) -> B的系数取反后合并
//                             newTerms = { ...a.terms };
//                             for (let k in b.terms) newTerms[k] = (newTerms[k] || 0) - b.terms[k];
//                         } 
//                         // 乘除法会破坏纯线性关系，newTerms 保持为 null

//                         const newList = list.filter((_, idx) => idx !== i && idx !== j);
//                         newList.push({
//                             val: res,
//                             exp: newExp,
//                             lastOp: op.type,
//                             terms: newTerms
//                         });
//                         recurse(newList);
//                     });
//                 }
//             }
//         };

//         // 初始化：每个输入数字是一个独立的线性项
//         const initialList = nums.map(n => ({
//             val: new Fraction(n),
//             exp: n.toString(),
//             lastOp: null,
//             terms: { [n]: 1 } // 例如: { "13": 1 }
//         }));

//         recurse(initialList);
//         return solutionObjects;
//     },
    
//     generateQuestion() {
//         while(true) {
//             const nums = Array.from({length: 4}, () => Math.floor(Math.random() * 13) + 1);
//             const solutions = this.solve(nums);
//             if (App.state.allowNoSolution || solutions.length > 0) return { nums, solutions };
//         }
//     }
// };

// class Fraction {
//     constructor(n, d = 1) {
//         if (d === 0) throw new Error("Division by zero");
//         this.n = n;
//         this.d = d;
//         this.simplify();
//     }
//     simplify() {
//         const gcd = (a, b) => b ? gcd(b, a % b) : Math.abs(a);
//         const common = gcd(this.n, this.d);
//         this.n /= common;
//         this.d /= common;
//         if (this.d < 0) { this.n *= -1; this.d *= -1; }
//     }
//     add(f) { return new Fraction(this.n * f.d + f.n * this.d, this.d * f.d); }
//     sub(f) { return new Fraction(this.n * f.d - f.n * this.d, this.d * f.d); }
//     mul(f) { return new Fraction(this.n * f.n, this.d * f.d); }
//     div(f) { return new Fraction(this.n * f.d, this.d * f.n); }
//     val() { return this.n / this.d; }
//     toString() { return this.d === 1 ? `${this.n}` : `${this.n}/${this.d}`; }
// }

/**
 * ============================================================================
 * @algorithm  24-Point Solver (AST Flattening & Canonical Hashing)
 * @author     Gemini 3 Pro
 * * [实现逻辑说明]
 * 本算法通过构建“扁平化”的抽象语法树 (AST) 来彻底解决交换律和结合律导致的重复解问题。
 * * 1. 扁平化处理 (Flattening):
 * - 传统的二叉树 (a+b)+c 与 a+(b+c) 会被视为不同。
 * - 本算法将连续的加减法合并为一个 ADD 节点，连续的乘除法合并为一个 MUL 节点。
 * - 例如：(8 / 1) / (1 / 3)  ==>  MUL项: [*8, /1, /1, *3]
 * * 2. 算式指纹 (Canonical Hashing):
 * - 对 ADD/MUL 节点内部的子项进行【字典序排序】。
 * - 无论输入顺序如何（如 3*8 或 8*3），排序后的特征字符串（Hash）完全一致。
 * - 符号标准化：自动处理负号提取，使 -(3-5) 与 (5-3) 映射到同一指纹。
 * * 3. 递归回溯 (Recursive Backtracking):
 * - 每次从数组中取出两个 AST 节点，尝试四则运算并合并成新的 AST 节点。
 * - 只有当最终结果为 24 且其 Hash 尚未在 Set 中出现时，才判定为独立解。
 * * [逻辑架构图]
 * ┌──────────┐      ┌──────────────┐      ┌──────────────┐      ┌──────────┐
 * │  Numbers │ ───> │  AST Nodes   │ ───> │ Flatten/Sort │ ───> │ Unique?  │
 * └──────────┘      └──────────────┘      └──────────────┘      └──────────┘
 * |                   |                     |                    |
 * [3,8,1,1]        (3*8)+(1-1)           ADD[MUL[3,8], 1, -1]     YES/NO
 * * ! 注意：本算法优先保证数学本质的唯一性，而非步骤的唯一性。
 * ============================================================================
 */
const Solver = {
    solve(nums) {
        let uniqueKeys = new Set();
        let solutionObjects = [];

        // --- 1. 获取标准化哈希 (算法核心：完美去重) ---
        const getHash = (node) => {
            if (node.type === 'val') {
                return String(node.n);
            } else if (node.type === 'add') {
                let is_neg = node.val.n < 0; // 判断该加法块最终计算结果是否为负
                let termHashes = node.terms.map(t => {
                    let op = t.op;
                    if (is_neg) op = (op === '+' ? '-' : '+'); // 如果整体是负，内部符号翻转以便标准化
                    
                    let h = getHash(t.expr);
                    // 抵消子节点的负号
                    if (h.startsWith('-')) {
                        op = (op === '+' ? '-' : '+');
                        h = h.substring(1);
                    }
                    return op + h;
                });
                termHashes.sort(); // 核心：按字典序排序，无视原有的计算先后顺序
                let h = "(ADD" + termHashes.join("") + ")";
                return is_neg ? "-" + h : h;
            } else if (node.type === 'mul') {
                let factorHashes = node.factors.map(f => {
                    let h = getHash(f.expr);
                    let sign = 1;
                    if (h.startsWith('-')) {
                        sign = -1;
                        h = h.substring(1);
                    }
                    return { op: f.op, h: h };
                });
                
                let is_neg = node.val.n < 0;
                let strFactors = factorHashes.map(f => f.op + f.h);
                strFactors.sort(); // 核心：按字典序排序乘除法因子
                let h = "(MUL" + strFactors.join("") + ")";
                return is_neg ? "-" + h : h;
            }
        };

        // --- 2. 格式化输出 (更符合人类阅读习惯) ---
        const formatAST = (node) => {
            if (node.type === 'val') return String(node.n);
            if (node.type === 'add') {
                // 为了美观，尽量把加号项放前面避免出现 "-3 + 8" 而是输出 "8 - 3"
                let pos = node.terms.filter(t => t.op === '+');
                let neg = node.terms.filter(t => t.op === '-');
                let sortedTerms = pos.concat(neg);
                
                let res = "";
                for (let i = 0; i < sortedTerms.length; i++) {
                    let t = sortedTerms[i];
                    let exprStr = formatAST(t.expr);
                    if (i === 0) {
                        res += (t.op === '-' ? '-' : '') + exprStr;
                    } else {
                        res += ' ' + t.op + ' ' + exprStr;
                    }
                }
                return res;
            }
            if (node.type === 'mul') {
                let res = "";
                for (let i = 0; i < node.factors.length; i++) {
                    let f = node.factors[i];
                    let exprStr = formatAST(f.expr);
                    // 如果乘除法内嵌了加法块，必须加括号
                    if (f.expr.type === 'add') exprStr = '(' + exprStr + ')';
                    
                    if (i === 0) {
                        if (f.op === '/') res += '1 / ' + exprStr;
                        else res += exprStr;
                    } else {
                        res += ' ' + f.op + ' ' + exprStr;
                    }
                }
                return res;
            }
        };

        // --- 3. AST 构建节点方法 (扁平化逻辑) ---
        const makeAdd = (expr1, expr2, is_sub) => {
            let terms = [];
            // 如果遇到嵌套的加法块，直接提取内容打平
            if (expr1.type === 'add') terms.push(...expr1.terms);
            else terms.push({ op: '+', expr: expr1 });

            if (expr2.type === 'add') {
                for (let t of expr2.terms) {
                    let op = t.op;
                    if (is_sub) op = (op === '+' ? '-' : '+'); // 处理减去一个多项式的情况
                    terms.push({ op, expr: t.expr });
                }
            } else {
                terms.push({ op: is_sub ? '-' : '+', expr: expr2 });
            }
            let val = is_sub ? expr1.val.sub(expr2.val) : expr1.val.add(expr2.val);
            return { type: 'add', terms, val };
        };

        const makeMul = (expr1, expr2, is_div) => {
            let factors = [];
            // 如果遇到嵌套的乘法块，直接提取内容打平
            if (expr1.type === 'mul') factors.push(...expr1.factors);
            else factors.push({ op: '*', expr: expr1 });

            if (expr2.type === 'mul') {
                for (let f of expr2.factors) {
                    let op = f.op;
                    if (is_div) op = (op === '*' ? '/' : '*'); // 处理除以一个乘法链的情况
                    factors.push({ op, expr: f.expr });
                }
            } else {
                factors.push({ op: is_div ? '/' : '*', expr: expr2 });
            }
            let val = is_div ? expr1.val.div(expr2.val) : expr1.val.mul(expr2.val);
            return { type: 'mul', factors, val };
        };

        // --- 4. 递归回溯求解 ---
        const recurse = (list) => {
            if (list.length === 1) {
                let ast = list[0];
                // 使用分数运算，避免浮点误差，精确对比是否为24
                if (ast.val.n === 24 * ast.val.d) {
                    let key = getHash(ast);
                    if (!uniqueKeys.has(key)) {
                        uniqueKeys.add(key);
                        solutionObjects.push({
                            exp: formatAST(ast),
                            val: ast.val
                        });
                    }
                }
                return;
            }

            for (let i = 0; i < list.length; i++) {
                for (let j = 0; j < list.length; j++) {
                    if (i === j) continue;
                    const a = list[i];
                    const b = list[j];
                    
                    const nextListBase = list.filter((_, idx) => idx !== i && idx !== j);

                    recurse([...nextListBase, makeAdd(a, b, false)]);
                    recurse([...nextListBase, makeAdd(a, b, true)]);
                    recurse([...nextListBase, makeMul(a, b, false)]);
                    
                    // 防御除零操作
                    if (b.val.n !== 0) {
                        recurse([...nextListBase, makeMul(a, b, true)]);
                    }
                }
            }
        };

        // --- 初始化 AST 节点 ---
        const initialList = nums.map(n => ({
            type: 'val',
            n: n,
            val: new Fraction(n)
        }));

        recurse(initialList);
        return solutionObjects;
    },

    generateQuestion() {
        while(true) {
            const nums = Array.from({length: 4}, () => Math.floor(Math.random() * 13) + 1);
            const solutions = this.solve(nums);
            // 兼容你原来的 App 对象状态检测
            if ((typeof App !== 'undefined' && App.state && App.state.allowNoSolution) || solutions.length > 0) {
                return { nums, solutions };
            }
        }
    }
};

class Fraction {
    constructor(n, d = 1) {
        if (d === 0) throw new Error("Division by zero");
        this.n = n;
        this.d = d;
        this.simplify();
    }
    simplify() {
        const gcd = (a, b) => b ? gcd(b, a % b) : Math.abs(a);
        const common = gcd(this.n, this.d);
        this.n /= common;
        this.d /= common;
        if (this.d < 0) { this.n *= -1; this.d *= -1; }
    }
    add(f) { return new Fraction(this.n * f.d + f.n * this.d, this.d * f.d); }
    sub(f) { return new Fraction(this.n * f.d - f.n * this.d, this.d * f.d); }
    mul(f) { return new Fraction(this.n * f.n, this.d * f.d); }
    div(f) { return new Fraction(this.n * f.d, this.d * f.n); }
    val() { return this.n / this.d; }
    toString() { return this.d === 1 ? `${this.n}` : `${this.n}/${this.d}`; }
}


const App = {
    state: {
        lang: 'zh', 
        cardStyle: 'modern',
        totalStamina: 10,
        stamina: 0,
        streak: 0,
        currentCards: [], 
        history: [], 
        usedQuestions: new Set(), 
        activeOp: null,
        levelSolutions: [],
        timer: null,
        timeLeft: 30,
        levelNums: [],
        allowNoSolution: false, // 是否允许生成无解题
        penaltyPaid: false,     // 本关是否已支付过体力惩罚
    },

    init() {
        this.bindEvents();
        this.renderPalette();
        this.updateText();
    },
    toggleNoSolMode(input) {
    this.state.allowNoSolution = !!input.checked;
},

    bindEvents() {
        document.addEventListener('keydown', (e) => {
            const key = e.key.toLowerCase();
            if (['w','a','s','d'].includes(key)) {
                this.state.activeOp = key;
                this.updateOpIndicator();
            }
        });
        document.addEventListener('keyup', (e) => {
            if (['w','a','s','d'].includes(e.key.toLowerCase())) {
                this.state.activeOp = null;
                this.updateOpIndicator();
            }
        });
    },

    renderPalette() {
        const menu = document.getElementById('palette-menu');
        menu.innerHTML = THEMES.map(t => `
            <div class="theme-option" onclick="App.setTheme('${t.id}')">
                <div class="color-dot" style="background:${t.vars['--bg-body'] || '#a1c4fd'}"></div>
                <span>${t.name}</span>
            </div>
        `).join('');
    },

    setTheme(id) {
        document.body.setAttribute('data-theme', id);
        this.togglePalette();
    },

    togglePalette() {
        document.getElementById('palette-menu').classList.toggle('show');
    },

    updateOpIndicator() {
        // 移除原有的 indicator.textContent 和 classList 操作
        ['w','a','s','d'].forEach(k => {
            const badge = document.getElementById(`key-${k}`);
            if(badge) {
                // 仅切换 CSS 类
                badge.className = `key-badge ${this.state.activeOp === k ? 'key-active' : ''}`;
            }
        });
        // 隐藏悬浮条 (如果 HTML 中还有 id="op-indicator" 建议在 CSS 中直接隐藏或保留空逻辑)
        const ind = document.getElementById('op-indicator');
        if(ind) ind.classList.remove('visible');
    },
    

    showScreen(id) {
        document.querySelectorAll('.screen').forEach(el => el.classList.remove('active'));
        document.getElementById(id).classList.add('active');
    },
    
    showHome() { this.showScreen('screen-home'); },
    showSettings() { this.showScreen('screen-settings'); },
    showCalculator() { this.showScreen('screen-calculator'); },
    showHelp() { this.showScreen('screen-help'); },
    // --- Game Logic ---
    startGame() {
        this.state.stamina = this.state.totalStamina;
        this.state.streak = 0;
        this.state.history = [];
        this.state.usedQuestions.clear();
        this.updateHUD();
        this.nextLevel();
    },

    nextLevel() {
    if (this.state.stamina <= 0) {
        this.endGameAndHistory();
        return;
    }

    this.state.penaltyPaid = false;

    let q;
    let attempts = 0;
    do {
        q = Solver.generateQuestion();
        const key = [...q.nums].sort().join(',');
        const hasSolution = (q.solutions?.length || 0) > 0;

        // allowNoSolution=false: 只出有解题
        // allowNoSolution=true : 有解/无解都可
        if (!this.state.usedQuestions.has(key) && (this.state.allowNoSolution || hasSolution)) {
            this.state.usedQuestions.add(key);
            break;
        }
        attempts++;
    } while (attempts < 300);

    this.state.levelNums = [...q.nums];
    this.state.levelSolutions = q.solutions || [];
    this.state.currentCards = q.nums.map((n, i) => ({
        id: i, val: new Fraction(n), slot: i
    }));

    this.showScreen('screen-game');
    this.renderCards();
    this.startTimer();
}

,
    deductStamina(reasonKey, oncePerLevel = false) {
    if (oncePerLevel && this.state.penaltyPaid) return false;

    this.state.stamina--;
    if (oncePerLevel) this.state.penaltyPaid = true;
    this.updateHUD();

    if (this.state.stamina <= 0) {
        this.showSettlement(false, I18N[this.state.lang].stamina_out);
    }
    return true;
}
,
    // Point 2: Restart Level Logic (Reset to initial state)
    restartLevel(resetTimer = false) {
            const nums = this.state.levelNums;
            this.state.currentCards = nums.map((n, i) => ({
                id: i,
                val: new Fraction(n),
                slot: i
            }));
            this.renderCards();

            // 只有在明确传入 true 时（比如时间到了重试），才会刷新计时器
            if (resetTimer) {
                this.startTimer();
            }
        },
    // 超时
    handleTimeout() {
        this.stopTimer();
        
        // 扣除体力与重置连胜
        this.state.stamina-= 2; 
        this.state.streak = 0;
        this.updateHUD(); // 刷新红心显示

        // 呼出结算和答案展示页 (false 代表失败)
        const msg = I18N[this.state.lang].timeout;
        this.showSettlement(false, msg);
    },
startTimer() {
        clearInterval(this.state.timer);
        this.state.timeLeft = 30;
        const bar = document.getElementById('timer-bar');
        
        // --- 这里补回被删掉的动画重置逻辑 ---
        if (bar) {
            bar.style.transition = 'none'; // 取消现有动画
            bar.style.width = '100%';      // 瞬间拉满进度条
            void bar.offsetWidth;          // 触发浏览器重绘 (Reflow)，这句非常关键，不能省
            
            bar.style.transition = 'width 30s linear'; // 开启 30 秒匀速动画
            bar.style.width = '0%';        // 目标宽度为 0
        }
        // ------------------------------------
        
        this.state.timer = setInterval(() => {
            this.state.timeLeft--;
            if (this.state.timeLeft <= 0) {
                clearInterval(this.state.timer);
                this.handleTimeout();
            }
        }, 1000);
    },

    stopTimer() {
        clearInterval(this.state.timer);
        const bar = document.getElementById('timer-bar');
        if (bar) {
            // 顺便帮你修一下停止计时器：冻结当前宽度的同时，必须清除 transition 动画，否则它还会偷偷动
            bar.style.width = bar.offsetWidth + 'px'; 
            bar.style.transition = 'none'; 
        }
    },

    renderCards() {
        // Point 2: Render cards into specific slots (conceptually) or absolute positions based on slots
        // We will remove all existing cards and re-add them.
        const area = document.getElementById('game-area');
        // Keep slots in DOM, remove cards
        const existingCards = area.querySelectorAll('.card');
        existingCards.forEach(c => c.remove());

        const slots = document.querySelectorAll('.card-slot');
        // Helper to get slot coordinates
        const getSlotRect = (idx) => {
            const slot = slots[idx];
            if(!slot) return { left: 0, top: 0 };
            return {
                left: slot.offsetLeft,
                top: slot.offsetTop,
                width: slot.offsetWidth,
                height: slot.offsetHeight
            };
        };

        this.state.currentCards.forEach((c) => {
            const el = document.createElement('div');
            el.className = `card card-style-${this.state.cardStyle}`;
            el.textContent = c.val.toString();
            el.dataset.id = c.id;
            
            if (this.state.cardStyle === 'colorful') {
                const hue = (c.val.val() * 45) % 360;
                el.style.backgroundColor = `hsl(${hue}, 70%, 60%)`;
                el.style.borderColor = 'white';
            }

            // Position based on slot
            const rect = getSlotRect(c.slot);
            // Center the card in the slot
            // Card is 80x110. Slot is roughly half width/height minus gap.
            // Let's center it.
            const cardW = 80, cardH = 110;
            const left = rect.left + (rect.width - cardW) / 2;
            const top = rect.top + (rect.height - cardH) / 2;

            el.style.left = left + 'px';
            el.style.top = top + 'px';

            this.makeDraggable(el);
            area.appendChild(el);
        });
    },

    makeDraggable(el) {
        let isDragging = false;
        let startX, startY, initialLeft, initialTop;
        let draggedCardId = parseInt(el.dataset.id);

        const start = (e) => {
            if (e.target !== el) return;
            isDragging = true;
            el.classList.add('dragging');
            const pt = e.touches ? e.touches[0] : e;
            startX = pt.clientX;
            startY = pt.clientY;
            initialLeft = el.offsetLeft;
            initialTop = el.offsetTop;
            el.setPointerCapture(e.pointerId);
        };

        const move = (e) => {
            if (!isDragging) return;
            const pt = e.touches ? e.touches[0] : e;
            const dx = pt.clientX - startX;
            const dy = pt.clientY - startY;
            el.style.left = `${initialLeft + dx}px`;
            el.style.top = `${initialTop + dy}px`;

            // Point 1: Check overlap for highlight
            this.checkOverlapHighlight(el);
        };

        const end = (e) => {
            if (!isDragging) return;
            isDragging = false;
            el.classList.remove('dragging');
            document.querySelectorAll('.drag-over').forEach(c => c.classList.remove('drag-over')); // Clear highlights
            el.releasePointerCapture(e.pointerId);
            this.checkCollision(el, initialLeft, initialTop);
        };

        el.onpointerdown = start;
        el.onpointermove = move;
        el.onpointerup = end;
    },

    // Point 1: Highlight Logic
    checkOverlapHighlight(draggedEl) {
        document.querySelectorAll('.card').forEach(c => c.classList.remove('drag-over'));
        const draggedRect = draggedEl.getBoundingClientRect();
        const cards = Array.from(document.querySelectorAll('.card'));
        
        let targetEl = null;
        let maxOverlap = 0;

        cards.forEach(c => {
            if (c === draggedEl) return;
            const r = c.getBoundingClientRect();
            const xOverlap = Math.max(0, Math.min(draggedRect.right, r.right) - Math.max(draggedRect.left, r.left));
            const yOverlap = Math.max(0, Math.min(draggedRect.bottom, r.bottom) - Math.max(draggedRect.top, r.top));
            const area = xOverlap * yOverlap;

            if (area > 500 && area > maxOverlap) { // Threshold
                maxOverlap = area;
                targetEl = c;
            }
        });

        if (targetEl) {
            targetEl.classList.add('drag-over');
        }
    },
    
    checkCollision(draggedEl, oldLeft, oldTop) {
        // ... Same collision logic, but use 'slot' for snapping back ...
        const draggedRect = draggedEl.getBoundingClientRect();
        const cards = Array.from(document.querySelectorAll('.card'));
        
        let targetEl = null;
        let maxOverlap = 0;

        cards.forEach(c => {
            if (c === draggedEl) return;
            const r = c.getBoundingClientRect();
            const xOverlap = Math.max(0, Math.min(draggedRect.right, r.right) - Math.max(draggedRect.left, r.left));
            const yOverlap = Math.max(0, Math.min(draggedRect.bottom, r.bottom) - Math.max(draggedRect.top, r.top));
            const area = xOverlap * yOverlap;
            if (area > 500 && area > maxOverlap) {
                maxOverlap = area;
                targetEl = c;
            }
        });

        if (targetEl && this.state.activeOp) {
            this.performOp(draggedEl, targetEl, this.state.activeOp);
        } else {
            // Point 2: Snap back to original slot if invalid
            // We just trigger renderCards which re-calculates positions based on slots
            this.renderCards();
        }
    },

    performOp(dragEl, targetEl, opKey) {
        const id1 = parseInt(dragEl.dataset.id);
        const id2 = parseInt(targetEl.dataset.id);
        
        const c1 = this.state.currentCards.find(c => c.id === id1);
        const c2 = this.state.currentCards.find(c => c.id === id2);

        let res = null;
        try {
            switch(opKey) {
                case 'w': res = c1.val.mul(c2.val); break;
                case 'a': res = c1.val.add(c2.val); break;
                case 's': res = c1.val.div(c2.val); break; // Dragged is dividend
                case 'd': // Larger minus smaller
                    const val1 = c1.val.val();
                    const val2 = c2.val.val();
                    res = val1 > val2 ? c1.val.sub(c2.val) : c2.val.sub(c1.val);
                    break;
            }
        } catch(e) { return; }

        // Remove old cards, add new card
        this.state.currentCards = this.state.currentCards.filter(c => c.id !== id1 && c.id !== id2);
        const newId = Date.now(); 
        
        // Point 2: Logic for slot allocation.
        // Simple heuristic: Take the slot of the target card.
        const newCard = {
            id: newId,
            val: res,
            slot: c2.slot // Take target's slot
        };
        this.state.currentCards.push(newCard);

        this.renderCards();
        if (this.state.currentCards.length === 1) {
                    // 检查最后一张卡片的值是否为 24
                    if (Math.abs(this.state.currentCards[0].val.val() - 24) < 0.0001) {
                        // 算对了：延迟 300ms 触发胜利，让玩家看清“24”
                        setTimeout(() => {
                            this.handleWin();
                        }, 300);
                    } else {
                        // 算错了：延迟 300ms 弹出提示并重置卡片
                        setTimeout(() => {
                            showToast('Wrong calculation, target is 24! Try again.', 'error');
                            
                            // 传入 false 表示只重置卡片状态，不重置倒计时
                            this.restartLevel(false); 
                        }, 300);
                    }
            }
    },
    useHint() {
        // 尝试扣分
        if (this.state.stamina <= 0) return;
        
        // 每关 hint 只扣一次（用 penaltyPaid）
        this.deductStamina('hint_paid', true);
        if (this.state.stamina <= 0) return;

        this.restartLevel(false); // 提示时可不重置计时，按你喜好可改 true
        
        // 简单高亮实现：

        for(let i=0; i<4; i++) {
            for(let j=i+1; j<4; j++) {
                const c1 = document.querySelector(`.card[data-id="${i}"]`);
                const c2 = document.querySelector(`.card[data-id="${j}"]`);
                if(c1 && c2) {
                    c1.classList.add('highlighted');
                    c2.classList.add('highlighted');
                    setTimeout(() => document.querySelectorAll('.highlighted').forEach(e=>e.classList.remove('highlighted')), 2000);
                    return; 
                }
            }
        }
    },

    handleWin() {
        this.stopTimer();
        this.state.streak++;
        this.showSettlement(true);
    },

    handleLoss(reason) {
        this.stopTimer();
        this.state.stamina--; // Penalty
        this.state.streak = 0;
        this.showSettlement(false, reason);
    },

    submitAnswer() {
        // 这个按钮现在的实际作用是：“声明本题无解”
        const isTrulyNoSolution = this.state.levelSolutions.length === 0;

        if (isTrulyNoSolution) {
            // 玩家判断正确，确实无解，算作胜利
            this.handleWin(); 
        } else {
            // 玩家判断错误，本题其实有解
            showToast('This puzzle has a solution! Try again.', 'info');
            // 重置卡片回到初始状态，传入 false 表示【不重置】倒计时
            this.restartLevel(false); 
        }
    },


    endGameAndHistory() {
        this.stopTimer();
        this.showHistory();
    },

    showSettlement(success, msg="") {
        const el = document.getElementById('screen-settlement');
        const title = document.getElementById('settlement-title');
        const content = document.getElementById('settlement-content');
        const txt = I18N[this.state.lang];

        el.classList.add('active');
        
        // Record History
        const roundData = {
            q: this.state.levelNums.join(','),
            res: success ? "Win" : "Loss",
            success: success,
            sols: this.state.levelSolutions.map(s => s.exp)
        };
        this.state.history.push(roundData);

        if (success) {
            title.textContent = txt.success;
            title.style.color = 'var(--color-success)';
            content.innerHTML = `<p>${txt.game_history}: ${this.state.streak}</p>`;
        } else {
            title.textContent = txt.fail;
            title.style.color = 'var(--color-danger)';
            content.innerHTML = `<p>${msg}</p><p>Solutions:</p><ul>${this.state.levelSolutions.slice(0,1).map(s=>`<li>${s.exp}</li>`).join('')}</ul>`;
        }

        if (this.state.stamina <= 0) {
            document.querySelector('[data-t="next_level"]').style.display = 'none';
            title.textContent = txt.stamina_out;
        } else {
            document.querySelector('[data-t="next_level"]').style.display = 'inline-block';
        }
    },

    // Point 4: Export Markdown
    exportMarkdown(type) {
        let content = "# 24 Point Game History\n\n";
        const list = type === 'wrong' ? this.state.history.filter(h => !h.success) : this.state.history;
        
        if (list.length === 0) {
            showToast("No records to export.", 'info');
            return;
        }

        list.forEach((h, i) => {
            content += `## Round ${i+1}\n`;
            content += `- **Question**: ${h.q}\n`;
            content += `- **Result**: ${h.res}\n`;
            content += `- **Solutions**:\n${h.sols.map(s => `  - ${s}`).join('\n')}\n\n`;
        });

        // Trigger download
        const blob = new Blob([content], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `24point_${type}_${Date.now()}.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    },

    showHistory() {
        this.showScreen('screen-history');
        const list = document.getElementById('history-list');
        list.innerHTML = this.state.history.map((h, i) => `
            <div style="border-bottom:1px solid var(--border-container); padding:10px;">
                <strong style="color:${h.success ? 'var(--color-success)' : 'var(--color-danger)'}">Round ${i+1}: [${h.q}] - ${h.res}</strong><br>
                <small>${h.sols[0] || 'No Solution'}</small>
            </div>
        `).join('');
    },

    updateHUD() {
        document.getElementById('stamina-display').textContent = `❤️ ${this.state.stamina}/${this.state.totalStamina}`;
        document.getElementById('streak-display').textContent = `🔥 ${this.state.streak}`;
    },

    // Point 6: Input Validation
    validateInput(input) {
        // Remove non-numeric
        input.value = input.value.replace(/[^0-9]/g, '');
        // Range check
        const v = parseInt(input.value);
        if (v > 13) input.value = 13;
        if (v < 1 && input.value !== '') input.value = 1;
    },

    calculate() {
        const inputs = Array.from(document.querySelectorAll('.calc-input'));
        const nums = inputs.map(i => parseInt(i.value));
        if (nums.some(isNaN)) return;

        const sols = Solver.solve(nums);
        const out = document.getElementById('calc-output');
        
        if (sols.length === 0) {
            out.innerHTML = `<div style="color:var(--color-danger)">No Solution</div>`;
        } else {
            out.innerHTML = sols.map(s => `<div>${s.exp}</div>`).join('');
        }
    },

    changeLang(lang) {
        this.state.lang = lang;
        this.updateText();
    },

    changeCardStyle(style) {
        this.state.cardStyle = style;
        if(document.getElementById('screen-game').classList.contains('active')) {
            this.renderCards();
        }
    },

    updateText() {
        const t = I18N[this.state.lang];
        document.querySelectorAll('[data-t]').forEach(el => {
            const key = el.dataset.t;
            if (t[key]) el.textContent = t[key];
        });
        // Update placeholders
        if(this.state.activeOp) this.updateOpIndicator();
    },
    printCards(type) {
    const list = type === 'wrong' ? this.state.history.filter(h => !h.success) : this.state.history;
    
    if (list.length === 0) {
        showToast("No records to print.", 'info');
        return;
    }

    const win = window.open('', '_blank');
    
    // 构建打印页面的 HTML
    // 使用内联 CSS 确保样式在新窗口生效
    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>24 Point Game Record</title>
            <style>
                body { font-family: 'Segoe UI', sans-serif; -webkit-print-color-adjust: exact; color: #333; }
                h2 { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; }
                
                /* 打印容器：两列网格 */
                .print-container { 
                    display: grid; 
                    grid-template-columns: 1fr 1fr; 
                    gap: 20px; 
                    width: 100%;
                }
                
                /* 单个题目卡片 */
                .print-card { 
                    border: 1px solid #ccc; 
                    border-radius: 8px; 
                    padding: 15px; 
                    background: #f8f9fa;
                    break-inside: avoid; /* 防止分页截断 */
                }
                
                .header { 
                    display: flex; justify-content: space-between; 
                    border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-bottom: 10px;
                    font-weight: bold; font-size: 0.9em;
                }
                
                /* 数字展示框 */
                .nums-row { display: flex; gap: 10px; justify-content: center; margin: 15px 0; }
                .num-box { 
                    width: 36px; height: 48px; 
                    border: 2px solid #333; border-radius: 4px;
                    display: flex; align-items: center; justify-content: center; 
                    font-weight: bold; font-size: 1.2em; background: #fff;
                }
                
                .solutions { font-family: monospace; font-size: 0.85em; color: #555; background: #eee; padding: 5px; border-radius: 4px;}
                .win { color: green; } .loss { color: red; }
                
                @media print {
                    @page { margin: 1cm; size: A4; }
                }
            </style>
        </head>
        <body>
            <h2>24 Point Game History (${type === 'wrong' ? 'Wrong Only' : 'All'})</h2>
            <div class="print-container">
                ${list.map((h, i) => `
                    <div class="print-card">
                        <div class="header">
                            <span>Round ${i+1}</span>
                            <span class="${h.success ? 'win' : 'loss'}">${h.success ? 'WIN' : 'LOSS'}</span>
                        </div>
                        <div class="nums-row">
                            ${h.q.split(',').map(n => `<div class="num-box">${n}</div>`).join('')}
                        </div>
                        <div class="solutions">
                            <div><strong>Ref Solution:</strong></div>
                            ${h.sols.length > 0 ? h.sols.slice(0,3).map(s => `<div>• ${s}</div>`).join('') : 'No Solution'}
                        </div>
                    </div>
                `).join('')}
            </div>
            <script>
                // 页面加载完成后自动触发打印
                window.onload = () => { setTimeout(() => window.print(), 500); };
            </script>
        </body>
        </html>
    `;

    win.document.write(htmlContent);
    win.document.close();
}

};

window.onload = () => App.init();