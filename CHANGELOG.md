# Changelog — AgroDesign

Todas as mudanças notáveis neste projeto estão documentadas aqui.
Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/).

---

## [2.2.0] — Julho 2026

> Traz para a aba Coleta do Campo a organização que se espera de uma planilha — ordenação por tratamento e
> subamostras por parcela — com o cuidado estatístico de manter a parcela como unidade experimental. Corrige
> um defeito antigo no rodapé de versão e passa a verificar os dois módulos automaticamente antes de cada
> publicação.

### Adicionado
- **Aba Coleta — ordenação das linhas (Campo).** Seletor `↕` com três ordens: **Tratamento → Bloco** (padrão), **Bloco → Tratamento** e **Campo (ID)**, que é a ordem de caminhada pelo croqui. A ordem dos tratamentos é a **declarada por você** no painel — `T2` vem antes de `T10`, e "Controle, Dose 5, Dose 10" sai nessa sequência, não em ordem alfabética. A coluna `#` continua sendo o **ID real da parcela**, então o dado volta para a parcela certa e o CSV segue reimportável. **Os arquivos exportados (CSV/TXT/XLSX) saem na mesma ordem da tela.**
- **Aba Coleta — amostras por parcela (Campo).** Campo `🧪 Amostras/parcela` (1 a 20): escolhendo 4 amostras, cada parcela passa a ocupar 4 linhas, ordenadas **Tratamento → Bloco → Amostra**, com as amostras da mesma parcela agrupadas visualmente. A coluna `Amostra` entra no CSV/TXT/XLSX e é lida de volta na importação — arquivo com mais amostras do que a tela aumenta a tela automaticamente.
  - **A parcela continua sendo a unidade experimental.** Subamostra não é repetição: tratar 4 amostras como 4 repetições infla os graus de liberdade do resíduo e faz o teste F acusar diferença que não existe. Por isso o **Resumo Stat** agrega a média da parcela antes de calcular, e os **scripts R, SAS e Python** passam a **agregar as amostras por parcela antes da ANOVA**, com o **modelo misto** (parcela como efeito aleatório) documentado logo abaixo como alternativa para quem quiser usar a variação dentro da parcela.
  - O **Texto para Publicação** declara as subamostras em PT e EN ("*foram coletadas N amostras, tomadas como subamostras; a média foi utilizada como valor da parcela*").
  - Funciona nos **9 delineamentos** do Campo — DIC, DBC, DQL, Fatorial em DIC/DBC, Parcelas Subdivididas em DIC/DBC, Strip-plot e Látice —, preservando bloco, repetição, fatores e as coordenadas do quadrado latino.
  - **Projetos antigos continuam abrindo normalmente:** a amostra 1 é gravada na mesma chave de sempre, então nada precisa ser migrado.

### Corrigido
- **O rodapé mostrava a versão antiga por até 6 horas depois de uma atualização** (Campo e Lab). O número vinha de uma consulta ao `CHANGELOG.md` guardada em cache por 6 h; agora vem da constante embutida no próprio código, que é o que está de fato rodando. O aviso de "nova versão disponível" não muda — é ele quem detecta atualização no servidor.

### Melhorado
- **Documentação alinhada ao app.** O README (seção "Configurar Supabase" e "Opção 3"), o `PRIVACY.md` ("Camada 3"), o `DATA_INVENTORY.md` e o `TERMS.md` descreviam uma **sincronização em nuvem que nunca existiu** no código — quem seguisse o passo a passo criaria uma tabela no Supabase e não acharia onde configurá-la. A portabilidade entre aparelhos é por arquivo (Exportar ⬇ JSON / 📥 Importar) e agora está documentada como tal, com o aviso que faltava: **não há backup em servidor**, e reinstalar o app marcando "limpar também os dados do navegador" apaga o armazenamento de todos os apps publicados no mesmo endereço.

### Infraestrutura
- **`check.js` — verificação automática antes de publicar.** Roda em dois níveis: estático (sintaxe de todo script embutido, `id`/handler órfão, arquivo referenciado que não existe, coerência da versão entre código, rodapé, README e CHANGELOG) e funcional via jsdom (sobe os dois módulos e exercita os fluxos reais — delineamentos, Field Book, abas, Reposicionar, ordenação, subamostras, modo escuro, banner de versão). **108 verificações**, executadas a cada publicação pelo GitHub Actions.
- **Deploy do GitHub Pages ignora o commit diário de `stats.json`** — evita publicações concorrentes e falhas transitórias sem relação com o app.

