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
            verificarSite(sender.tab.id, sendResponse);
        } else {
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                if (tabs.length > 0) {
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

// Função para verificar cookies, LocalStorage e conexões de terceiros
function verificarSite(tabId, sendResponse) {
    console.log("Verificando cookies, conexões de terceiros e LocalStorage...");
    
    // Coleta de cookies
    chrome.cookies.getAll({}, function(cookies) {
        console.log("Cookies detectados: ", cookies.length);
        let thirdPartyConnections = 0;
        let localStorageItems = 0;

        // Coleta de LocalStorage
        chrome.tabs.executeScript(tabId, {
            code: 'Object.keys(localStorage)'
        }, function(results) {
            localStorageItems = results[0].length;
            console.log("Itens no LocalStorage: ", localStorageItems);

            // Coleta de conexões de terceiros
            chrome.webRequest.onBeforeRequest.addListener(
                function(details) {
                    let url = new URL(details.url);
                    if (url.hostname !== window.location.hostname) {
                        thirdPartyConnections++;
                    }
                    console.log("Conexões de terceiros detectadas: ", thirdPartyConnections);

                    // Calcula a pontuação de privacidade
                    let privacyScore = calcularPontuacao(cookies, localStorageItems, thirdPartyConnections);
                    console.log("Pontuação de privacidade calculada: ", privacyScore);

                    // Envia os dados de volta ao popup.js
                    sendResponse({
                        cookies: cookies.length,
                        thirdPartyConnections: thirdPartyConnections,
                        localStorageItems: localStorageItems,
                        privacyScore: privacyScore
                    });
                },
                {urls: ["<all_urls>"]}
            );
        });
    });
}
