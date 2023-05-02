# Merative.com (Phase 2)
merative.com on Adobe Franklin.

- Phase 2: Merative.com remaining site except blogs

## Environments
- Preview: https://main--merative2--hlxsites.hlx.page/
- Live: https://main--merative2--hlxsites.hlx.live/

## Installation

```sh
npm i
```

## Tests

```sh
npm run test
```

## Local development

1. Create a new repository based on the `helix-project-boilerplate` template and add a mountpoint in the `fstab.yaml`
1. Add the [helix-bot](https://github.com/apps/helix-bot) to the repository
1. Install the [Helix CLI](https://github.com/adobe/helix-cli): `npm install -g @adobe/helix-cli`
1. Start Helix Pages Proxy: `hlx up` (opens your browser at `http://localhost:3000`)
1. Open the `{repo}` directory in your favorite IDE and start coding :)

### Lint

```sh
npm run lint
```
