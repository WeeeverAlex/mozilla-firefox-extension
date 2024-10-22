document.getElementById('checkButton').addEventListener('click', function() {
    console.log("Botão clicado. Enviando mensagem para verificar o site.");
    
    // Enviar mensagem para o background.js para verificar o site
    chrome.runtime.sendMessage({action: "checkSite"}, function(response) {
        if (response) {
            console.log("Resposta recebida: ", response);
            // Exibir os resultados no popup
            let resultsDiv = document.getElementById('results');
            resultsDiv.innerHTML = `
              <p>Cookies detectados: ${response.cookies}</p>
              <p>Conexões de terceiros: ${response.thirdPartyConnections}</p>
              <p>Itens no LocalStorage: ${response.localStorageItems}</p>
              <p>Canvas Fingerprinting detectado: ${response.canvasFingerprinting ? 'Sim' : 'Não'}</p>
              <p>Hooks detectados: ${response.hooksDetected.length > 0 ? response.hooksDetected.join(', ') : 'Nenhum'}</p>
              <p>Pontuação de Privacidade: ${response.privacyScore}</p>
            `;
        } else {
            console.error('Nenhuma resposta recebida.');
        }
    });
});
