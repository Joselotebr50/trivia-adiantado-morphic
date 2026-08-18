window.addEventListener('load', () => {
    setTimeout(() => {
        const loading = document.getElementById('loading-screen');
        if (loading) loading.style.display = 'none';
    }, 500);
});

let gameState = {
    questions: [],
    currentIndex: 0,
    score: 0,
    lives: 3,
    correctCount: 0,
    totalQuestions: 10,
    timer: 30,
    isActive: false,
    powerUps: { fifty: 3, skip: 2, extraTime: 1 }
};

let userProgress = {
    coins: parseInt(localStorage.getItem('trivia_coins') || '0'),
    highScore: parseInt(localStorage.getItem('trivia_highscore') || '0'),
    gamesPlayed: parseInt(localStorage.getItem('trivia_games') || '0')
};

const PREMIUM_PRICE = 9.90;
let isPremium = localStorage.getItem('trivia_premium') === 'true';

// ===== MENU INICIAL GLASSMORPHIC =====
function renderHome() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="header">
            <div class="header-left glass">☰</div>
            <div class="header-center">Trivia<span>Box</span></div>
            <div class="header-right glass">🔔</div>
        </div>

        <div class="hero-banner glass">
            <div class="hero-text">
                <h2>Bom dia, <span>Jogador(a)!</span> 👋</h2>
                <h3>Que tal um<br>Desafio hoje?</h3>
                <p>Teste seus conhecimentos e suba no ranking.</p>
                <div class="hero-dots"><span class="active"></span><span></span><span></span></div>
            </div>
            <div class="hero-image"></div>
        </div>

        <div class="search-bar glass">🔍 <input type="text" placeholder="Buscar quizzes..."> <span>⚙️</span></div>

        <div class="menu-grid">
            <div class="menu-card glass" onclick="startGame()"><div class="icon-circle icon-yellow">⚡</div><h4>Rápido</h4><p>Quiz de 10 perguntas</p><div class="arrow-btn">›</div></div>
            <div class="menu-card glass" onclick="startGame()"><div class="icon-circle icon-pink">🏆</div><h4>Desafio</h4><p>Modo sobrevivência</p><div class="arrow-btn">›</div></div>
            <div class="menu-card glass" onclick="alert('Em breve!')"><div class="icon-circle icon-purple">📚</div><h4>Categorias</h4><p>Navegue por temas</p><div class="arrow-btn">›</div></div>
            <div class="menu-card glass" onclick="alert('Em breve!')"><div class="icon-circle icon-blue">📊</div><h4>Ranking</h4><p>Veja sua posição</p><div class="arrow-btn">›</div></div>
            <div class="menu-card glass" onclick="alert('Em breve!')"><div class="icon-circle icon-teal">🤝</div><h4>Modo Duo</h4><p>Jogue com amigos</p><div class="arrow-btn">›</div></div>
            <div class="menu-card glass" onclick="alert('Em breve!')"><div class="icon-circle icon-orange">🎁</div><h4>Recompensas</h4><p>Troque suas moedas</p><div class="arrow-btn">›</div></div>
        </div>

        <div>
            <div class="section-header"><div>⏰ Quizzes Recentes</div><span>Ver todos ›</span></div>
            <div class="recents-scroll">
                <div class="recent-card glass"><div class="recent-img" style="background-image: url('./images/03.png');"></div><h4>História do Brasil</h4><div class="info"><span>⭐ 4.8</span><span>20 min</span></div></div>
                <div class="recent-card glass"><div class="recent-img" style="background-image: url('./images/04.png');"></div><h4>Ciência Geral</h4><div class="info"><span>⭐ 4.9</span><span>15 min</span></div></div>
                <div class="recent-card glass"><div class="recent-img" style="background-image: url('./images/05.png');"></div><h4>Cinema & TV</h4><div class="info"><span>⭐ 4.7</span><span>10 min</span></div></div>
            </div>
        </div>

        <div class="bottom-nav glass">
            <div class="nav-item active">🏠<br>Início</div>
            <div class="nav-item">📖<br>Quizzes</div>
            <div class="nav-center-wrapper"><div class="nav-center-btn" onclick="startGame()">🎯</div></div>
            <div class="nav-item">📊<br>Ranking</div>
            <div class="nav-item">👤<br>Perfil</div>
        </div>
    `;
}

// ===== CRIAÇÃO DA TELA DO JOGO (Executada apenas UMA vez) =====
function renderGame() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <div id="quiz-screen" class="glass">
            <div class="header" style="padding: 0;">
                <div class="header-left glass" onclick="renderHome()" style="width: 40px; height: 40px; font-size: 1rem; cursor: pointer;">‹</div>
                <div class="header-center" style="font-size: 1rem;">Jogando</div>
                <div class="header-right glass" style="width: 40px; height: 40px; font-size: 1rem;">⏱️</div>
            </div>

            <div class="game-stats glass">
                <div><span style="font-size:0.7rem; opacity:0.6;">Vidas</span><br><span id="lives">❤️❤️❤️</span></div>
                <div><span style="font-size:0.7rem; opacity:0.6;">Pontos</span><br><span id="score" style="color:#f5a623; font-weight:bold;">0</span></div>
                <div><span style="font-size:0.7rem; opacity:0.6;">Tempo</span><br><span id="timer" style="color:#fff;">30</span></div>
            </div>

            <div class="power-ups">
                <button class="power-btn glass" onclick="usePowerUp('fifty')" id="fiftyBtn">🎯 50/50 (<span id="fiftyCount">3</span>)</button>
                <button class="power-btn glass" onclick="usePowerUp('skip')" id="skipBtn">⏭️ Pular (<span id="skipCount">2</span>)</button>
                <button class="power-btn glass" onclick="usePowerUp('extraTime')" id="extraTimeBtn" style="grid-column: 1 / -1;">⏰ +10s (<span id="extraTimeCount">1</span>)</button>
            </div>

            <div id="questionArea" class="glass">
                <div class="category-badge" id="category" style="font-size:0.8rem; color:#f5a623; margin-bottom:5px;"></div>
                <div class="question" id="question" style="font-size:1.2rem; font-weight:600; margin-bottom:20px; line-height:1.4;"></div>
                <div class="options" id="options" style="display:grid; grid-template-columns:1fr 1fr; gap:10px;"></div>
            </div>

            <div id="feedback" style="text-align:center; min-height:40px;"></div>
            <div id="nextButton" style="display:flex; justify-content:center;"></div>
        </div>
    `;
}

