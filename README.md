# Vuca Chamados

Extensão para Chromium que adiciona uma sidebar de chamados do CRM Vuca ao lado do chat do Sendi.

A extensão identifica a instância da unidade no nome do contato da conversa, consulta os chamados no CRM e exibe os dados no próprio Sendi, sem precisar alternar de aba.

## Recursos

- Sidebar fixa à direita do chat do Sendi.
- Extração automática da instância a partir do nome do contato.
- Busca automática ao trocar de conversa, com cache de 60 segundos.
- Botão para atualizar a listagem manualmente.
- Campo de instância editável, para contatos sem o formato esperado.
- Visual baseado no Min Theme, com tema claro ou escuro (na primeira abertura, segue o modo atual do Sendi).
- Navegação lateral com três abas: **Chamados**, **Instâncias** e **Configurações**.
- Importação de um arquivo HTML com todas as unidades do Vuca, usado como base da verificação de instâncias.
- Painel recolhível para uma aba lateral.
- Links dos chamados abrem diretamente no CRM.
- Ícone da extensão abre ou foca a aba do Sendi.

Cada chamado exibe:

- Número do chamado, com link para o CRM.
- Status atual.
- Data de criação.
- Funcionalidade.
- Tipo.

## Requisitos

- Chromium, Google Chrome ou Microsoft Edge baseado em Chromium.
- Chrome 111 ou superior.
- Acesso autenticado ao CRM Vuca.

## Instalação

1. Baixe ou clone este repositório.
2. Abra `chrome://extensions` no navegador.
3. Ative o **Modo do desenvolvedor**.
4. Clique em **Carregar sem compactação**.
5. Selecione a pasta do projeto, onde está o arquivo `manifest.json`.
6. Abra ou recarregue `https://suportevuca.sendi.chat/chat`.

> Após instalar ou atualizar a extensão, recarregue a aba do Sendi para que o content script seja injetado novamente.

## Uso

1. Abra uma conversa no Sendi.
2. A extensão lê o nome do contato e preenche o campo **Instância**.
3. Se o painel estiver aberto, a busca é feita automaticamente.
4. Use **Buscar** para forçar uma atualização.
5. Clique no número do chamado para abri-lo no CRM.
6. Em **Configurações**, escolha o tema (Claro ou Escuro) e envie o arquivo HTML com as unidades do Vuca.
7. A aba **Instâncias** lista as instâncias da base importada, cada uma com suas unidades. O campo **Buscar unidade** filtra pelo nome da unidade ou da instância (sem diferenciar acentos e maiúsculas).
8. Use o botão de fechar, no fim da barra lateral, para recolher a sidebar; a aba **Chamados** permite reabri-la.

### Formato da instância

A instância é a segunda parte do nome do contato, separada por hífen:

| Nome do contato | Instância |
| --- | --- |
| `Gabriella - universopark` | `universopark` |
| `Gabriella-universopark` | `universopark` |
| `Gabriella - Universo Park - 2` | `Universo Park` |
| `Gabriella` | Não identificada |

Se a instância não for identificada, preencha o campo manualmente e clique em **Buscar**.

## Como funciona

1. O `content.js` é injetado nas páginas do Sendi e cria a sidebar dentro de um Shadow DOM, evitando conflito com os estilos da aplicação.
2. O nome do contato é lido do cabeçalho do atendimento no Sendi.
3. A instância é extraída da segunda parte do nome, separada por hífen.
4. O `background.js` consulta:
   `https://crm.vucasolution.com.br/pg_chamados.php?instancia=<instancia>`
5. A consulta usa os cookies existentes do CRM.
6. Se o service worker não conseguir autenticar, a extensão tenta buscar pela aba do CRM já aberta.
7. O `parser.js` interpreta a tabela do CRM pelos cabeçalhos e extrai os chamados.
8. A sidebar renderiza os chamados e monta os links no formato:
   `https://crm.vucasolution.com.br/pg_chamados.php?form=1&edita=<numero>`

### Autenticação e Cloudflare

A extensão não solicita nem armazena usuário e senha. Ela reutiliza a sessão existente do CRM.

Se aparecer a mensagem de acesso ao CRM ou de verificação do Cloudflare:

1. Abra o CRM pelo botão **Abrir CRM** exibido no aviso.
2. Faça login, se necessário.
3. Conclua a verificação do Cloudflare, se aparecer.
4. Mantenha a aba do CRM aberta.
5. Volte ao Sendi e clique em **Tentar novamente**.