---

## [2.1.0] — Junho 2026

> Consolida como versão própria os ajustes "rolantes" feitos sobre a v2.0.0 (Reposicionar parcelas/amostras
> e RCBD de bloco completo no Lab) e corrige a métrica de dispositivos ativos para contar apenas recorrentes.

### Adicionado
- **Reposicionar parcelas / amostras (Campo + Lab)** — novo modo na aba Croqui/Placa (checkbox **"✋ Reposicionar"**) para **documentar experimentos já implantados**: toca-se em **duas parcelas** (Campo) ou **dois poços de amostra** (Lab) e os tratamentos trocam de posição, refletindo o arranjo real (sem depender do sorteio / da semente). Inclui *tap-to-swap* (desktop + mobile), destaque da seleção, badge **"Layout personalizado"**, validação não-bloqueante das regras de **todos os delineamentos** do Campo (DBC/Fatorial: 1× por bloco; DQL: quadrado latino; parcelas subdivididas: fator A único + níveis de B completos por parcela principal; faixas cruzadas: A por linha e B por coluna; látice: 1× por repetição) — no split-plot a **parcela principal física não se move** (só o conteúdo do tratamento), botão **"↻ Voltar ao aleatório"** e propagação automática para Field Book / CSV / scripts / Coleta.
  - No **Lab**, disponível apenas nos modos **aleatorizados** (MIC/CRD, MTT, Fitotoxicidade, ELISA, CRD genérico); oculto em Dose-Resposta / Checkerboard / EcoPlate (layouts sistemáticos). Checagem por modo: **CRD** → sem restrição posicional; **RCBD-R/C/Q** → **bloco completo** (cada linha/coluna/quadrante usada contém cada tratamento exatamente 1×), com validação estrita.
  - **Integridade científica:** com layout manual, o **Texto para Publicação** (M&M + legenda, PT/EN) passa a esclarecer que o croqui reflete o **arranjo conforme implantado (informado pelo usuário)**, não uma aleatorização gerada pelo software. No **Lab** — onde o M&M citava *"randomização restrita … (semente = X)"* —, essa frase é **substituída** pela do arranjo informado.
  - **Persistência:** o arranjo manual é salvo no projeto **e persiste entre recargas** (autosave local), sem precisar salvar um projeto nomeado.

### Melhorado
- **Lab — RCBD agora é bloco completo de verdade**: o gerador de layout foi reescrito para usar **`reps` blocos** (linhas/colunas/quadrantes), cada um contendo **cada tratamento exatamente 1×** — antes era randomização restrita (espalhava os tratamentos sem garantir bloco completo). Limite: `reps` ≤ 8 (linha) / 12 (coluna) / 4 (quadrante); se faltarem blocos com poços livres suficientes, **alerta e não gera**. O **Texto de M&M** passa a descrever "blocos completos casualizados / randomized complete blocks". CRD permanece casualização completa. _Reprodutibilidade: a mesma semente passa a gerar um layout diferente do das versões anteriores do Lab._
- **Avaliações**: contador de caracteres ao vivo no campo de comentário (`0/200`), zerado ao abrir/limpar o formulário (Campo + Lab).
- **Cabeçalho do Campo**: subtítulo passa a "Experimental Design para Ciências Agrárias **e Afins**" (abrange Ecologia/Floresta).
- **README**: link direto para abrir issue no aviso "Ajude a validar!"; Opção 2 (cópia local) esclarece que basta **um único arquivo HTML** (não a pasta toda).

### Infraestrutura
- **Métrica de dispositivos ativos** (`update-stats.yml`) passa a contar **apenas dispositivos recorrentes** — vistos em **≥2 dias distintos** na janela de 30 dias —, filtrando IDs efêmeros (aba anônima, reinstalação do PWA, testes do próprio dev) que pingam um único dia e inflavam a contagem. O badge passa a refletir dispositivos reais.

---

## [2.0.0] — Junho 2026

> Versão maior justificada pela introdução do módulo **Lab** como componente permanente do produto,
> pelo volume de novos delineamentos no módulo **Campo** e pela adoção de uma arquitetura de dois
> módulos independentes: **Campo** (`AgroDesign.html`) e **Lab** (`AgroDesignLab.html`).

### Módulo Campo — `AgroDesign.html`

