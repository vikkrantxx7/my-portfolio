## Rules

- Edit the agentic wiki Markdown source and regenerate its lock with the metadata-pinned gh-aw compiler; never hand-edit the lock, because it embeds source hashes and engine-specific setup.
- Gemini runs through `aw/gemini-api-key.cjs`, selecting API-key auth without changing the proxy or forwarding real credentials into the sandbox, to avoid Gemini 0.55.1's rejected inferred gateway auth.
- CI (`workflows/ci.yml`) recompiles the wiki with its checksum-verified pinned compiler and rejects lock drift before lint, coverage tests and build, so source formatting and dependency changes cannot silently stale the workflow.
