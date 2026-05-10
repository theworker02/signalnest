# SignalNest SDK and CLI

The SignalNest SDK wraps the local SignalNest API and ships a terminal command
named `signalnest`.

## Local install

From the repository root:

```bash
npm install
npm run build --workspace @signalnest/sdk
npm link --workspace @signalnest/sdk
```

Then run:

```bash
signalnest health
signalnest trackers list
signalnest trackers create --title "Competitor pricing" --kind website --source https://example.com/pricing --tags pricing,competitor
```

## Environment

```bash
SIGNALNEST_API_URL=http://127.0.0.1:4040/api
SIGNALNEST_API_KEY=sn_live_key_replace_me
```

The key is optional in local development, but production integrations should
send it as a bearer token.
