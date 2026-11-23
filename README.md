# setup-flatc

This action installs the [flatc](https://github.com/google/flatbuffers) compiler
for use in your workflows.

## Requirements

`v2` uses the Node.js 24 action runtime and requires:

- GitHub Actions Runner v2.327.1 or newer
- macOS 13.4 or newer
- ARM32 runners are not supported

The `v1` line remains on the Node.js 20 runtime.

## Usage

Install the latest version:

```yaml
- name: Install latest flatc
  uses: Nugine/setup-flatc@v2
```

Install a specific version:

```yaml
- name: Install flatc
  uses: Nugine/setup-flatc@v2
  with:
    version: "24.12.23"
```

Install by a semver range:

```yaml
- name: Install flatc
  uses: Nugine/setup-flatc@v2
  with:
    version: "24.*"
```

Semver syntax: <https://github.com/npm/node-semver#ranges>

## Development

Development and CI use Node.js 26. The published action itself runs on the Node.js 24 action runtime.

```bash
npm ci
npm run ci
```
