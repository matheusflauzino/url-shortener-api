# Visão Arquitetural

Este documento descreve os principais componentes do serviço de encurtamento de URLs e as decisões técnicas adotadas.

## Visão Geral

O projeto foi desenvolvido em **NestJS**, um framework Node.js que promove uma estrutura modular e escalável. O serviço expõe endpoints HTTP para encurtar e redirecionar URLs. A persistência é feita em **MongoDB** através do `@nestjs/mongoose`. Para agilizar o acesso e suportar escalabilidade horizontal é utilizado **Redis** como cache. Métricas de uso são expostas no padrão Prometheus.

## Diagrama de Componentes

```mermaid
flowchart TD
    Client((Cliente)) -->|HTTP| API["URL Shortener API\n(NestJS)"]
    API -->|Consultas / atualizações| MongoDB[(MongoDB)]
    API -->|Cache (opcional)| Redis[(Redis)]
    API -->|Métricas| Prometheus[(Prometheus)]
```

## Decisões Técnicas

- **NestJS** foi escolhido por oferecer injeção de dependências, módulos e facilidade de testes, resultando em código organizado e manutenível.
- **MongoDB** armazena as URLs originais e seus códigos curtos. A natureza schemaless facilita a evolução e o volume esperado se encaixa bem em bancos NoSQL.
- **Redis** é usado como cache, reduzindo a carga sobre o banco e melhorando o tempo de resposta, além de permitir distribuição da aplicação sem perda de performance.
- **Prometheus (prom-client)** coleta métricas de requisições HTTP, possibilitando monitoramento e alertas.
- **Pino/NestJS Logger** gerencia logs estruturados, importantes para depuração e observabilidade.

## Fluxo Básico

1. O usuário envia `POST /shorten` com uma URL.
2. A aplicação gera um código curto usando `ShortCodeService` e verifica se já existe no MongoDB.
3. A URL original é persistida e armazenada em Redis para acesso rápido.
4. Ao acessar `GET /:code`, a aplicação busca primeiro no cache; em caso de cache miss, consulta o MongoDB e atualiza o cache.
5. Métricas de cada requisição são registradas e podem ser consultadas em `GET /metrics`.
