# Contributing to setup-flatc

## Pull Request Guidelines

### Title Format

Pull request titles should be descriptive and follow these guidelines:

- Use English language
- Describe the change or feature being implemented
- For this GitHub Action, titles should reflect the setup functionality, e.g.:
  - "Set up FlatBuffers compiler (flatc) for GitHub Actions"
  - "Add support for version X.Y.Z"
  - "Fix installation issue on platform XYZ"

### Avoid

- Self-referential titles like "Fix PR title"
- Work-in-progress markers like "[WIP]" in final titles
- Non-English languages in titles for this English-language repository

## Development

This project uses Deno for development:

```bash
# Format, lint, and check
deno fmt
deno lint
deno check .

# Bundle for distribution
deno run -A scripts/bundle.ts
```

## Testing

The CI pipeline will test your changes across multiple platforms and Node.js versions.