// ===== INICIAR O JOGO =====
function startGame() {
    const shuffled = [...questionBank].sort(() => Math.random() - 0.5);
    gameState.questions = shuffled.slice(0, gameState.totalQuestions);
    gameState.currentIndex = 0;
    gameState.score = 0;
    gameState.lives = 3;
    gameState.correctCount = 0;
    gameState.timer = 30;
    gameState.isActive = true;
    gameState.powerUps = { fifty: isPremium ? 5 : 3, skip: isPremium ? 3 : 2, extraTime: isPremium ? 3 : 1 };
    
    renderGame();      // Cria a UI do jogo 1 vez
    loadQuestion();    // Preenche a pergunta atual
    startTimer();      // Inicia o cronômetro
}

// ===== CARREGAR PERGUNTA =====
function loadQuestion() {
    if (gameState.currentIndex >= gameState.questions.length) { endGame(true); return; }
    const q = gameState.questions[gameState.currentIndex];
    document.getElementById('category').textContent = q.category;
    document.getElementById('question').textContent = q.question;
    
    const optionsDiv = document.getElementById('options');
    optionsDiv.innerHTML = '';
    q.options.forEach((option, index) => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.textContent = `${String.fromCharCode(65 + index)}) ${option}`;
        btn.onclick = () => selectAnswer(index);
        btn.id = `option-${index}`;
        optionsDiv.appendChild(btn);
    });
    
    document.getElementById('feedback').innerHTML = '';
    document.getElementById('nextButton').innerHTML = '';
    updateStats();
}

