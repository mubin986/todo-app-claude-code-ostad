// Enforces the Conventional Commits spec (https://www.conventionalcommits.org).
// Used by the commit-lint GitHub Action and consumed indirectly by the
// release-draft workflow (TriPSs/conventional-changelog-action).
module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    // Allowed commit types. Keep in sync with CLAUDE.md.
    "type-enum": [
      2,
      "always",
      [
        "feat", // a new feature (bumps minor)
        "fix", // a bug fix (bumps patch)
        "docs", // documentation only
        "style", // formatting, no code-meaning change
        "refactor", // neither fixes a bug nor adds a feature
        "perf", // performance improvement
        "test", // adding or fixing tests
        "build", // build system or dependencies
        "ci", // CI configuration
        "chore", // other changes that don't modify src/test
        "revert", // reverts a previous commit
      ],
    ],
  },
};
