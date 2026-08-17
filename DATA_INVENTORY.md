# Inventário de Tratamento de Dados Pessoais — AgroDesign

**Versão 2.0 · Junho de 2026**

Inventário simplificado elaborado em conformidade com o art. 37 da [LGPD (Lei nº 13.709/2018)](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm) e a [Resolução CD/ANPD nº 2/2022](https://www.gov.br/anpd/pt-br/documentos-e-publicacoes/resolucao-cd-anpd-no-2-de-27-de-janeiro-de-2022.pdf), art. 7º (formato ATPP — Agente de Tratamento de Pequeno Porte).

---

## 1. Identificação do Controlador

| Campo | Valor |
|---|---|
| Nome | Marlon Gomes da Costa |
| CPF/CNPJ | Pessoa natural |
| Porte | ATPP (Agente de Tratamento de Pequeno Porte) |
| Contato DPO/Canal | marlongc25@protonmail.com |
| Aplicação | AgroDesign v2.0 — módulos Campo (`AgroDesign.html`) e Lab (`AgroDesignLab.html`) |

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
| **Medidas de segurança** | RLS permitindo **apenas** leitura e inserção (sem UPDATE/DELETE — avaliação enviada não pode ser alterada nem apagada pelo app); constraints de tamanho (nome ≤ 40, comentário ≤ 200) e de faixa (estrelas 0–5); constraint anti-XSS barrando `<script`, `<iframe`, `javascript:` e handlers `on…=` nos campos de texto. **Não há rate limiting** — nem no cliente, nem no banco |

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
| **Dados tratados** | Configurações de experimentos, modelos/presets, preferências de interface (módulos **Campo** e **Lab**; o módulo Lab é exclusivamente local) |
| **Categoria** | Dados técnicos (não pessoais por natureza; podem conter nomes de pesquisadores se inseridos pelo usuário) |
| **Finalidade** | Persistência de configurações entre sessões do app |
| **Base legal** | Não aplicável (armazenamento local; controlado exclusivamente pelo usuário) |
| **Titulares** | Usuário do dispositivo |
| **Compartilhamento** | Nenhum — permanece no dispositivo |
| **Transferência internacional** | Nenhuma |
| **Retenção** | Até exclusão manual pelo usuário |
| **Medidas de segurança** | Armazenamento local; isolamento por origem do navegador |

### 2.4 Arquivos exportados pelo usuário (JSON / CSV / XLSX / PNG / SVG / TXT)

| Campo | Descrição |
|---|---|
| **Dados tratados** | Cópia do projeto ou da tabela de dados, gerada sob comando explícito do usuário |
| **Categoria** | Dados técnicos (controlados pelo usuário) |
| **Finalidade** | Backup e portabilidade entre dispositivos — **não há sincronização automática** |
| **Base legal** | Não aplicável — o arquivo é gerado no dispositivo e fica sob controle do usuário |
| **Titulares** | Usuário |
| **Compartilhamento** | Nenhum pelo app; o arquivo vai para onde o usuário salvar/enviar |
| **Transferência internacional** | Nenhuma pelo app |
| **Retenção** | Controlada pelo usuário |
| **Medidas de segurança** | Geração 100% local (sem upload); o app não guarda cópia do arquivo exportado |

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
