# URL Shortener API

Este projeto implementa um serviço simples para encurtar URLs. Ele foi construído com [NestJS](https://nestjs.com/) e utiliza **MongoDB** para persistência e **Redis** para cache. Métricas no formato Prometheus são expostas para monitoramento.

## Contexto

O usuário envia uma URL longa e recebe uma versão curta. Ao acessar a URL curta, o serviço redireciona para a original. O código foi pensado para escalar horizontalmente utilizando cache e banco de dados independentes.

## Principais Endpoints

| Método e rota       | Descrição                                           |
|--------------------|-----------------------------------------------------|
| `GET /`            | Retorna `Hello World!` para teste rápido.           |
| `GET /health`      | Endpoint de verificação de status.                  |
| `POST /shorten`    | Recebe `{ "url": "https://exemplo.com" }` e retorna a URL encurtada. |
| `GET /:code`       | Redireciona para a URL original associada ao código.|
| `GET /metrics`     | Exibe métricas no padrão Prometheus.                |

## Variáveis de Ambiente

- `PORT` – porta do servidor (padrão: `3000`).
- `MONGO_URL` – URL de conexão do MongoDB (padrão: `mongodb://localhost/nest`).
- `REDIS_URL` – URL do Redis para cache (padrão: `redis://localhost:6379`).
- `BASE_URL` – base utilizada para gerar a URL curta (padrão: `http://localhost:3000`).
- `CACHE_TTL` – tempo em segundos para expiração do cache (padrão: `3600`).

## Como executar

```bash
npm install
npm run start:dev
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Docker Compose

Para executar o projeto utilizando Docker Compose, certifique-se de ter o Docker instalado e execute:

```bash
docker-compose up --build
```

Isso irá subir o aplicativo em `http://localhost:3000` bem como serviços do MongoDB e Redis utilizados pela aplicação.


## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

## Testes

```bash
npm test
```

## Arquitetura

Para mais detalhes sobre as decisões de projeto consulte [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).
