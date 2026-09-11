# Changelog

All notable changes to this project will be documented in this file.

This project follows the [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
format and uses semantic versioning when versioned releases are published.

## [Unreleased]

### Fixed

- Keep session state at the repository root when commands run from a subdirectory.
- Declare `"types": ["node"]` in `tsconfig.json` so TypeScript 7 resolves
  Node.js types; the 7.0.2 bump had broken `tsc` with ~80 TS2591/TS2339/TS7006
  errors on `main`.

### Added

- Test Node.js 24 in CI and use it for release automation while retaining Node.js 20 as the minimum supported runtime.
- Initial project setup.

## Release Links

- Unreleased:
  `https://github.com/rogerchappel/agenthandoff/compare/...HEAD`
- Latest release:
  `https://github.com/rogerchappel/agenthandoff/releases/latest`

Replace placeholder links once the first release tag exists.
