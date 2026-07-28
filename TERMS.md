# Termos de Uso — AgroDesign

**Versão 2.0.0 · Junho de 2026**

Desenvolvido por **Marlon Gomes da Costa (MGC Dev)** — professor do IFMA Campus São Raimundo das Mangabeiras; este projeto é uma iniciativa pessoal, sem vínculo institucional.

---

## 1. Uso permitido

O uso do AgroDesign é **gratuito** para as seguintes finalidades:

- Uso pessoal, familiar ou doméstico
- Atividades educacionais e de ensino (graduação, pós-graduação, cursos técnicos)
- Pesquisa acadêmica sem fins lucrativos
- Avaliação técnica e demonstração
- Uso em atividades de extensão sem geração de receita

---

## 2. Uso comercial

O uso comercial do AgroDesign **é proibido sem autorização prévia e por escrito** do autor. Exemplos de uso comercial proibido:

- Oferecer o app como serviço pago (SaaS) ou incluí-lo em pacote de software comercial
- Cobrar pelo acesso, configuração ou suporte do app a terceiros
- Usar o app em consultorias ou prestação de serviços remunerados sem autorização
- Redistribuir versões modificadas com fins comerciais (white-label, revenda)
- Monetizar o app ou seus derivados por meio de publicidade, assinaturas ou doações organizadas

Para licenciamento comercial: **marlongc25@protonmail.com**

---

## 3. Modificações e redistribuição

- Modificações para uso pessoal ou acadêmico são permitidas, desde que sem fins comerciais
- A redistribuição pública de versões modificadas exige autorização prévia do autor
- Forks públicos no GitHub são aceitos para fins de estudo, desde que mantenham o crédito ao autor original e não removam este arquivo de termos

---

## 4. Propriedade intelectual

O código-fonte é disponibilizado publicamente para leitura e estudo. Isso **não significa cessão de direitos autorais**. A remoção de créditos, de avisos de copyright ou deste arquivo de termos não extingue os direitos do autor sobre o software.

---

## 5. Isenção de responsabilidade

O AgroDesign é fornecido **"como está"**, sem garantias expressas ou implícitas. O autor não se responsabiliza por erros nos croquis gerados, decisões tomadas com base nos resultados do app, perda de dados ou qualquer dano decorrente do uso do software.

O usuário é responsável por validar os delineamentos gerados com o referencial técnico e estatístico adequado antes de utilizá-los em pesquisas formais.

---

## 6. Dados e privacidade

- O AgroDesign possui dois módulos: **Campo** (`AgroDesign.html`) e **Lab** (`AgroDesignLab.html`). Ambos são *local-first*: **não há sincronização em nuvem** dos dados de experimento
- Os dados do experimento (configurações, projetos, coletas) ficam armazenados exclusivamente no `localStorage` do dispositivo do usuário
- Para backup ou uso em outro dispositivo, o usuário exporta um arquivo (JSON/CSV/XLSX) gerado localmente — o app não envia esse arquivo a lugar nenhum. **Limpar o armazenamento do navegador apaga os dados de forma definitiva**; o backup é responsabilidade do usuário
- O sistema de avaliações (☕ Apoiar / ⭐ Avaliações) usa um banco de dados compartilhado do autor para armazenar avaliações públicas: nome, comentário, estrelas, data e indicação de apoio via PIX
- O app envia **um ping anônimo por dia** ao Supabase do autor para contagem de dispositivos ativos. O ping contém apenas: nome do app, versão, data e um identificador aleatório gerado no dispositivo (sem vínculo com dados pessoais). Não é possível identificar o usuário a partir deste dado
- Nenhum dado do experimento é enviado a servidores externos
- Consulte também: [PRIVACY.md](./PRIVACY.md)

---

## 7. Obrigações do usuário sobre atualizações

O usuário é responsável por manter o app atualizado. Ao continuar a usar uma versão desatualizada após notificação de nova versão disponível, o usuário assume os riscos decorrentes de eventuais correções de segurança ou erros não aplicados. Essa conduta pode configurar culpa concorrente em caso de danos, nos termos do art. 945 do Código Civil e art. 12, §3º do Código de Defesa do Consumidor.

---

## 8. Foro legal

Fica eleito o foro da Comarca de **São Raimundo das Mangabeiras — MA, Brasil** para dirimir quaisquer controvérsias decorrentes destes termos.

---

## 9. Alterações nos termos

O autor reserva-se o direito de alterar estes termos a qualquer momento. A versão vigente é sempre a publicada no repositório. O uso continuado do app após publicação de nova versão implica aceitação dos novos termos.

---

*© 2026 MGC Dev — Marlon Gomes da Costa*
*Contato: marlongc25@protonmail.com*
