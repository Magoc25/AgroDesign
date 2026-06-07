# Política de Segurança — AgroDesign

**Versão 2.0 · Junho de 2026**

Este documento descreve as práticas de segurança implementadas no AgroDesign e o processo de resposta a incidentes, em conformidade com os arts. 46–49 da [LGPD (Lei nº 13.709/2018)](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm), a [Resolução CD/ANPD nº 15/2024](https://www.gov.br/anpd/pt-br) e o art. 8º da [Lei nº 9.609/1998](https://www.planalto.gov.br/ccivil_03/leis/l9609.htm).

---

## 1. Arquitetura de segurança

O AgroDesign implementa defesa em cinco camadas contra as principais ameaças a aplicações web. As cinco camadas aplicam-se aos **dois módulos** do app — **Campo** (`AgroDesign.html`) e **Lab** (`AgroDesignLab.html`):

### Camada 1 — Sanitização HTML (esc)
Toda saída de dados do usuário inserida via `innerHTML` passa pela função `esc()`, que escapa os caracteres especiais `& < > " '`, prevenindo ataques de Cross-Site Scripting (XSS).

### Camada 2 — Content Security Policy (CSP)
O `<head>` do app contém uma meta tag CSP que restringe origens de scripts, estilos, fontes e conexões de rede, reduzindo a superfície de ataque para scripts injetados e exfiltração de dados.

### Camada 3 — Validação de entrada
Campos que aceitam valores livres (nomes de tratamentos, espécies, comentários) são validados quanto ao tipo e comprimento antes de serem processados ou exibidos.

### Camada 4 — Backend (Supabase compartilhado)
A tabela `app_reviews` possui constraints SQL que bloqueiam injeção de scripts (`<script>`, `<iframe>`, `javascript:`, handlers `on*=`), limitam o tamanho dos campos e aplicam rate limiting por nome.

### Camada 5 — Isolamento de dados
Os dados do experimento (configurações, modelos) ficam exclusivamente no `localStorage` do dispositivo. Nenhum dado de experimento é transmitido para servidores externos.

---

## 2. Versões suportadas

| Versão | Suporte de segurança |
|---|---|
| 2.x (atual) | ✅ Suportada — correções aplicadas |
| 1.x | ⚠️ Atualize para a versão mais recente |

Recomenda-se sempre usar a versão mais recente, disponível em:
`https://Magoc25.github.io/AgroDesign/AgroDesign.html`

---

## 3. Como reportar uma vulnerabilidade

**Canal exclusivo:** marlongc25@protonmail.com
**Assunto:** `[SECURITY] AgroDesign — <descrição breve>`

Inclua no relatório:
- Descrição da vulnerabilidade e impacto potencial
- Passos para reproduzir (prova de conceito, se possível)
- Versão do app e navegador afetados
- Contato para comunicação segura

**Compromissos do autor:**
- Acuse de recebimento em até **5 dias úteis**
- Avalie e classifique a vulnerabilidade em até **15 dias úteis**
- Corrija e publique patch em prazo compatível com a severidade
- Notifique o reportante antes da divulgação pública

**Divulgação responsável:** solicita-se não divulgar publicamente antes de 90 dias ou da publicação do patch, o que ocorrer primeiro.

---

## 4. Resposta a incidentes (LGPD Arts. 48–49 + ANPD Res. 15/2024)

Em caso de incidente de segurança envolvendo dados pessoais:

1. **Identificação** — detectar e confirmar o incidente
2. **Contenção** — isolar o vetor de ataque (ex: suspender tabela Supabase afetada)
3. **Avaliação** — determinar quais dados foram afetados e o impacto aos titulares
4. **Notificação à ANPD** — em até **72 horas** após ciência do incidente com risco relevante, conforme Resolução CD/ANPD nº 15/2024
5. **Comunicação aos titulares** — quando o incidente puder causar risco ou dano relevante
6. **Correção e publicação** — patch e atualização do CHANGELOG.md com tag `🔒 Security`
7. **Pós-incidente** — revisão das medidas preventivas

**Canal de comunicação aos titulares:** banner de atualização no app + atualização do CHANGELOG.md

---

## 5. Atualizações de segurança

Correções de segurança são publicadas no repositório e notificadas via:
- Banner de atualização no app (compara versão local com `app_config` no Supabase)
- Entrada no `CHANGELOG.md` com tag `🔒 Security`

O usuário é notificado ao abrir o app após uma atualização crítica disponível.

---

*© 2026 MGC Dev — Marlon Gomes da Costa · marlongc25@protonmail.com*
