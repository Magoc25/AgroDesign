# Changelog — AgroDesign

Todas as mudanças notáveis neste projeto estão documentadas aqui.
Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/).

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
- `manifest.json` com `display_override`; Service Worker com estratégia *network-first* e cache `agrodesign-v54`

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
