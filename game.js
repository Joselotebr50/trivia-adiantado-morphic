// ============================================
// JOGO DE TRIVIA - VISUAL GLASSMORPHIC
// ============================================

// Remover loading
window.addEventListener('load', () => {
    setTimeout(() => {
        const loading = document.getElementById('loading-screen');
        if (loading) loading.style.display = 'none';
    }, 500);
});

let gameState = { /* MANTENHA O SEU ESTADO AQUI */
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

// ===== RENDERIZAR TELA INICIAL (MENU GLASS) =====
function renderHome() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <!-- HEADER -->
        <div class="header">
            <div class="header-left glass">☰</div>
            <div class="header-center">Trivia<span>Box</span></div>
            <div class="header-right glass">🔔</div>
        </div>

        <!-- HERO BANNER -->
        <div class="hero-banner glass">
            <div class="hero-text">
                <h2>Bom dia, <span>Jogador(a)!</span> 👋</h2>
                <h3>Que tal um<br>Desafio hoje?</h3>
                <p>Teste seus conhecimentos e suba no ranking.</p>
                <div class="hero-dots">
                    <span class="active"></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
            <!-- IMAGEM 02 (Cérebro com troféu) -->
            <div class="hero-image" style="background-image: url('./images/02.png');"></div>
        </div>

        <!-- SEARCH BAR -->
        <div class="search-bar glass">
            🔍 <input type="text" placeholder="Buscar quizzes, temas e mais...">
            <span>⚙️</span>
        </div>

        <!-- MENU GRID -->
        <div class="menu-grid">
            <div class="menu-card glass" onclick="startGame('rapido')">
                <div class="icon-circle icon-yellow">⚡</div>
                <h4>Rápido</h4>
                <p>Quiz de 10 perguntas</p>
                <div class="arrow-btn">›</div>
            </div>
            <div class="menu-card glass" onclick="startGame('desafio')">
                <div class="icon-circle icon-pink">🏆</div>
                <h4>Desafio</h4>
                <p>Modo sobrevivência</p>
                <div class="arrow-btn">›</div>
            </div>
            <div class="menu-card glass" onclick="alert('Categorias em breve!')">
                <div class="icon-circle icon-purple">📚</div>
                <h4>Categorias</h4>
                <p>Navegue por temas</p>
                <div class="arrow-btn">›</div>
            </div>
            <div class="menu-card glass" onclick="alert('Ranking em breve!')">
                <div class="icon-circle icon-blue">📊</div>
                <h4>Ranking</h4>
                <p>Veja sua posição</p>
                <div class="arrow-btn">›</div>
            </div>
            <div class="menu-card glass" onclick="alert('Modo Duo em breve!')">
                <div class="icon-circle icon-teal">🤝</div>
                <h4>Modo Duo</h4>
                <p>Jogue com amigos</p>
                <div class="arrow-btn">›</div>
            </div>
            <div class="menu-card glass" onclick="alert('Recompensas em breve!')">
                <div class="icon-circle icon-orange">🎁</div>
                <h4>Recompensas</h4>
                <p>Troque suas moedas</p>
                <div class="arrow-btn">›</div>
            </div>
        </div>

        <!-- RECENT QUIZZES -->
        <div>
            <div class="section-header">
                <div>⏰ Quizzes Recentes</div>
                <span>Ver todos ›</span>
            </div>
            <div class="recents-scroll">
                <!-- IMAGEM 03 (História) -->
                <div class="recent-card glass">
                    <div class="recent-img" style="background-image: url('./images/03.png');"></div>
                    <h4>História do Brasil</h4>
                    <div class="info"><span>⭐ 4.8</span><span>20 min</span></div>
                </div>
                <!-- IMAGEM 04 (Ciência) -->
                <div class="recent-card glass">
                    <div class="recent-img" style="background-image: url('./images/04.jpg');"></div>
                    <h4>Ciência Geral</h4>
                    <div class="info"><span>⭐ 4.9</span><span>15 min</span></div>
                </div>
                <!-- IMAGEM 05 (Cinema) -->
                <div class="recent-card glass">
                    <div class="recent-img" style="background-image: url('./images/05.jpg');"></div>
                    <h4>Cinema & TV</h4>
                    <div class="info"><span>⭐ 4.7</span><span>10 min</span></div>
                </div>
            </div>
        </div>

        <!-- BOTTOM NAV -->
        <div class="bottom-nav glass">
            <div class="nav-item active">🏠<br>Início</div>
            <div class="nav-item">📖<br>Quizzes</div>
            <div class="nav-center-wrapper">
                <div class="nav-center-btn" onclick="startGame('rapido')">🎯</div>
            </div>
            <div class="nav-item">📊<br>Ranking</div>
            <div class="nav-item">👤<br>Perfil</div>
        </div>
    `;
}
// ===== RENDERIZAR TELA DE JOGO (TELA ESCURA COM VIDRO) =====
function renderGameScreen() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <div id="quiz-screen" class="glass" style="padding: 20px; display:flex; flex-direction:column; gap: 15px;">
            <div class="header" style="padding: 0;">
                <div class="header-left glass" onclick="renderHome()" style="width: 40px; height: 40px; font-size: 1rem;">‹</div>
                <div class="header-center" style="font-size: 1rem;">Jogando</div>
                <div class="header-right glass" style="width: 40px; height: 40px; font-size: 1rem;">⏱️</div>
            </div>

            <div class="game-stats glass" style="padding: 15px; display:grid; grid-template-columns: 1fr 1fr 1fr; text-align:center;">
                <div><span style="font-size:0.7rem; opacity:0.6;">Vidas</span><br><span id="lives">❤️❤️❤️</span></div>
                <div><span style="font-size:0.7rem; opacity:0.6;">Pontos</span><br><span id="score" style="color:#f5a623; font-weight:bold;">0</span></div>
                <div><span style="font-size:0.7rem; opacity:0.6;">Pergunta</span><br><span id="current-q" style="color:#fff;">1/10</span></div>
            </div>

            <div class="power-ups" style="display:flex; gap:10px; justify-content:center;">
                <button class="glass" style="padding: 8px 15px; border:none; color:#fff; cursor:pointer;" onclick="usePowerUp('fifty')">🎯 50/50</button>
                <button class="glass" style="padding: 8px 15px; border:none; color:#fff; cursor:pointer;" onclick="usePowerUp('skip')">⏭️ Pular</button>
                <button class="glass" style="padding: 8px 15px; border:none; color:#fff; cursor:pointer;" onclick="usePowerUp('extraTime')">⏰ +10s</button>
            </div>

            <div id="questionArea" class="glass" style="padding: 20px;">
                <div id="category" style="font-size:0.8rem; color:#f5a623; margin-bottom:5px;"></div>
                <div id="question" style="font-size:1.2rem; font-weight:600; margin-bottom:20px; line-height:1.4;"></div>
                <div id="options" style="display:grid; grid-template-columns:1fr 1fr; gap:10px;"></div>
            </div>

            <div id="feedback" style="text-align:center; min-height:40px;"></div>
            <div id="nextButton" style="display:flex; justify-content:center;"></div>
        </div>
    `;
    loadQuestion();
    startTimer();
}

