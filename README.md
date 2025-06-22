# URL Shortener API

Este projeto implementa um serviço simples para encurtar URLs. Ele foi construído com [NestJS](https://nestjs.com/) e utiliza **MongoDB** para persistência e **Redis** para cache. Métricas no formato Prometheus são expostas para monitoramento.

## Contexto

O usuário envia uma URL longa e recebe uma versão curta. Ao acessar a URL curta, o serviço redireciona para a original. O código foi pensado para escalar horizontalmente utilizando cache e banco de dados independentes.

O projeto evoluiu para incluir autenticação baseada em **JWT**. Agora é possível registrar usuários e realizar login obtendo um token de acesso que deve ser informado ao encurtar URLs.

## Principais Endpoints

| Método e rota       | Descrição                                           |
|--------------------|-----------------------------------------------------|
| `GET /`            | Retorna `Hello World!` para teste rápido.           |
| `GET /health`      | Endpoint de verificação de status.                  |
| `POST /auth/register` | Cria um novo usuário.                              |
| `POST /auth/login` | Retorna o token JWT.                                |
| `POST /shorten`    | Recebe `{ "url": "https://exemplo.com" }` e retorna a URL encurtada (requer autenticação). |
| `GET /:code`       | Redireciona para a URL original associada ao código.|
| `GET /:code/qrcode`| Retorna um QR Code que aponta para a URL encurtada. |
| `GET /metrics`     | Exibe métricas no padrão Prometheus.                |

## Documentação

A especificação OpenAPI está disponível em [docs/swagger.yml](docs/swagger.yml).
Ao executar o projeto, o Swagger UI pode ser acessado em `http://localhost:3000/api/docs`.

Para testar rapidamente os endpoints, utilize a coleção do Postman localizada em
[docs/postman_collection.json](docs/postman_collection.json).

## Variáveis de Ambiente

- `PORT` – porta do servidor (padrão: `3000`).
- `MONGO_URL` – URL de conexão do MongoDB (padrão: `mongodb://localhost/nest`).
- `REDIS_URL` – URL do Redis para cache (padrão: `redis://localhost:6379`).
- `BASE_URL` – base utilizada para gerar a URL curta (padrão: `http://localhost:3000`).
- `CACHE_TTL` – tempo em segundos para expiração do cache (padrão: `3600`).
- `MYSQL_HOST` – host do MySQL (padrão: `localhost`).
- `MYSQL_PORT` – porta do MySQL (padrão: `3306`).
- `MYSQL_USER` – usuário do MySQL (padrão: `root`).
- `MYSQL_PASSWORD` – senha do MySQL (padrão: `root`).
- `MYSQL_DB` – banco usado para usuários (padrão: `url_shortener`).
- `JWT_SECRET` – chave usada para assinar o token JWT (padrão: `secret`).

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

Isso irá subir o aplicativo em `http://localhost:3000` bem como serviços do MongoDB, Redis e MySQL utilizados pela aplicação.


## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

## Testes

```bash
npm test
```

## Arquitetura

Para mais detalhes sobre as decisões de projeto consulte [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).
