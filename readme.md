# göster

a simple screen recording sharing web app

## preview

<video src="https://github.com/byigitt/goster/raw/refs/heads/main/images/goster-demo.mp4" width="100%" controls>
  <a href="https://github.com/byigitt/goster/raw/refs/heads/main/images/goster-demo.mp4">View Demo Video</a>
</video>

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

create a `.env.local` file:

```
NEXT_PUBLIC_BASE_URL=http://localhost:3000
DATABASE_URL="postgresql://postgres:password@localhost:5432/goster?schema=public"

# Telegram Bot Configuration (for video storage)
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
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
   
   # or run the SQL file
   psql -U postgres < scripts/create-database.sql
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