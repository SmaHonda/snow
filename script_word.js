const wordsheetUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSVJwzRWaESO46JPqKSY0Ea6hIenazqJk4jMQqLxLb_SPk1mhHvOIxscPykKNLhrVDvUj2R4oEIlwOx/pub?gid=242991524&single=true&output=csv";

async function loadWords() {
    try {
        const response = await fetch(wordsheetUrl);
        const csvText = await response.text();
        
        // 檢查是否有抓到東西
        console.log("原始資料:", csvText);

        // 分割行，並過濾掉空行
        const rows = csvText.split(/\r?\n/).filter(row => row.trim() !== "");
        const container = document.getElementById('word-container');
        
        if (!container) return; // 確保 HTML 裡有這個 ID
        container.innerHTML = ''; 

        // 從第二行 (i=1) 開始抓
        for (let i = 1; i < rows.length; i++) {
            const cols = rows[i].split(',');
            // 確保這行至少有四個欄位
            if (cols.length >= 4) {
                const [category, japanese, romaji, chinese] = cols;
                
                const card = `
                    <div class="word-card">
                        <span class="tag">${category.trim()}</span>
                        <h3>${japanese.trim()}</h3>
                        <p class="romaji">${romaji.trim()}</p>
                        <p class="chinese">${chinese.trim()}</p>
                    </div>
                `;
                container.innerHTML += card;
            }
        }
    } catch (error) {
        console.error('抓取失敗，原因：', error);
    }
}

loadWords();


//搜尋框

document.getElementById('searchInput').addEventListener('input', function(e) {
    const searchTerm = e.target.value.toLowerCase();
    const cards = document.querySelectorAll('.word-card');
    
    cards.forEach(card => {
        const text = card.innerText.toLowerCase();
        card.style.display = text.includes(searchTerm) ? "flex" : "none";
    });
});



//分類按鈕

let allWords = []; // 用來儲存所有抓到的單字資料

async function loadWords() {
    try {
        const response = await fetch(wordsheetUrl);
        const csvText = await response.text();
        const rows = csvText.split(/\r?\n/).filter(row => row.trim() !== "");
        
        // 解析資料並存入陣列
        allWords = rows.slice(1).map(row => {
            const [category, japanese, romaji, chinese] = row.split(',').map(item => item.trim());
            return { category, japanese, romaji, chinese };
        });

        renderCategories(); // 產生分類按鈕
        renderCards(allWords); // 產生所有卡片
        
    } catch (error) {
        console.error("資料載入失敗:", error);
    }
}

// 1. 產生分類按鈕
function renderCategories() {
    const categoryContainer = document.getElementById('category-tags');
    if (!categoryContainer) return;

    // 取得所有不重複的分類
    const categories = ['全部', ...new Set(allWords.map(w => w.category))];
    
    categoryContainer.innerHTML = categories.map(cat => `
        <button onclick="filterByCategory('${cat}')" class="btn-category">
            ${cat}
        </button>
    `).join('');
}

// 2. 過濾分類的功能
function filterByCategory(category) {
    if (category === '全部') {
        renderCards(allWords);
    } else {
        const filtered = allWords.filter(w => w.category === category);
        renderCards(filtered);
    }
}

// 3. 渲染卡片的功能
function renderCards(data) {
    const container = document.getElementById('word-container');
    container.innerHTML = data.map(w => `
        <div class="word-card">
            <span class="tag">${w.category}</span>
            <h3>${w.japanese}</h3>
            <p class="romaji">${w.romaji}</p>
            <p class="chinese">${w.chinese}</p>
        </div>
    `).join('');
}

// 搜尋功能也要微調，改為搜尋目前的 data
document.getElementById('searchInput').addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = allWords.filter(w => 
        w.japanese.toLowerCase().includes(term) || 
        w.chinese.toLowerCase().includes(term)
    );
    renderCards(filtered);
});

loadWords();


//Quiz