// ===== INICIAR O JOGO =====
function startGame(mode) {
    // Sua lógica de preparar perguntas
    const shuffled = [...questionBank].sort(() => Math.random() - 0.5);
    gameState.questions = shuffled.slice(0, gameState.totalQuestions);
    gameState.currentIndex = 0;
    gameState.score = 0;
    gameState.lives = 3;
    gameState.correctCount = 0;
    gameState.timer = 30;
    gameState.isActive = true;

    renderGameScreen();
}

// ===== CARREGAR PERGUNTA (ADAPTADO PARA O NOVO CSS) =====
function loadQuestion() {
    if (gameState.currentIndex >= gameState.questions.length) {
        endGame(true);
        return;
    }

    const q = gameState.questions[gameState.currentIndex];
    document.getElementById('category').textContent = `# ${q.category}`;
    document.getElementById('question').textContent = q.question;
    document.getElementById('current-q').textContent = `${gameState.currentIndex + 1}/${gameState.totalQuestions}`;

    const optionsDiv = document.getElementById('options');
    optionsDiv.innerHTML = '';
    q.options.forEach((option, index) => {
        const btn = document.createElement('button');
        btn.className = 'glass'; // Aplica o efeito vidro nos botões de resposta
        btn.style.cssText = 'padding: 15px; border:none; color:#fff; text-align:left; cursor:pointer; transition: 0.3s;';
        btn.textContent = `${String.fromCharCode(65 + index)}) ${option}`;
        btn.onclick = () => selectAnswer(index);
        btn.id = `option-${index}`;
        optionsDiv.appendChild(btn);
    });

    document.getElementById('feedback').innerHTML = '';
    document.getElementById('nextButton').innerHTML = '';
    
    updateStats();
}

// ===== AS DEMAIS FUNÇÕES (selectAnswer, timer, power-ups) CONTINUAM IGUAIS =====
// MAS VOCÊ PRECISA ATUALIZAR OS IDs NO DOM, EX: document.getElementById('timer') já existe no renderGameScreen.

// Inicializar na tela Home
renderHome();