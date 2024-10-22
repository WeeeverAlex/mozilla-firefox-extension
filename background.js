// Função para calcular a pontuação de privacidade
function calcularPontuacao(cookies, localStorageItems, thirdPartyConnections) {
    let score = 10;
    if (thirdPartyConnections > 0) score -= thirdPartyConnections;
    if (cookies.length > 5) score -= 2;
    if (localStorageItems > 0) score -= 1;
    return Math.max(score, 0); // Pontuação mínima 0
}

// Listener para escutar a mensagem do popup.js
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "checkSite") {
        console.log("Recebida solicitação para verificar o site.");

        // Se o sender.tab estiver indefinido, buscamos a aba ativa
        if (sender.tab && sender.tab.id) {
            console.log("Usando sender.tab.id:", sender.tab.id);
            verificarSite(sender.tab.id, sendResponse);
        } else {
            console.log("sender.tab não definido. Buscando aba ativa...");
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                if (tabs.length > 0) {
                    console.log("Aba ativa encontrada:", tabs[0].id);
                    verificarSite(tabs[0].id, sendResponse);
                } else {
                    console.error("Nenhuma aba ativa encontrada.");
                    sendResponse(null); // Envia uma resposta nula se não encontrar aba
                }
            });
        }
        return true; // Indica resposta assíncrona
    }
});

// Função para verificar cookies, LocalStorage, conexões de terceiros, Canvas Fingerprinting e Hooks
function verificarSite(tabId, sendResponse) {
    console.log("Verificando cookies, conexões de terceiros e LocalStorage na aba:", tabId);

    // Coleta de cookies
    chrome.cookies.getAll({}, function(cookies) {
        console.log("Cookies detectados: ", cookies.length);
        let thirdPartyConnections = 0;
        let localStorageItems = 0;

        // Coleta de LocalStorage
        chrome.tabs.executeScript(tabId, {
            code: 'Object.keys(localStorage)'
        }, function(results) {
            if (results && results[0]) {
                localStorageItems = results[0].length;
                console.log("Itens no LocalStorage: ", localStorageItems);
            }

            // Função de callback para lidar com as conexões de terceiros
            function contarConexoes(details) {
                let url = new URL(details.url);
                if (url.hostname !== window.location.hostname) {
                    thirdPartyConnections++;
                }
                console.log("Conexões de terceiros detectadas: ", thirdPartyConnections);
            }

            // Coleta de conexões de terceiros
            chrome.webRequest.onBeforeRequest.addListener(contarConexoes, {urls: ["<all_urls>"]});

            // Calcula a pontuação de privacidade
            let privacyScore = calcularPontuacao(cookies, localStorageItems, thirdPartyConnections);
            console.log("Pontuação de privacidade calculada: ", privacyScore);

            // Detecção de Canvas Fingerprinting e Hooks
            detectarCanvasFingerprinting(tabId, function(canvasDetected) {
                detectarHooks(tabId, function(hooksDetected) {
                    // Remover o listener para garantir que ele não rode em loop
                    chrome.webRequest.onBeforeRequest.removeListener(contarConexoes);

                    // Envia os dados de volta ao popup.js
                    sendResponse({
                        cookies: cookies.length,
                        thirdPartyConnections: thirdPartyConnections,
                        localStorageItems: localStorageItems,
                        privacyScore: privacyScore,
                        canvasFingerprinting: canvasDetected,
                        hooksDetected: hooksDetected
                    });
                });
            });
        });
    });
}

// Função para detectar Canvas Fingerprinting
function detectarCanvasFingerprinting(tabId, callback) {
    chrome.tabs.executeScript(tabId, {
        code: `
            (function() {
                let canvasFingerprinted = false;

                // Sobrescrever métodos suspeitos
                const originalToDataURL = HTMLCanvasElement.prototype.toDataURL;
                HTMLCanvasElement.prototype.toDataURL = function() {
                    canvasFingerprinted = true;
                    console.log("Canvas Fingerprinting detectado: toDataURL foi chamado.");
                    return originalToDataURL.apply(this, arguments);
                };

                const originalGetImageData = CanvasRenderingContext2D.prototype.getImageData;
                CanvasRenderingContext2D.prototype.getImageData = function() {
                    canvasFingerprinted = true;
                    console.log("Canvas Fingerprinting detectado: getImageData foi chamado.");
                    return originalGetImageData.apply(this, arguments);
                };

                // Retornar se o canvas foi fingerprinted após 5 segundos
                setTimeout(() => {
                    chrome.runtime.sendMessage({
                        action: "canvasFingerprintingDetected",
                        fingerprinting: canvasFingerprinted
                    });
                }, 5000);
            })();
        `
    }, function() {
        chrome.runtime.onMessage.addListener(function(request) {
            if (request.action === "canvasFingerprintingDetected") {
                callback(request.fingerprinting);
            }
        });
    });
}

// Função para detectar hooks (substituições de funções críticas)
function detectarHooks(tabId, callback) {
    chrome.tabs.executeScript(tabId, {
        code: `
            (function() {
                let hooksDetectados = [];

                // Verificar se as funções críticas foram sobrescritas
                const originalAlert = window.alert;
                if (window.alert !== originalAlert) hooksDetectados.push('alert');

                const originalOpen = window.open;
                if (window.open !== originalOpen) hooksDetectados.push('open');

                const originalFetch = window.fetch;
                if (window.fetch !== originalFetch) hooksDetectados.push('fetch');

                console.log("Hooks detectados:", hooksDetectados);
                return hooksDetectados;
            })();
        `
    }, function(results) {
        callback(results[0]);
    });
}
