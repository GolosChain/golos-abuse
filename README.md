# Golos Abuse

Сервер для сбора жалоб на контент в блокчейне [Golos](http://golos.io)

## Начало работы

Данная инструкция ориентирована на пользоватлей linux с debian дистрибутивами. Для запуска приложения потребуется установить следующие зависимости:

### NodeJS

Установите NodeJS, мы рекомендуем использовать [**LTS version**](https://nodejs.org/en/) и [**nvm**](https://github.com/creationix/nvm) для установки:

```bash
nvm install 8.11.1
nvm use 8.11.1
```

### Tarantool

Приложение хранит данные в базе данных [PostgreSQL](https://www.postgresql.org/). Используйте [Docker Compose](https://docs.docker.com/compose/) с нашим [docker-compose.yml](./docker-compose.yml) или скайчайте PostrgeSQL в готовой сборке по [ссылке](https://www.postgresql.org/download/), в этом случае вам необходимо использовать [init.sql](./data/postgresql/init.sql) для создания таблиц. При использовании docker-compose данные будут сохранятся в директорию: **./data/postgresql/data/**.

```bash
docker-compose up -d
```

## Установка

### 1. Склонируйте репозиторий

```bash
git clone git clone git@github.com:GolosChain/golos-abuse.git && cd golos-abuse
```

### 2. Установите npm зависимости

```bash
npm install
```

### 3. Создайте файлы конфигрураций

Конфигурация по умолчанию хранится в [config.json](./common/@config/config.json). Для изменения конфигурации лучше всего создать новый config.[ENV].json, который зависит от переменной окружения и расширяет набор конфигураций по умолчанию.

```bash
cp ./common/@config/config.json ./common/@config/config.production.json
cp ./common/@config/config.json ./common/@config/config.development.json
cp ./common/@config/config.json ./common/@config/config.test.json
```

```json
{
  // Секрет для JSON Web Token авторизации
  "JWT": {
    "secret": "SET YOUR SECRET FOR JWT"
  },
  // Параметры инстанса PostgreSQL
  "postgresql": {
    "host": "127.0.0.1",
    "port": 5432,
    "database": "golos",
    "username": "golos",
    "password": "golos",
    "dialect": "postgres"
  },
  // Параметры сервера
  "server": {
    "port": 8080,
    "host": "localhost"
  },
  // URL ноды блокчейна Golos, работающий по протоколу websocket
  "golos": {
    "url": "wss://ws17.golos.io"
  },
  // Существующий пользователь в блокчейне Golos для запуска тестов
  "test": {
    "username": "SET USERNAME FOR TEST CREATE COMPLAINT",
    "WIF": "SET PRIVATE POSTING KEY FOR TEST CREATE COMPLAINT"
  }
}
```

## Запуск тестов

Репозиторий содержит тесты API, использован подход black box. Для запуска тестов необходимо задать тестового пользователя с приватным постинг ключом от блокчейна GOLOS. Это необходимо для полной проверки тестов, включая взаимодействие с публичной нодой GOLOS и проверки подписи при создании новых жалоб. Так же для тестов необходимо иметь запущенный инстанс базы **PostgreSQL**.

```bash
npm test
```

## Запуск приложения

Для запуска демонов рекомендуется использовать [PM2](http://pm2.keymetrics.io/). Репозиторий содержит готовый [process.json](./process.json):

```bash
# Запуск приложения под контроллем pm2
pm2 start process.json --env production

# Безопасный рестарт приложения
pm2 gracefulReload api

# запуск мониторинг pm2
pm2 monit
```

## Swagger

Репозиторий содержит [json файл](./server/swagger.json) с данными для [Swagger](https://swagger.io/). Для быстрого запуска вы также можете воспользоваться нашим [docker-compose.yml](./docker-compose.yml), после чего на http://127.0.0.1:8081 запустится swagger-gui с уже подключенным файлом json.