## Permissões

| Permissão | Motivo |
| --- | --- |
| `storage` | Salvar o tema, a aba ativa, o estado aberto/fechado do painel e a base de unidades. |
| `unlimitedStorage` | Permitir bases de unidades maiores que a cota padrão de 10 MB. |
| `scripting` | Executar a busca de fallback dentro de uma aba autenticada do CRM. |
| `https://suportevuca.sendi.chat/*` | Ler o contato atual e injetar a sidebar. |
| `https://crm.vucasolution.com.br/*` | Consultar a listagem de chamados do CRM. |

A extensão não envia dados para serviços de terceiros e não possui analytics.

## Estrutura do projeto

```text
vuca-chamados/
├── manifest.json     # Configuração da extensão MV3
├── background.js     # Busca no CRM e fallback pela aba autenticada
├── parser.js         # Extração da instância, tabela do CRM e base de unidades
├── content.js        # Sidebar, detecção do contato e renderização
├── sidebar.css       # Estilos dos temas claro e escuro
└── icons/            # Ícones da extensão
    ├── icon16.png
    ├── icon32.png
    ├── icon48.png
    └── icon128.png
```

## Desenvolvimento

O projeto não possui etapa de build nem dependências de runtime. Os arquivos são carregados diretamente pelo Chromium.

Após alterar qualquer arquivo:

1. Abra `chrome://extensions`.
2. Clique em **Recarregar** na extensão.
3. Recarregue a aba do Sendi.

Verificação de sintaxe:

```bash
node --check background.js
node --check parser.js
node --check content.js
```

Validação do manifesto:

```bash
python3 -m json.tool manifest.json
```

### Base de unidades

Em **Configurações › Base de unidades**, envie um arquivo `.html`/`.htm` (até 25 MB). O `parser.parseUnits` usa a maior tabela do documento e salva em `chrome.storage.local` (chave `vcUnitsDb`):

- `headers`: cabeçalhos da tabela;
- `rows`: texto de cada célula, por linha;
- `instanceColumn` / `nameColumn` / `idColumn`: índice das colunas de instância, nome e ID da unidade (`-1` se não reconhecidas).

No export do Vuca Solution Administration, a instância é a coluna **Vuca Name** e o nome da unidade é **Título**. Outros nomes de coluna reconhecidos estão em `UNIT_INSTANCE_ALIASES` e `UNIT_NAME_ALIASES` no `parser.js`. A listagem é montada em lotes de 60 instâncias conforme a lista rola.

### Pontos de manutenção

- Se o CRM alterar os cabeçalhos da tabela, ajuste os aliases em `COLUMN_ALIASES` no `parser.js`.
- Se o Sendi alterar a estrutura do cabeçalho do contato, ajuste os seletores em `pickContactName` no `content.js`.
- Se o CRM mudar a regra de autenticação ou de Cloudflare, ajuste a classificação em `background.js`.

## Limitações

- É necessário ter acesso autenticado ao CRM Vuca.
- O nome do contato precisa conter a instância após um hífen para o preenchimento automático.
- A sidebar sobrepõe o lado direito do Sendi; ela não redimensiona o layout da aplicação.
- A leitura dos chamados depende da estrutura HTML atual do CRM.
- Se o navegador bloquear cookies de terceiros no service worker, mantenha uma aba autenticada do CRM aberta para o fallback.

## Solução de problemas

### A sidebar não aparece

- Confirme que está em `https://suportevuca.sendi.chat/chat`.
- Recarregue a página do Sendi.
- Verifique se a extensão está ativa em `chrome://extensions`.
- Verifique se há erros no console da extensão.

### A instância não foi identificada

- Confirme se o nome do contato segue o formato `Nome - instancia`.
- Preencha o campo **Instância** manualmente.
- Clique em **Buscar**.

### A mensagem de login aparece

- Abra o CRM pelo botão **Abrir CRM**.
- Faça login.
- Mantenha a aba do CRM aberta.
- Clique em **Tentar novamente**.

### A verificação do Cloudflare aparece

- Abra o CRM em uma aba.
- Conclua a verificação.
- Volte ao Sendi e tente novamente.

### Nenhum chamado é encontrado

- Confirme se a instância preenchida corresponde à instância cadastrada no CRM.
- Verifique se existem chamados para essa unidade.
- Tente atualizar a listagem pelo botão **Buscar**.
