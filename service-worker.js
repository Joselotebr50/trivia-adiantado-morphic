// Service Worker para PWA - Funciona OFFLINE!

const CACHE_NAME = 'trivia-game-v2';
const ASSETS_TO_CACHE = [
    '/',
    'index.html',
    'style.css',
    'game.js',
    'manifest.json',
    'https://via.placeholder.com/192/667eea/white?text=T',
    'https://via.placeholder.com/512/667eea/white?text=T'
];

// Instalar Service Worker
self.addEventListener('install', (event) => {
    console.log('📦 Instalando PWA...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('✅ Cache aberto');
                return cache.addAll(ASSETS_TO_CACHE);
            })
            .then(() => self.skipWaiting())
    );
});

// Ativar Service Worker
self.addEventListener('activate', (event) => {
    console.log('🎯 PWA Ativado!');
    
    // Limpar caches antigos
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => caches.delete(name))
            );
        })
    );
});

// Interceptar requisições (funciona offline!)
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => {
                // Retorna do cache se existir
                if (cachedResponse) {
                    return cachedResponse;
                }
                
                // Busca da rede
                return fetch(event.request)
                    .then((response) => {
                        // Não cachear APIs ou requisições dinâmicas
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }
                        
                        // Clonar e cachear
                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });
                        
                        return response;
                    })
                    .catch(() => {
                        // Se falhar, tenta retornar página offline
                        if (event.request.mode === 'navigate') {
                            return caches.match('index.html');
                        }
                    });
            })
    );
});

// Push Notifications (opcional)
self.addEventListener('push', (event) => {
    const options = {
        body: event.data ? event.data.text() : 'Nova pergunta disponível!',
        icon: 'https://via.placeholder.com/192/667eea/white?text=T',
        badge: 'https://via.placeholder.com/72/667eea/white?text=T',
        vibrate: [200, 100, 200],
        tag: 'trivia-notification',
        renotify: true,
        actions: [
            { action: 'play', title: '🎮 Jogar Agora' },
            { action: 'close', title: 'Fechar' }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification('🎯 Jogo de Trivia', options)
    );
});

// Clique na notificação
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    if (event.action === 'play') {
        clients.openWindow('/');
    }
});