#### Adicionado
- **Látice Simples (k²)**: delineamento em blocos incompletos parcialmente balanceado (t = k² tratamentos, r = 2 repetições); aleatoriza a matriz k×k e distribui Rep I/II; croqui SVG com rótulos X1…Xk / Y1…Yk e separador entre repetições; Resumo, Field Book e CSV com coluna "Rep"; M&M PT/EN com GL do resíduo e critério intrablocos; scripts R (lme4/lmerTest + emmeans), SAS (GLM e MIXED) e Python (statsmodels mixedlm); exemplo "Soja — Látice Simples 5×5"; k de 3 a 14
- **Strip-plot em Blocos (Faixas Cruzadas)**: Fator A por faixas de linha e Fator B por faixas de coluna, independentes dentro de cada bloco; croqui, Resumo, Field Book, CSV/XLSX, M&M PT/EN e scripts R/SAS/Python; exemplo "Café — Strip-plot 3×4"
- **Área de aplicação Ecologia / Floresta** com três novos tipos de UE: Quadrat, Transecto e Parcela permanente, com parâmetros dedicados no painel lateral e schematics próprios
- **Filtragem do seletor de Tipo de UE por Área de Aplicação**
- **Seta de Norte** (bússola) e **Seta de gradiente** (com rótulo livre PT/EN) no croqui SVG, para UEs a campo
- **Área útil (zona de coleta)** destacada no schematic da UE, proporcional às bordaduras
- **Seletor de paleta de cores** no croqui (Colorido: AgroDesign, Okabe-Ito, Pastel, Vivo; Publicação: Clássico, Alto contraste, Hachuras), persistido em presets
- **DQL reformulado** com painel dedicado (nome e níveis dos fatores linha/coluna) refletido em M&M, fieldbook, CSV, XLSX e scripts
- **Opção English na aba Unidade**, vinculada ao croqui
- **Normalização de paste** (Excel tabulado → um item por linha) em todos os campos de tratamentos/níveis
- **Como Citar** (APA + ABNT/Vancouver) no modal Texto para Publicação
- **Import CSV na aba Coleta** (ignora linhas `#`)
- **Reordenação de abas** (Croqui primeiro)
- **Dados de exemplo internos** nos 10 exemplos + botão **"📋 Carregar Exemplo"** e **"📊 Resumo Stat"** (Média ± DP por tratamento) na aba Coleta

#### Melhorado
- **Atualização instantânea** de Croqui, Unidade e Resumo ao alterar qualquer campo do painel (números imediatos; textareas com debounce de 400 ms)
- **Toolbar do Croqui** em duas linhas fixas; **Imprimir** em janela limpa paisagem
- **Seletor de fonte** (Arial, Calibri, Times New Roman) com fontes embutidas em Base64 (Inter, Carlito, Lora)
- **Contrato CSV de Coleta ↔ scripts** refatorado: CSV exporta todas as colunas estruturais (`Rep`, `Linha`/`Coluna`, `Fator A`/`Fator B`) e o cabeçalho da variável-resposta deixa de incluir a unidade; R com `check.names = FALSE`; Python com capitalização consistente; SAS com `DBMS=DLM` + `NAMEROW=5` + `DATAROW=6`
- **`clearAll` ("Novo experimento")** reseta corretamente espécie, bordaduras, ruas e fatores

#### Corrigido
- **GL do resíduo do látice simples**: fórmula corrigida para `(k-1)²` (era `(k-1)(k-2)`, do Quadrado Latino); afeta Resumo e M&M (k=5 agora reporta 16 GL)
- **Scripts R/SAS/Python** não rodavam quando a variável-resposta tinha unidade no cabeçalho; e por colunas ausentes no LÁTICE, DQL e STRIP — ambos resolvidos pelo novo contrato CSV
- **`generateFactorial`**: aleatoriza por índice numérico (sem lookup textual O(n²) que quebrava com separador " × ")
- **Sobreposição na aba Unidade** com bordadura lateral ativa
- **Falha silenciosa de localStorage**: `saveCurrentProject` agora alerta o usuário em caso de cota cheia

### Módulo Lab — `AgroDesignLab.html` _(novo em v2.0.0)_

