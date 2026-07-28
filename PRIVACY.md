# Aviso de Privacidade — AgroDesign

**Versão 2.0 · Junho de 2026**

Este aviso descreve como o AgroDesign trata dados pessoais, em conformidade com a [Lei Geral de Proteção de Dados Pessoais (LGPD — Lei nº 13.709/2018)](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm), art. 9º e art. 18.

---

## 1. Controlador

**Marlon Gomes da Costa (MGC Dev)**
Pessoa natural — Agente de Tratamento de Pequeno Porte (ATPP), conforme [Resolução CD/ANPD nº 2/2022](https://www.gov.br/anpd/pt-br/documentos-e-publicacoes/resolucao-cd-anpd-no-2-de-27-de-janeiro-de-2022.pdf), art. 4º.
Contato (canal de privacidade): **marlongc25@protonmail.com**

---

## 2. Arquitetura de dados — duas camadas

O AgroDesign opera em duas camadas distintas de armazenamento, compartilhadas pelos dois módulos —
**Campo** (`AgroDesign.html`) e **Lab** (`AgroDesignLab.html`). **Não há sincronização em nuvem:**
os dados de experimento nunca saem do dispositivo, exceto quando o próprio usuário exporta um arquivo JSON.

| Camada | O que armazena | Quem controla |
|---|---|---|
| **Camada 1** — Supabase compartilhado (autor) | Avaliações públicas, contagem anônima de dispositivos | Autor |
| **Camada 2** — Dispositivo local | Projetos, croquis, coletas, modelos e preferências | Usuário |

---

## 3. Dados coletados — Camada 1 (autor controla)

### 3.1 Avaliações (☕ Apoiar / ⭐ Avaliações)

| Dado | Finalidade | Base legal (LGPD) |
|---|---|---|
| Nome (digitado pelo usuário) | Identificar a avaliação publicamente | Legítimo interesse — art. 7º, IX |
| Comentário (opcional) | Exibir opinião sobre o app | Legítimo interesse — art. 7º, IX |
| Quantidade de estrelas (1–5) | Avaliar qualidade do app | Legítimo interesse — art. 7º, IX |
| Data do envio | Ordenar avaliações | Legítimo interesse — art. 7º, IX |
| Indicação de apoio via PIX | Verificar condição de acesso ao formulário | Legítimo interesse — art. 7º, IX |

As avaliações são **públicas e compartilhadas entre todos os usuários** do app.

### 3.2 Ping anônimo de dispositivo ativo

| Dado | Finalidade | Base legal (LGPD) |
|---|---|---|
| Identificador aleatório de dispositivo (UUID gerado localmente) | Contar dispositivos únicos ativos nos últimos 30 dias | Legítimo interesse — art. 7º, IX |
| Nome do app e versão | Filtrar estatísticas por projeto | Legítimo interesse — art. 7º, IX |
| Data do ping (sem horário) | Limitar a 1 ping por dia por dispositivo | Legítimo interesse — art. 7º, IX |

O ping é enviado **uma vez por dia**, não contém dados pessoais identificáveis e não permite rastrear o usuário. O identificador de dispositivo é gerado aleatoriamente no primeiro uso e armazenado apenas localmente.

---

## 4. Dados armazenados localmente — Camada 2 (usuário controla)

O AgroDesign armazena no `localStorage` do navegador (todas as chaves prefixadas por `agrodesign`):

- Configurações e croquis de experimentos (delineamento, tratamentos, dimensões, arranjo manual)
- Projetos salvos e modelos/presets do usuário
- Dados de coleta digitados nas abas Coleta
- Preferências de interface (modo escuro, separador decimal, aceite do aviso beta)
- Identificador aleatório de dispositivo e data do último ping (ver Camada 1)

Esses dados **nunca saem do dispositivo** sem ação explícita do usuário (exportar JSON/CSV/XLSX). O autor não tem acesso a esses dados.

> ⚠️ Como não há cópia em servidor, limpar o armazenamento do navegador **apaga os projetos definitivamente**.
> O backup é o próprio arquivo JSON exportado pelo usuário.

---

## 5. Transferência internacional

As avaliações e pings são armazenados em servidores do Supabase Inc. (EUA), com proteção de dados conforme os termos de serviço da plataforma. O Supabase possui conformidade com padrões como SOC 2 Type II.

---

## 6. Retenção de dados

- **Avaliações:** armazenadas indefinidamente enquanto o projeto Supabase estiver ativo
- **Pings anônimos:** sem prazo de exclusão automática definido
- **Dados locais:** permanecem no dispositivo até que o usuário os remova manualmente (limpar localStorage ou desinstalar o app)

---

## 7. Direitos do titular (LGPD Art. 18)

O usuário pode exercer os seguintes direitos mediante contato com o autor:

- **Confirmação** de tratamento de dados
- **Acesso** aos dados armazenados sobre si
- **Correção** de dados incompletos ou incorretos
- **Exclusão** de dados tratados com base em legítimo interesse
- **Portabilidade** dos dados

**Canal de contato:** marlongc25@protonmail.com

Prazo de resposta: até 15 dias úteis, conforme art. 18, §3º da LGPD.

---

## 8. Cookies e rastreamento

O AgroDesign **não usa cookies**. O armazenamento local é feito exclusivamente via `localStorage` e `sessionStorage` da API Web, sem rastreamento entre sessões ou entre sites.

---

## 9. Menores de idade

O app não é direcionado a menores de 13 anos (art. 14 da LGPD). Não há coleta intencional de dados de crianças. Se identificada tal situação, os dados serão excluídos.

---

## 10. Alterações neste aviso

Este aviso pode ser atualizado. A versão vigente é sempre a publicada no repositório. Alterações relevantes serão notificadas pelo banner de atualização do app.

---

*© 2026 MGC Dev — Marlon Gomes da Costa · marlongc25@protonmail.com*
