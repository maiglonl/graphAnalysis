# UI e Estado Local

Este documento descreve o estado local da interface do `graphAnalysis`.

## Tela inicial

Arquivo principal:

```txt
app/pages/index.vue
```

Responsabilidades atuais:

- análise individual de ativo;
- ranking de oportunidades via `/api/scan`;
- filtros de ranking;
- seleção de oportunidade;
- exibição do gráfico;
- exibição dos padrões detectados;
- exibição da sugestão e do plano de risco.

## Estado persistido

A persistência local usa:

```txt
app/composables/usePersistedRef.ts
```

O composable sincroniza `ref` com `localStorage` no client.

## Chaves atuais

```txt
graphAnalysis.symbol
graphAnalysis.interval
graphAnalysis.symbolsToScan
graphAnalysis.actionFilter
graphAnalysis.minConfidence
graphAnalysis.accountSize
graphAnalysis.riskPercent
```

## Ranking de oportunidades

O ranking chama:

```txt
GET /api/scan
```

Query enviada:

```ts
{
  symbols: symbolsToScan.value,
  interval: interval.value,
}
```

O resultado é filtrado na UI por:

- ação;
- confiança mínima.

## Seleção de oportunidade

Ao selecionar um item do ranking:

```ts
symbol.value = item.symbol
interval.value = item.interval
result.value = item
```

Isso evita uma segunda chamada para `/api/analyze`.

## Gestão de risco

A UI coleta:

- capital total;
- risco por operação.

O cálculo usa:

```txt
shared/utils/riskPlan.ts
```

A UI não calcula regra financeira diretamente; ela apenas exibe o retorno de `buildRiskPlan()`.

## Regras

- Todo texto visível deve usar i18n.
- Estilos comuns ficam nos componentes.
- Cores semânticas de mercado continuam em `shared/utils/colors.ts`.
- Dados pesados de mercado não devem ser persistidos em `localStorage`.
