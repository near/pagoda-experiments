# Pagoda Experiments

This monorepo contains product experiments built on the blockchain.

## Apps

- Ticketing (`apps/ticketing`): https://github.com/near/near-discovery/issues/1165

## Getting Started

This project requires [pnpm](https://pnpm.io/installation) version `9.7.0`. The strict version requirement will help keep our lockfile consistent as more developers contribute.

This project also requires Node 20. If you use `nvm`, simply run:

```bash
nvm install
nvm use
```

Make sure you have the correct version of `pnpm` installed:

```bash
pnpm -v # This should output 9.7.0
npm install -g pnpm@9.7.0 # Install the correct version if needed
```

Install all dependencies in the monorepo root:

```bash
pnpm i
```

Then navigate to a specific app and start up the development server:

```bash
cd ./apps/ticketing
pnpm dev
```

_NOTE: You'll most likely see a warning when starting up the server: `React does not recognize the fetchPriority prop`. You can safely ignore this for now. There's a fix for Next JS that hasn't been released quite yet: https://github.com/vercel/next.js/issues/65161_

### Environment Variables

If the app you're developing against contains an `.env.example` config file, make a copy of it to configure your own variable values locally:

```bash
cp .env.example .env.local
```

## Contributing

Since we're in the early MVP phase and will be moving fast, we can simply create feature branches based off of `main` and open up PR's that will merge directly to `main`. Once the project matures, we'll introduce a `develop` branch and preview deploy environment.

Whenever you commit, our [Husky](https://typicode.github.io/husky/) plugin will run the `pre-commit` command to run Prettier and ES Lint. It will exit with a warning if any issues are reported. You can resolve fixable issues from the project root:

```bash
pnpm format:fix
pnpm lint:fix
git add -A
```

TODO: Update the `pre-commit` command to only run against files that have been staged for your current commit. Right now it runs against the entire project.

## Deployment

The main branch deploys to Vercel @ https://pagoda-experiments-ticketing.vercel.app/. Each pull-request will get its own Vercel deployment added onto the PR.
