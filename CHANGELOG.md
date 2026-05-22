# Changelog — AgroDesign

Todas as mudanças notáveis neste projeto estão documentadas aqui.
Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/).

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
