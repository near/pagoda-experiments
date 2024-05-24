# Pagoda Experiments

This monorepo contains multiple product experiments built on the blockchain. These products will be aimed at a mix of end users and developers.

## Apps

- Ticketing (`apps/ticketing`): https://github.com/near/near-discovery/issues/1165

## Packages

- Pagoda UI (`packages/ui`). Our DIG components have been ported over and refactored into a shareable package for all of our apps in this monorepo. We'll continue to add more components to this package as we discover new components that should be reusable between apps.

## Getting Started

This project requires [pnpm](https://pnpm.io/installation) version `9.1.1`. The strict version requirement will help keep our lockfile consistent as more developers contribute.

This project also requires Node 20. If you use `nvm`, simply run:

```
nvm install
nvm use
```

Install all dependencies in the monorepo root:

```
pnpm i
```

Then navigate to a specific app and start up the development server:

```
cd ./apps/ticketing
pnpm dev
```

_NOTE: You'll most likely see a warning when starting up the server: `React does not recognize the fetchPriority prop`. You can safely ignore this for now. There's a fix for Next JS that hasn't been released quite yet: https://github.com/vercel/next.js/issues/65161_

Since each app compiles imports from `packages/ui` on its own via Next JS's [externalDir](https://stackoverflow.com/a/72842944) config option, you don't need to run any additional commands when needing to make changes inside `packages/ui`. Simply boot up one of the development servers inside the `apps` folder. Any changes to `packages/ui` will be detected and hot reloaded automatically by the Next JS development server.

## Contributing

Since we're in the early MVP phase and will be moving fast, we can simply create feature branches based off of `main` and open up PR's that will merge directly to `main`. Once the project matures, we'll introduce a `develop` branch and preview deploy environment.

## Deployment

TODO: https://github.com/near/pagoda-experiments/issues/16

This project currently doesn't deploy anywhere.