#### Adicionado
- **Módulo Lab**: app independente para **delineamento em microplacas de 96 poços** (ensaios biológicos, farmacológicos e ecológicos); HTML único, PWA instalável, offline
- **8 templates**: MIC (CLSI M07), MTT, Fitotoxicidade (OECD TG 208), ELISA (RCBD-C), Dose-Resposta, Checkerboard, CRD Genérico e EcoPlate (Biolog CLPP), com destaque do template ativo
- **4 delineamentos** adaptados à microplaca (CRD, RCBD por linha/coluna/quadrante)
- **Dose-Resposta**: até 8 compostos × 12 concentrações; cálculo **4PL in-browser** (IC50, B, Lower, Upper) por Levenberg-Marquardt
- **Checkerboard**: layout A × B com índice **FICI**
- **EcoPlate (Biolog CLPP)**: 31 substratos × 3 triplicatas; **AWCD, Shannon H', Simpson D e McIntosh D** (canônico) a partir das OD
- **Políticas de borda** (Normal, Borda sacrificial, Controles na borda)
- **Croqui SVG da placa** (Colorido/Publicação, tooltip por poço), legenda HTML/embutida, seletor de fonte Base64
- **Abas Resumo, Field Book e Coleta** (OD por poço, outliers IQR, separador decimal, import/export CSV/TXT)
- **Export XLSX multi-abas** (Dados Brutos + Resumo + aba condicional 4PL/CLPP) e **scripts R/SAS/Python** por modo
- **Modal Texto para Publicação** (M&M PT/EN, caption, Como Citar) e **Sistema de Projetos** (save/load nomeado, JSON)
- **Dados de exemplo internos** para os 8 templates

#### Corrigido
- **Índice de McIntosh** (EcoPlate): substituído o valor redundante (`√Simpson D`) pelo índice canônico de McIntosh (1967) `D_M = (N − U)/(N − √N)`, com `U = √Σnᵢ²` sobre atividades brutas; atualizado card, fórmula, M&M PT/EN, caption e XLSX

### Segurança e infraestrutura (ambos os módulos)
- **Content-Security-Policy** no `<head>` dos dois módulos (defesa em profundidade contra XSS); `font-src 'self' data:` para preservar as fontes Base64
- **`esc()` completo** (escapa `& < > " '`, null-safe) no módulo Lab, em paridade com o Campo
- **Meta tags PWA + ícones** e comentário de copyright no `<head>` do Lab
- **Versão automática** (lê `CHANGELOG.md`), **banner de atualização** (`app_config`), **ping de dispositivos ativos** (`app_pings`) e **registro do Service Worker** também no módulo Lab
- **Aviso de versão beta** (selo no cabeçalho + modal na 1ª abertura) nos dois módulos
- `manifest.json` com `display_override`; Service Worker com estratégia *network-first* e cache versionado

---

## [1.1.0] — Maio 2026

### Documentação e licenciamento
- Inclusão do arquivo `LICENSE.md` com licença própria de uso não comercial.
- Inclusão dos documentos de conformidade legal brasileira: `PRIVACY.md`, `SECURITY.md`, `ACCESSIBILITY.md`, `DATA_INVENTORY.md`.
- Revisão de `README.md`, `TERMS.md` e `CHANGELOG.md` para alinhar ao padrão MGC Dev.

---

## [1.0.0] — Maio 2026

### Lançamento inicial

- Suporte a cinco delineamentos: DIC, DBC, DQL, Fatorial (2 e 3 fatores) e Parcelas Subdivididas
- Randomização com semente reprodutível (gerador LCG)
- Croqui SVG interativo com zoom, legenda de cores e tooltip por unidade experimental
- Suporte a cinco tipos de unidade: parcela vegetal, animal individual, baia/lote, piquete e unidade clínica
- Cálculo automático de área total, área por unidade e número estimado de plantas/animais
- Tabela de randomização (field book) exportável como CSV
- Exportação do croqui como imagem PNG e impressão/PDF via diálogo do navegador
- Persistência local de configurações e presets nomeados via `localStorage`
- Cinco experimentos de exemplo pré-carregados (milho DBC, frangos DIC, fatorial vacas, ensaio clínico cães, suínos DQL)
- Sistema de avaliações compartilhadas (Supabase) e apoio via PIX
- Notificação automática de nova versão via CHANGELOG.md e Supabase
- Contagem anônima de dispositivos ativos
- PWA instalável (Android, iOS, desktop)

---

*© 2026 MGC Dev — Marlon Gomes da Costa · Projeto pessoal e independente*
