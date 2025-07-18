# göster

a simple screen recording sharing web app

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

- recordings are stored in postgresql database
- video files are stored as blobs in the database
- links expire after 24 hours