// ===== SELECIONAR RESPOSTA =====
function selectAnswer(index) {
    if (!gameState.isActive) return;
    gameState.isActive = false;
    clearInterval(window.timerInterval);
    const q = gameState.questions[gameState.currentIndex];
    const isCorrect = index === q.correct;
    document.getElementById(`option-${q.correct}`).classList.add('correct');
    if (!isCorrect) { document.getElementById(`option-${index}`).classList.add('wrong'); }
    document.querySelectorAll('.option-btn').forEach(btn => btn.disabled = true);
    
    if (isCorrect) {
        gameState.score += getPoints(q.difficulty);
        gameState.correctCount++;
        userProgress.coins += 10;
        saveProgress();
    } else {
        gameState.lives--;
    }
    const feedback = document.getElementById('feedback');
    if (isCorrect) {
        feedback.innerHTML = `<div class="feedback correct"><strong>✅ Correto!</strong><br>${q.explanation}</div>`;
    } else {
        feedback.innerHTML = `<div class="feedback wrong"><strong>❌ Errado!</strong><br>${q.explanation}</div>`;
    }
    updateStats();
    if (gameState.lives <= 0) {
        setTimeout(() => endGame(false), 2000);
    } else {
        document.getElementById('nextButton').innerHTML = `<button class="next-btn" onclick="nextQuestion()">Próxima Pergunta →</button>`;
    }
}

// ===== PRÓXIMA PERGUNTA (CORRIGIDO, NÃO RECRIA O DOM) =====
function nextQuestion() {
    gameState.currentIndex++;
    gameState.isActive = true;
    gameState.timer = 30;
    clearInterval(window.timerInterval); // Garante que o timer antigo morra antes de recomeçar
    loadQuestion(); // Atualiza APENAS os textos e botões, sem deletar a tela
    startTimer();   // Reinicia o cronômetro
}

// ===== TIMER =====
function startTimer() {
    clearInterval(window.timerInterval);
    gameState.timer = 30;
    document.getElementById('timer').textContent = gameState.timer;
    window.timerInterval = setInterval(() => {
        gameState.timer--;
        const timerEl = document.getElementById('timer');
        if (timerEl) timerEl.textContent = gameState.timer;
        if (gameState.timer <= 0) {
            clearInterval(window.timerInterval);
            timeUp();
        }
    }, 1000);
}

function timeUp() {
    if (!gameState.isActive) return;
    gameState.isActive = false;
    gameState.lives--;
    const q = gameState.questions[gameState.currentIndex];
    document.getElementById(`option-${q.correct}`).classList.add('correct');
    document.querySelectorAll('.option-btn').forEach(btn => btn.disabled = true);
    document.getElementById('feedback').innerHTML = `<div class="feedback wrong"><strong>⏰ Tempo esgotado!</strong></div>`;
    updateStats();
    if (gameState.lives <= 0) {
        setTimeout(() => endGame(false), 2000);
    } else {
        document.getElementById('nextButton').innerHTML = `<button class="next-btn" onclick="nextQuestion()">Próxima Pergunta →</button>`;
    }
}

// ===== POWER UPS =====
function usePowerUp(type) {
    if (!gameState.isActive) return;
    if (type === 'fifty' && gameState.powerUps.fifty > 0) {
        gameState.powerUps.fifty--;
        const q = gameState.questions[gameState.currentIndex];
        const wrongIndexes = q.options.map((_, i) => i).filter(i => i !== q.correct);
        const toRemove = wrongIndexes.sort(() => Math.random() - 0.5).slice(0, 2);
        toRemove.forEach(i => { const btn = document.getElementById(`option-${i}`); if (btn) btn.style.display = 'none'; });
        updatePowerUpButtons();
    }
    if (type === 'skip' && gameState.powerUps.skip > 0) {
        gameState.powerUps.skip--;
        clearInterval(window.timerInterval);
        nextQuestion();
    }
    if (type === 'extraTime' && gameState.powerUps.extraTime > 0) {
        gameState.powerUps.extraTime--;
        gameState.timer += 10;
        document.getElementById('timer').textContent = gameState.timer;
        updatePowerUpButtons();
    }
}