function toggleQuizModal() {
    const modal = document.getElementById('quiz-modal');
    modal.classList.toggle('hidden');
    // 如果打開時裡面沒內容，就初始化
    if (!modal.classList.contains('hidden') && document.getElementById('quiz-container').innerHTML.includes('準備好')) {
        // 可以保持原樣或直接觸發 startQuiz()
    }
}

let quizState = {
    currentQuestion: 0,
    score: 0,
    totalQuestions: 10,
    activeWords: []
};

function startQuiz() {
    if (allWords.length < 4) return alert("單字量不足，無法生成測驗");
    
    // 初始化遊戲狀態
    quizState.currentQuestion = 0;
    quizState.score = 0;
    quizState.activeWords = [...allWords].sort(() => 0.5 - Math.random()); // 隨機打亂所有單字
    
    nextQuestion();
}

function nextQuestion() {
    if (quizState.currentQuestion < quizState.totalQuestions) {
        quizState.currentQuestion++;
        renderQuestion();
    } else {
        showFinalResult();
    }
}

function renderQuestion() {
    const question = quizState.activeWords[quizState.currentQuestion - 1];
    
    // 生成干擾選項 (從所有單字中隨機挑三個，且不重複題目)
    let distractors = allWords
        .filter(w => w.chinese !== question.chinese)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);

    const options = [question, ...distractors].sort(() => 0.5 - Math.random());

    const container = document.getElementById('quiz-container');
    container.innerHTML = `
        <div class="mb-2 flex justify-between items-center text-sm font-bold text-gray-500">
            <span>第 ${quizState.currentQuestion} / ${quizState.totalQuestions} 題</span>
            <span class="text-blue-600">分數: ${quizState.score}</span>
        </div>
        <div class="mb-6">
            <h3 class="text-4xl font-bold text-blue-600 my-4">${question.japanese}</h3>
        </div>
        <div class="grid grid-cols-1 gap-3">
            ${options.map(opt => `
                <button onclick="checkAnswer('${opt.chinese}', '${question.chinese}')" 
                        class="quiz-option-btn p-3 bg-white border-2 border-slate-200 rounded-xl hover:border-blue-400 transition">
                    ${opt.chinese}
                </button>
            `).join('')}
        </div>
        <div id="quiz-feedback" class="mt-4 h-8 font-bold"></div>
    `;
}

function checkAnswer(selected, correct) {
    // 防止重複點擊按鈕
    const btns = document.querySelectorAll('.quiz-option-btn');
    btns.forEach(b => b.disabled = true);

    const feedback = document.getElementById('quiz-feedback');
    if (selected === correct) {
        quizState.score += 10;
        feedback.innerHTML = "✨ 正解！太棒了！";
        feedback.className = "mt-4 h-8 font-bold text-green-500 animate-bounce";
        // 這裡可以切換答對的主角圖
    } else {
        feedback.innerHTML = `❌ 答錯了，正確答案是：${correct}`;
        feedback.className = "mt-4 h-8 font-bold text-red-400";
        // 這裡可以切換答錯的主角圖
    }

    setTimeout(nextQuestion, 1500); // 1.5秒後進入下一題
}

function showFinalResult() {
    const container = document.getElementById('quiz-container');
    let message = quizState.score >= 70 ? "恭喜你！滑雪日文專家！" : "加油！再練習一下會更好！";
    
    container.innerHTML = `
        <div class="text-center">
            <h3 class="text-2xl font-bold mb-2">測驗結束！</h3>
            <div class="text-5xl font-extrabold text-blue-600 my-6">${quizState.score} 分</div>
            <p class="mb-8 text-gray-600">${message}</p>
            <div class="flex flex-col gap-3">
                <button onclick="startQuiz()" class="bg-blue-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-600">
                    再次挑戰
                </button>
                <button onclick="toggleQuizModal()" class="bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-bold hover:bg-gray-300">
                    結束測驗
                </button>
            </div>
        </div>
    `;
}