# 🌱 AgroDesign

> **Planejamento e randomização de experimentos científicos nas Ciências Agrárias e da Saúde Animal.**
> Dois módulos independentes: **Campo** (croquis de experimentos a campo/instalações) e **Lab** (delineamentos em microplacas de 96 poços).

Desenvolvido por **Marlon Gomes da Costa (MGC Dev)**

> ⚠️ **Este é um projeto pessoal**, desenvolvido de forma independente pelo autor.
> Não representa, não é financiado e não tem vínculo institucional com o IFMA
> ou qualquer outra organização.

[![Versão](https://img.shields.io/badge/versão-2.0.0--dev-blue)](#changelog)
[![Licença](https://img.shields.io/badge/licença-não%20comercial-orange)](#licença-e-termos-de-uso)
[![PIX](https://img.shields.io/badge/apoie-PIX-brightgreen)](#-apoiar-o-projeto)
[![Dispositivos ativos](https://img.shields.io/badge/dynamic/json?url=https://raw.githubusercontent.com/Magoc25/AgroDesign/master/stats.json&query=$.active_30d&label=dispositivos%20ativos%20(30d)&color=blue&suffix=%20dispositivos)](./stats.json)

---

## 🤔 Por que usar o AgroDesign?

Se você está avaliando este app, provavelmente já pesquisou alternativas online. Antes de decidir, considere:

- **Seus dados são seus** — nenhuma empresa, servidor externo ou desenvolvedor acessa seus dados de experimento. Eles ficam no seu dispositivo, sob seu controle total.
- **Sem propagandas** — apps "gratuitos" nas lojas se sustentam exibindo anúncios. Este não.
- **Sem prazo de expiração** — este é gratuito para sempre, sem limitações ou assinatura.
- **Funciona sem internet** — abre e funciona normalmente mesmo sem conexão. Ideal para campo, galpão, laboratório ou clínica sem Wi-Fi.
- **Feito para ciências agrárias** — terminologia correta de Estatística Experimental: parcelas, blocos, subparcelas, ruas, bordaduras, baias, piquetes, unidades clínicas — exatamente como nos livros da área.
- **Abrange Campo e Laboratório** — do experimento de milho ao protocolo anestésico em cães e do ensaio MIC ao perfil fisiológico comunitário (CLPP/EcoPlate). Dois módulos, um único projeto.

O único "custo" honesto: a instalação é um pouco mais manual do que clicar em "Instalar" na loja — mas você faz uma única vez e leva menos de 5 minutos.

---

## 📂 O que são todos esses arquivos?

Se você veio aqui só para **usar o app**, pode ignorar a grande maioria dos arquivos deste repositório — eles são documentação técnica e configuração voltadas para desenvolvedores.

Para você, o que importa é simples:

| Cenário | Módulo | O que você precisa |
|---|---|---|
| **Experimentos a campo / instalações animais** | Campo | `AgroDesign.html` ou URL pública |
| **Ensaios em microplaca de 96 poços** | Lab | `AgroDesignLab.html` ou URL pública |

👉 Vá direto para [**Como usar**](#-como-usar) para o passo a passo do seu cenário.

---

## ✨ O que é

O **AgroDesign** é um aplicativo 100% no navegador para planejamento estatístico de experimentos científicos. Não requer instalação, servidor ou internet — basta abrir o arquivo HTML no navegador.

### Módulo Campo (`AgroDesign.html`)

Planejamento de experimentos a campo, casa de vegetação e instalações animais. Cobre os principais delineamentos da Estatística Experimental nas Ciências Agrárias:

| Delineamento | Sigla |
|---|---|
| Inteiramente Casualizado | DIC |
| Blocos Casualizados | DBC |
| Quadrado Latino | DQL |
| Fatorial (2 e 3 fatores) em DIC ou DBC | FAT |
| Parcelas Subdivididas (split-plot) em DIC ou DBC | SPL |
| Strip-plot em Blocos (Faixas Cruzadas) | STRIP |
| Látice Simples (k²) — blocos incompletos | LATICE |

Áreas de aplicação suportadas: Agropecuária (parcela vegetal, animal individual, baia/lote, piquete, unidade clínica) e Ecologia/Floresta (Quadrat, Transecto, Parcela permanente).

### Módulo Lab (`AgroDesignLab.html`)

Delineamento e randomização para **microplacas de 96 poços** em ensaios biológicos, farmacológicos e ecológicos:

| Template | Tipo |
|---|---|
| MIC Antimicrobiano (CLSI M07) | CRD |
| Viabilidade Celular (MTT) | CRD — borda sacrificial |
| Fitotoxicidade (OECD TG 208) | RCBD por linha |
| ELISA | RCBD por coluna |
| Dose-Resposta (Diluição Seriada) | Layout sistemático + 4PL in-browser |
| Checkerboard (Sinergismo) | Concentração A × Concentração B (FICI) |
| EcoPlate (Biolog CLPP) | Layout fixo + AWCD + diversidade funcional |
| CRD Genérico | CRD |

---

## 🚀 Funcionalidades

### Módulo Campo
- **7 delineamentos** — DIC, DBC, DQL, Fatorial (2/3 fatores), Parcelas Subdivididas, Strip-plot, Látice Simples
- **7 tipos de unidade experimental** — parcela vegetal, animal individual, baia/lote, piquete, unidade clínica, quadrat, transecto, parcela permanente
- **Croqui SVG interativo** — zoom, 6 modos de rótulo, 4 estilos de célula, 2 temas (Colorido/Publicação), 7 paletas, seletor de fonte, Norte e gradiente customizáveis
- **Randomização reprodutível** — fixe a semente para repetir o croqui exatamente
- **Aba Unidade** — schematic proporcional da UE com cotas e área útil destacada
- **Aba Resumo** — cards por delineamento com atualização instantânea
- **Field Book** — tabela de randomização exportável como CSV e XLSX; scripts R, SAS e Python automáticos
- **Coleta de dados** — variáveis configuráveis, detecção de outliers IQR, importação CSV, exportação TXT
- **Texto para Publicação** — Material & Métodos PT/EN com legenda e Como Citar (APA + ABNT/Vancouver)
- **Presets e Projetos** — salve configurações e estado completo do experimento
- **PWA instalável** — funciona offline, instala como app no celular e desktop

### Módulo Lab
- **8 templates** pré-configurados com delineamento, controles e parâmetros completos
- **Layout SVG** da placa com tooltip por poço, tema Colorido/Publicação e legenda
- **Dose-Resposta** — curva 4PL in-browser (IC50, B, Lower, Upper) com Levenberg-Marquardt
- **EcoPlate** — AWCD, Shannon H', Simpson D, McIntosh U a partir das leituras de OD
- **Coleta de dados** — entrada por poço, outliers IQR, importação/exportação CSV
- **Export XLSX multi-abas** — Dados Brutos + Resumo + aba condicional (4PL ou CLPP)
- **Scripts R, SAS e Python** gerados por modo de análise
- **Texto para Publicação** — M&M PT/EN, caption automática, Como Citar
- **Sistema de Projetos** — save/load nomeado, exportação/importação JSON
- **PWA instalável** — funciona offline

---

## 📦 Como usar

### Módulo Campo

#### Cenário 1 — Uso local simples _(sem nuvem)_

1. Baixe `AgroDesign.html` e abra no Chrome, Edge, Firefox ou Safari
2. Pronto — todos os dados ficam salvos no próprio navegador

**Backup:** exporte os presets regularmente pelo botão Exportar JSON em Configurações.

#### Cenário 2 — Acesso de qualquer lugar pela URL _(GitHub Pages)_

1. Acesse a URL pública: `https://Magoc25.github.io/AgroDesign/AgroDesign.html`
2. No Chrome/Edge: clique no ícone de instalação na barra de endereços para instalar como PWA

### Módulo Lab

#### Cenário 1 — Uso local

1. Baixe `AgroDesignLab.html` e abra no navegador

#### Cenário 2 — URL pública

1. Acesse: `https://Magoc25.github.io/AgroDesign/AgroDesignLab.html`

---

### Cenário 3 — Dois computadores com sincronização de presets _(Supabase — apenas Campo)_

1. Crie conta no Supabase (gratuito) — veja [Configurar Supabase](#-configurar-supabase-sincronização)
2. Abra o app em cada dispositivo, acesse ☁️ e configure as chaves
3. Os presets sincronizam automaticamente

---

## 🔧 Configurar Supabase (sincronização)

#### 1. Criar conta e projeto

1. Acesse supabase.com → New Project
2. Nome: `agrodesign` · Região: South America (São Paulo)

#### 2. Criar a tabela de dados (SQL Editor)

```sql
CREATE TABLE public.agro_sync (
  id         text PRIMARY KEY,
  payload    text,
  updated_at timestamptz DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.agro_sync TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.agro_sync TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.agro_sync TO service_role;

ALTER TABLE public.agro_sync ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON public.agro_sync FOR ALL USING (true) WITH CHECK (true);
```

#### 3. Copiar as chaves

Settings → Data API:
- **Project URL** — `https://xxxx.supabase.co`
- **Publishable key** — começa com `sb_publis...`

#### 4. Configurar no app

Abra o app Campo → ☁️ → cole URL e Key → Testar conexão → Salvar

**Bloco extra — Evitar suspensão por inatividade (recomendado):**

O Supabase pode suspender projetos gratuitos sem atividade por 7 dias.
Para evitar isso, rode uma vez no SQL Editor após ativar a extensão `pg_cron` em Database → Extensions:

```sql
SELECT cron.schedule(
  'agrodesign-keep-alive',
  '0 8 * * 1',
  $$SELECT COUNT(*) FROM public.agro_sync$$
);
```

> Agenda uma consulta toda segunda-feira às 5h Brasília. Para confirmar: `SELECT * FROM cron.job;`

---

## 🔧 Configurar GitHub Pages

1. Repositório → Settings → Pages
2. Source: Deploy from a branch → Branch: main → / (root) → Save
3. Aguarde ~2 min
4. URLs:
   - Campo: `https://Magoc25.github.io/AgroDesign/AgroDesign.html`
   - Lab: `https://Magoc25.github.io/AgroDesign/AgroDesignLab.html`

> ⚠️ A URL base (`/AgroDesign/`) retorna 404 — sempre use a URL com o nome do arquivo.

---

## 📱 Instalar como app no celular

**Android (Chrome):** Menu (⋮) → Adicionar à tela inicial → Confirmar

**iPhone/iPad (Safari):** Compartilhar → Adicionar à tela de início

---

## ☕ Apoiar o Projeto

O projeto é gratuito e possui **código-fonte disponível**. Se foi útil no seu ensino ou pesquisa, considere apoiar:

Clique em **☕ Apoiar** no rodapé do app para contribuir via PIX.

**Chave PIX:** `4c6086a2-4bb8-474b-a4cf-ced8c8d82189` · MGC Dev

### ⭐ Avaliações compartilhadas

Após apoiar, deixe uma avaliação com estrelas e comentário. As avaliações são
**compartilhadas entre todos os usuários** do app.

### 👑 Badges de apoiador

| Badge | Meses de apoio |
|---|---|
| ☕ Apoiador | 1 mês |
| ⭐ Fã | 2–3 meses |
| 🔥 Dedicado | 4–6 meses |
| 👑 Patrono | 7+ meses |

---

## 📄 Licença e termos de uso

Este projeto possui **código-fonte disponível** para estudo, uso pessoal, familiar, educacional, acadêmico e avaliação técnica.

**Não é uma licença open source permissiva tradicional.** O uso comercial, a redistribuição comercial, o white-label, a revenda e a exploração econômica de versões derivadas dependem de autorização prévia e por escrito do autor.

Consulte os arquivos:

- [LICENSE.md](./LICENSE.md)
- [TERMS.md](./TERMS.md)
- [CHANGELOG.md](./CHANGELOG.md)
- [PRIVACY.md](./PRIVACY.md)

---

## 👤 Autor

**Marlon Gomes da Costa**
Desenvolvedor independente · MGC Dev

*Professor do IFMA Campus São Raimundo das Mangabeiras — projetos são iniciativas pessoais,
sem vínculo institucional.*

---

*© 2026 MGC Dev — Feito com ☕ no Maranhão*