function updatePowerUpButtons() {
    if(document.getElementById('fiftyCount')) {
        document.getElementById('fiftyCount').textContent = gameState.powerUps.fifty;
        document.getElementById('skipCount').textContent = gameState.powerUps.skip;
        document.getElementById('extraTimeCount').textContent = gameState.powerUps.extraTime;
        document.getElementById('fiftyBtn').disabled = gameState.powerUps.fifty <= 0;
        document.getElementById('skipBtn').disabled = gameState.powerUps.skip <= 0;
        document.getElementById('extraTimeBtn').disabled = gameState.powerUps.extraTime <= 0;
    }
}

// ===== SISTEMA DE PONTUAÇÃO =====
function getPoints(difficulty) {
    const points = { 'fácil': 10, 'médio': 20, 'difícil': 30 };
    const multiplier = isPremium ? 2 : 1;
    return (points[difficulty] || 10) * multiplier;
}

function updateStats() {
    document.getElementById('lives').textContent = '❤️'.repeat(gameState.lives) + '🖤'.repeat(3 - gameState.lives);
    document.getElementById('score').textContent = gameState.score;
}

function saveProgress() {
    localStorage.setItem('trivia_coins', userProgress.coins);
    localStorage.setItem('trivia_highscore', userProgress.highScore);
    localStorage.setItem('trivia_games', userProgress.gamesPlayed);
}

// ===== FIM DE JOGO =====
function endGame(completed) {
    clearInterval(window.timerInterval);
    gameState.isActive = false;
    if (gameState.score > userProgress.highScore) userProgress.highScore = gameState.score;
    userProgress.gamesPlayed++;
    userProgress.coins += gameState.correctCount * 5;
    saveProgress();
    
    const accuracy = gameState.totalQuestions > 0 ? ((gameState.correctCount / gameState.totalQuestions) * 100).toFixed(1) : 0;
    const emoji = accuracy >= 80 ? '🏆' : accuracy >= 50 ? '👍' : '💪';
    
    document.getElementById('app').innerHTML = `
        <div class="glass" style="padding: 24px; max-width: 480px; width: 100%; margin: 0 auto; text-align: center;">
            <div style="font-size: 4rem; margin: 20px 0;">${emoji}</div>
            <h1 style="color: #fff;">Fim de Jogo!</h1>
            <div style="font-size: 4rem; font-weight: bold; color: #f5a623; margin: 20px 0;">${gameState.score}</div>
            <div style="color: #999; font-size: 1rem; margin-bottom: 20px;">pontos</div>
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin: 25px 0;">
                <div class="glass" style="padding: 15px;"><div style="font-size:0.8rem; color:#999;">Acertos</div><div style="font-size:2rem; font-weight:bold; color:#f5a623;">${gameState.correctCount}/${gameState.totalQuestions}</div></div>
                <div class="glass" style="padding: 15px;"><div style="font-size:0.8rem; color:#999;">Precisão</div><div style="font-size:2rem; font-weight:bold; color:#f5a623;">${accuracy}%</div></div>
                <div class="glass" style="padding: 15px;"><div style="font-size:0.8rem; color:#999;">Recorde</div><div style="font-size:2rem; font-weight:bold; color:#f5a623;">${userProgress.highScore}</div></div>
            </div>
            <div style="margin: 20px 0; color: #fff;">🪙 Moedas ganhas: <strong>${gameState.correctCount * 5}</strong></div>
            <button onclick="renderHome()" style="padding: 15px 30px; background: linear-gradient(135deg, #f5a623, #f7c948); color: #000; border: none; border-radius: 16px; font-weight: bold; cursor: pointer;">🏠 Voltar ao Início</button>
        </div>
    `;
}

function shareScore() {
    const text = `🎯 Fiz ${gameState.score} pontos! Consegue me superar?`;
    if (navigator.share) {
        navigator.share({ title: 'Jogo de Trivia', text: text, url: window.location.href }).catch(() => {});
    } else {
        navigator.clipboard.writeText(text + ' ' + window.location.href)
            .then(() => alert('📋 Link copiado!'))
            .catch(() => {});
    }
}

// ===== INICIALIZA =====
renderHome();