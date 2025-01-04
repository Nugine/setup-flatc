# setup-flatc

This action installs the [flatc](https://github.com/google/flatbuffers) compiler
for use in your workflows.

## Usage

Install the latest version:

```yaml
- name: Install latest flatc
  uses: Nugine/setup-flatc@v1
```

Install a specific version:

```yaml
- name: Install flatc
  uses: Nugine/setup-flatc@v1
  with:
    version: "24.12.23"
```
