# göster

a simple screen recording sharing web app, göster means "show" in turkish.

## preview

<p align="center">
  <img src="https://raw.githubusercontent.com/byigitt/goster/refs/heads/main/images/goster-demo.gif" />
</p>

## features

- create one-time-use links for screen recording
- record your screen directly in the browser
- preview recordings before sending
- automatic upload and sharing
- view recordings through the same interface
- pastel color palette with lowercase text throughout

## getting started

### prerequisites

- node.js 18+
- pnpm package manager

### installation

```bash
# install dependencies
pnpm install

# run development server
pnpm dev
```

open [http://localhost:3000](http://localhost:3000) to use the app

## usage

1. click "create link" on the homepage
2. share the generated link with someone
3. they can record their screen and send it back
4. you'll see the recording on the original link page

## tech stack

- next.js 15 (app router)
- tailwindcss v4
- postgresql with prisma orm
- shadcn/ui components
- browser mediarecorder api

## environment variables

create a `.env` file (copy from `.env.example`):

```
# Base URL for the application
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Database connection string
DATABASE_URL="postgresql://postgres:password@localhost:5432/goster?schema=public"

# Telegram Bot Configuration
# Create a bot using @BotFather on Telegram to get the token
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here

# Telegram Channel ID where videos will be stored
# Can be a public channel username (e.g., @yourchannel) or private channel ID (e.g., -1001234567890)
# Make sure your bot is an admin in this channel with permission to post messages
TELEGRAM_CHANNEL_ID=@your_channel_or_id_here
```

### setting up telegram storage

1. create a telegram bot:
   - message [@BotFather](https://t.me/botfather) on telegram
   - send `/newbot` and follow the instructions
   - copy the bot token

2. create a telegram channel:
   - create a new channel (can be private)
   - add your bot as an admin with "post messages" permission
   - get the channel id:
     - for public channels: use `@channelname`
     - for private channels: forward a message from the channel to [@userinfobot](https://t.me/userinfobot) to get the id

3. update your `.env.local` with the bot token and channel id

4. test the telegram connection:
   ```bash
   pnpm test:telegram
   ```

## database setup

1. make sure postgresql is installed and running
2. create the database:
   ```bash
   # using psql
   psql -U postgres -c "CREATE DATABASE goster;"
   ```
3. generate prisma client and push schema:
   ```bash
   # generate prisma client
   pnpm prisma generate
   
   # push the database schema
   pnpm db:push
   
   # or use the setup script
   pnpm db:setup
   ```

## docker setup

### quick start with docker compose

1. create a `.env` file with your configuration:
   ```bash
   cp .env.example .env
   # edit .env with your database url and telegram credentials
   ```

2. build and run with docker compose:
   ```bash
   # build and start the application
   docker-compose up --build

   # run in background
   docker-compose up -d --build

   # view logs
   docker-compose logs -f

   # stop the application
   docker-compose down
   ```

3. the app will be available at http://localhost:3000

note: this setup uses your existing database from the DATABASE_URL in your .env file

### building docker image manually

```bash
# build the image
docker build -t goster .

# run with environment variables
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://user:pass@host:5432/goster" \
  -e TELEGRAM_BOT_TOKEN="your_bot_token" \
  -e TELEGRAM_CHANNEL_ID="your_channel_id" \
  -e NEXT_PUBLIC_BASE_URL="http://localhost:3000" \
  goster
```

### docker environment variables

all environment variables from `.env` are supported:

- `NEXT_PUBLIC_BASE_URL`: public url of your application
- `DATABASE_URL`: postgresql connection string
- `TELEGRAM_BOT_TOKEN`: telegram bot token from @BotFather
- `TELEGRAM_CHANNEL_ID`: telegram channel for video storage

### docker volumes

- `postgres_data`: postgresql database files
- `uploads`: temporary video upload directory

## notes

- recordings are stored in telegram channels (with database fallback)
- videos up to 100mb are supported
- maximum recording time is 10 minutes
- telegram storage provides unlimited free video hosting
- links expire after 24 hours
- telegram messages are automatically deleted after 24 hours
- if telegram is not configured, videos fall back to database storage

## background jobs

the app includes automatic cleanup of expired telegram messages:
- runs every hour automatically
- deletes telegram messages older than 24 hours
- manual cleanup: `pnpm cleanup:telegram`