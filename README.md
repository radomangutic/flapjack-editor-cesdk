# FlapJack Editor

Menu editor.

## Requirements

This project uses [Supabase](https://supabase.com/) for the database.

To be able to run this project, make sure you have these installed on your local machine:

- [Node](https://nodejs.org/en)
- [Docker](https://docs.docker.com/engine/install/)
- [Yarn](https://classic.yarnpkg.com/lang/en/docs/install/#debian-stable) as the package manager

## Available Commands

### `yarn dev`

Run the development server.

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.tsx`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/api-routes/introduction) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.ts`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

### `yarn db:start`

Start the local database.

To start the local database, make sure you have **docker-daemon** running.

After starting the local database, you can go to [localhost:54323](http://localhost:54323) to interract with the supabase interface.

Then create a `.env.development` file following the structure of the [.env.example](./.env.example) and update the `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` with the keys you got.

### `yarn db:stop`

Stop the local database.

All the data you have added to the database will be deleted.

If you want to persist your newly added data, run

```bash
yarn db:stop --backup
```

### `yarn test:e2e`

Run all the end-to-end tests.

Requires to start the database before running the tests.

### `yarn test:e2e:headless`

Test the application without the UI.

Requires to start the database before running the tests.
