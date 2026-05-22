# Inventário de Tratamento de Dados Pessoais — AgroDesign

**Versão 1.0 · Maio de 2026**

Inventário simplificado elaborado em conformidade com o art. 37 da [LGPD (Lei nº 13.709/2018)](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm) e a [Resolução CD/ANPD nº 2/2022](https://www.gov.br/anpd/pt-br/documentos-e-publicacoes/resolucao-cd-anpd-no-2-de-27-de-janeiro-de-2022.pdf), art. 7º (formato ATPP — Agente de Tratamento de Pequeno Porte).

---

## 1. Identificação do Controlador

| Campo | Valor |
|---|---|
| Nome | Marlon Gomes da Costa |
| CPF/CNPJ | Pessoa natural |
| Porte | ATPP (Agente de Tratamento de Pequeno Porte) |
| Contato DPO/Canal | marlongc25@protonmail.com |
| Aplicação | AgroDesign v1.0 |

---

## 2. Operações de tratamento

### 2.1 Avaliações do app (Camada 1 — Supabase compartilhado)

| Campo | Descrição |
|---|---|
| **Dados tratados** | Nome (texto livre), comentário (opcional), estrelas (1–5), data, indicação de apoio via PIX |
| **Categoria** | Dados pessoais comuns |
| **Finalidade** | Exibição pública de avaliações do app para outros usuários |
| **Base legal** | Legítimo interesse (art. 7º, IX) — melhoria e transparência do produto |
| **Titulares** | Usuários que optam por enviar avaliação |
| **Compartilhamento** | Exibido publicamente a todos os usuários do app |
| **Transferência internacional** | Supabase Inc. (EUA) — provedor de infraestrutura |
| **Retenção** | Indefinida enquanto o projeto Supabase estiver ativo |
| **Medidas de segurança** | Constraints SQL anti-XSS, rate limiting, validação de tamanho |

### 2.2 Ping anônimo de dispositivo ativo (Camada 1 — Supabase compartilhado)

| Campo | Descrição |
|---|---|
| **Dados tratados** | UUID aleatório de dispositivo (gerado localmente), nome do app, versão, data (sem horário) |
| **Categoria** | Dado pseudonimizado (UUID sem vínculo a pessoa identificada) |
| **Finalidade** | Contagem de dispositivos únicos ativos para estatísticas de uso |
| **Base legal** | Legítimo interesse (art. 7º, IX) — métricas de adoção do produto |
| **Titulares** | Todos os usuários do app |
| **Compartilhamento** | Apenas agregado (contagem total) exibido no README do repositório |
| **Transferência internacional** | Supabase Inc. (EUA) |
| **Retenção** | Sem prazo definido de exclusão automática |
| **Medidas de segurança** | UUID gerado localmente; sem dado identificador; constraint UNIQUE por dia |

### 2.3 Dados de experimentos (Camada 2 — localStorage local)

| Campo | Descrição |
|---|---|
| **Dados tratados** | Configurações de experimentos, modelos/presets, preferências de interface |
| **Categoria** | Dados técnicos (não pessoais por natureza; podem conter nomes de pesquisadores se inseridos pelo usuário) |
| **Finalidade** | Persistência de configurações entre sessões do app |
| **Base legal** | Não aplicável (armazenamento local; controlado exclusivamente pelo usuário) |
| **Titulares** | Usuário do dispositivo |
| **Compartilhamento** | Nenhum — permanece no dispositivo |
| **Transferência internacional** | Nenhuma |
| **Retenção** | Até exclusão manual pelo usuário |
| **Medidas de segurança** | Armazenamento local; isolamento por origem do navegador |

### 2.4 Dados de experimentos sincronizados (Camada 3 — Supabase próprio do usuário, opcional)

| Campo | Descrição |
|---|---|
| **Dados tratados** | JSON com configurações do experimento (definido pelo próprio usuário) |
| **Categoria** | Dados técnicos (controlados pelo usuário) |
| **Finalidade** | Sincronização entre dispositivos |
| **Base legal** | Não aplicável — o controlador é o próprio usuário |
| **Titulares** | Usuário |
| **Compartilhamento** | Apenas entre dispositivos do próprio usuário |
| **Transferência internacional** | Depende da região escolhida pelo usuário no Supabase |
| **Retenção** | Controlada pelo usuário |
| **Medidas de segurança** | Chaves configuradas pelo usuário; não expostas no código |

---

## 3. Fluxo de dados

```
Usuário digita avaliação
        ↓
AgroDesign.html (validação + esc())
        ↓
Supabase compartilhado (app_reviews) — Camada 1
        ↓
Exibido publicamente a todos os usuários

Usuário abre o app (diariamente)
        ↓
Ping anônimo (UUID local + data)
        ↓
Supabase compartilhado (app_pings) — Camada 1
        ↓
GitHub Action agrega → stats.json → badge no README
```

---

## 4. Suboperadores

| Suboperador | Serviço | País | Dados tratados |
|---|---|---|---|
| Supabase Inc. | Banco de dados (PostgreSQL) | EUA | Avaliações, pings |
| GitHub Inc. | Hospedagem de código e GitHub Pages | EUA | Código-fonte (sem dados pessoais) |

---

*© 2026 MGC Dev — Marlon Gomes da Costa · marlongc25@protonmail.com*
*Base legal: LGPD Art. 37 · Resolução CD/ANPD nº 2/2022*
