
# Privacy Detector - Extensão para Firefox

## Visão Geral

O **Privacy Detector** é uma extensão do navegador Firefox projetada para ajudar os usuários a avaliar os riscos de privacidade dos sites que visitam. Ele detecta e relata vários fatores relevantes para a privacidade, como o número de conexões com terceiros, cookies, uso do LocalStorage, e fornece uma pontuação geral de privacidade com base nesses parâmetros.

### Funcionalidades

- **Detecção de Conexões de Terceiros**: Rastrea e exibe o número de solicitações feitas a domínios de terceiros ao visitar um site.
- **Detecção de Sequestro de Navegador e Hooks**: Irá detectar tentativas potenciais de sequestro do navegador e vulnerabilidades de hooks.
- **Detecção de LocalStorage**: Identifica se o site está armazenando dados usando o LocalStorage HTML5.
- **Detecção de Cookies e Supercookies**: Conta o número de cookies e tenta diferenciar entre cookies de primeira e terceira parte, assim como cookies de sessão e persistentes.
- **Detecção de Canvas Fingerprinting**: Irá detectar se o site usa técnicas de canvas fingerprinting para rastrear o usuário.
- **Pontuação de Privacidade**: Fornece uma pontuação geral de privacidade, começando em 10, que diminui com base nos riscos à privacidade.

## Instalação

Para instalar a extensão temporariamente para desenvolvimento:

1. Abra o Firefox e navegue até `about:debugging`.
2. Clique em **Este Firefox** no menu à esquerda.
3. Clique em **Carregar Extensão Temporária...**.
4. Selecione o arquivo `manifest.json` da pasta do seu projeto.
5. A extensão agora aparecerá na barra de ferramentas do navegador.

## Uso

1. Uma vez instalada, clique no ícone do **Privacy Detector** na barra de ferramentas do navegador.
2. Na janela pop-up, clique no botão **Verificar Site Atual**.
3. A extensão irá:
   - Detectar o número de cookies injetados pelo site.
   - Identificar qualquer conexão com terceiros feita pelo site.
   - Detectar o número de itens armazenados no LocalStorage do navegador.
   - Detectar o uso de Canvas Fingerprinting pelo site.
   - Detectar a presença de Hooks.
   - Calcular e exibir a **Pontuação de Privacidade** geral para o site.

## Cálculo da Pontuação de Privacidade

A pontuação de privacidade começa em 10 e diminui com base nos seguintes fatores:

1. **Conexões de Terceiros**: Para cada conexão com terceiros, 1 ponto é deduzido.
2. **Cookies**: Se o site definir mais de 5 cookies, 2 pontos são deduzidos.
3. **Uso de LocalStorage**: Se o site armazenar dados no LocalStorage, 1 ponto é deduzido.

A pontuação final reflete os riscos de privacidade associados ao site e sempre será um valor entre 0 e 10.

### Exemplo de Cálculo

Para um site com:
- **69 cookies** (mais de 5 cookies): -2 pontos
- **1 conexão de terceiros**: -1 ponto
- **7 itens no LocalStorage**: -1 ponto

O cálculo da pontuação seria:
- Pontuação inicial: 10
- Após dedução de cookies: 10 - 2 = 8
- Após dedução de conexão de terceiros: 8 - 1 = 7
- Após dedução de LocalStorage: 7 - 1 = 6

**Pontuação de Privacidade Final: 6**

## Estrutura do Projeto

O projeto consiste nos seguintes arquivos principais:

- **`manifest.json`**: Contém os metadados e permissões da extensão.
- **`background.js`**: O script de plano de fundo que coleta cookies, detecta conexões de terceiros e LocalStorage, além de calcular a pontuação de privacidade.
- **`popup.html`**: O arquivo HTML para a interface pop-up da extensão.
- **`popup.js`**: O script responsável por lidar com a interação do usuário no pop-up, enviando solicitações ao script de plano de fundo e exibindo os resultados.

## Permissões

A extensão requer as seguintes permissões:
- `cookies`: Para detectar e contar os cookies definidos pelos sites.
- `webRequest` e `webRequestBlocking`: Para monitorar solicitações de rede e detectar conexões com terceiros.
- `storage`: Para detectar o uso do LocalStorage.
- `tabs`: Para interagir com as abas do navegador e executar scripts nas páginas ativas.
- `*://*/*`: Para permitir que a extensão funcione em qualquer site.
