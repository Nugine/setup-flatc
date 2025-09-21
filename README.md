# Setup FlatBuffers Compiler (flatc)

This GitHub Action installs the [flatc](https://github.com/google/flatbuffers) compiler
for use in your workflows, enabling FlatBuffers schema compilation in CI/CD pipelines.

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

Install by a semver range:

```yaml
- name: Install flatc
  uses: Nugine/setup-flatc@v1
  with:
    version: "24.*"
```

Semver syntax: <https://jsr.io/@std/semver>
