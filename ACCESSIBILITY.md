# Declaração de Acessibilidade — AgroDesign

**Versão 1.0 · Maio de 2026**

Esta declaração é elaborada em conformidade com o art. 63 da [Lei Brasileira de Inclusão (LBI — Lei nº 13.146/2015)](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2015/lei/l13146.htm), as diretrizes [WCAG 2.2 (W3C)](https://www.w3.org/TR/WCAG22/) e a norma [ABNT NBR 17225:2025](https://www.abnt.org.br/).

---

## 1. Identificação

**Aplicação:** AgroDesign — Experimental Design para Ciências Agrárias
**Responsável:** Marlon Gomes da Costa (MGC Dev)
**URL:** https://Magoc25.github.io/AgroDesign/AgroDesign.html
**Data desta declaração:** Maio de 2026

---

## 2. Nível de conformidade declarado

O AgroDesign busca conformidade com o **nível AA das WCAG 2.2**, com as seguintes implementações:

### Implementado

| Critério | Descrição | Status |
|---|---|---|
| 1.1.1 Conteúdo não textual | Elementos do croqui SVG possuem atributos `title` e `aria-label` | ✅ |
| 1.3.1 Info e relacionamentos | Estrutura semântica com `<label>`, `<fieldset>`, `<legend>` nos formulários | ✅ |
| 1.4.3 Contraste mínimo | Razão de contraste ≥ 4.5:1 para texto normal no tema padrão | ✅ |
| 2.1.1 Teclado | Todos os controles interativos acessíveis via teclado (Tab, Enter, Espaço) | ✅ |
| 2.4.3 Ordem de foco | Ordem de foco lógica seguindo a ordem visual do formulário | ✅ |
| 3.1.1 Idioma da página | `lang="pt-BR"` definido no elemento `<html>` | ✅ |
| 3.3.1 Identificação de erro | Mensagens de erro descritivas ao validar parâmetros do experimento | ✅ |
| 4.1.2 Nome, função, valor | Botões e controles com `aria-label` ou texto descritivo | ✅ |

### Limitações conhecidas

| Elemento | Limitação | Impacto |
|---|---|---|
| Croqui SVG complexo | Representação gráfica de experimentos grandes pode ser de difícil navegação por leitores de tela | Médio |
| Exportação PNG | A imagem exportada não possui texto alternativo | Baixo |
| Tooltip por clique na unidade | Pode requerer mouse ou toque; atalho de teclado planejado para v1.1 | Baixo |

---

## 3. Tecnologias utilizadas

- HTML5 semântico
- CSS com variáveis para contraste e temas
- JavaScript (ES2020+)
- SVG (Scalable Vector Graphics) para o croqui

---

## 4. Ambiente de teste

A aplicação foi testada nos seguintes ambientes:

- Chrome 124+ (Windows 11, Android 14)
- Edge 124+ (Windows 11)
- Firefox 125+ (Windows 11)
- Safari 17+ (iOS 17)

---

## 5. Feedback e contato

Encontrou uma barreira de acessibilidade? Entre em contato:

**Email:** marlongc25@protonmail.com
**Assunto:** `[ACESSIBILIDADE] AgroDesign — <descrição>`

Prazo de resposta: até 15 dias úteis.

---

## 6. Processo de atualização

Esta declaração é revisada a cada nova versão major do app ou quando identificadas novas barreiras de acessibilidade.

---

*© 2026 MGC Dev — Marlon Gomes da Costa*
*Base legal: LBI Art. 63 · WCAG 2.2 · ABNT NBR 17225:2025*
