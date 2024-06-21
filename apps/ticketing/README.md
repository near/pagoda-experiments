# Ticketing

https://github.com/near/near-discovery/issues/1165

Please refer to the `Getting Started` section in our [root README.md](../../README.md) file.

## Apple Wallet Integration

We support `Add To Wallet` via [Wallet Passes](https://developer.apple.com/documentation/walletpasses) in combination with [pass-js](https://github.com/tinovyatkin/pass-js). To run this integration locally, you'll need to pull down our certificate key file:

- In our Pagoda 1Password team account, navigate to the `Event Ticketing` vault
- If you can't access the vault, Caleb Jacob can give you access
- Download the `pass.com.pagoda.ticketing.pem` file
- Save it to `apps/ticketing/secrets/pass.com.pagoda.ticketing.pem`
- This folder/file will be ignored by `.gitignore`
- Copy over `Environment Variables` into `apps/ticketing/.env.local` to retrieve value for `APPLE_WALLET_CERTIFICATE_PASSWORD`

## Google Wallet Integration

We support `Add To Wallet` via Google's [JWT](https://developers.google.com/wallet/tickets/events/use-cases/jwt) flow. To run this integration locally, you'll need to pull down our credentials file:

- In our Pagoda 1Password team account, navigate to the `Event Ticketing` vault
- If you can't access the vault, Caleb Jacob can give you access
- Download the `google-wallet-pagoda-ticketing.json` file
- Save it to `apps/ticketing/secrets/google-wallet-pagoda-ticketing.json`
- This folder/file will be ignored by `.gitignore`
