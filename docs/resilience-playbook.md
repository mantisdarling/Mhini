# Defensive Resilience Playbook

This playbook defines the no-cost controls that can be maintained in the repository and existing deployment. It is an operational guide, not legal advice. A real incident may require qualified counsel, a privacy specialist, the hosting providers, and any legally required notifications.

## Scope and assumptions

The portfolio is a public Vite and React site with a protected Studio area, a serverless Express boundary, Supabase-backed data, object-storage snapshots, and a daily recovery callback. The free operating model does not provide a private network firewall, immutable object-lock storage, provider-wide secret rotation, or a dedicated security operations center. Those controls remain explicit future upgrades rather than being implied by application code.

Threat modeling is used here to identify assets, trust boundaries, threat agents, and mitigations before an incident occurs.[1] The review follows a practical system model rather than claiming that a source scan can prove the absence of every zero-day vulnerability.

## Threat model

| Asset or boundary | Threat | Defensive control | Verification |
| --- | --- | --- | --- |
| Public route and static assets | Cross-site scripting or unsafe content injection | React escaping, constrained URL schemes, CSP, no dynamic HTML insertion in portfolio data | Unit tests, source scan, deployed headers |
| Studio authentication | Unauthorized project management | Protected procedures, owner role check, server-side authorization, generic error responses | Auth and application regression tests |
| Project URLs and image URLs | JavaScript URL execution or redirect abuse | HTTP and HTTPS scheme validation, no arbitrary protocol handling | Schema tests and manual negative cases |
| Storage object keys | Path traversal or unintended object access | Key normalization and traversal rejection before storage access | Storage boundary tests |
| API and request bodies | Oversized or malformed input | Bounded body size, Zod validation, typed procedures, generic errors | Application tests and request boundary review |
| Dependencies and build tools | Supply-chain compromise or vulnerable transitive package | Locked installs, dependency audit, Dependabot updates, pull-request security gates | CI workflow and `pnpm audit` |
| Snapshots and recovery metadata | Ransomware, accidental deletion, or corrupted backup | Checksum-backed snapshots, separate metadata, scheduled creation, restore drill before relying on recovery | Snapshot tests and staging drill checklist |
| Logs and incident evidence | Secret or stack-trace disclosure | Redacted provider errors, no client stack traces, limited diagnostic output | Error boundary and server tests |

## Continuous free controls

The repository now contains a pull-request and main-branch workflow that installs from the lockfile, runs tests and type checking, audits dependencies, and scans tracked source files for common credential markers. GitHub Dependabot is configured to open monthly update requests for npm dependencies and GitHub Actions. These controls reduce exposure to known issues, but they cannot guarantee protection from a newly disclosed or unpublished zero-day.

The local secret scan intentionally checks source markers rather than environment values. Secrets must remain in the deployment provider’s secret store and should never be committed. Rotation is an owner-operated procedure: create a replacement credential in the provider, update the deployment secret, verify the health and authentication paths, then revoke the old credential. Do not rotate a live credential blindly during an outage.

## Backup and restore drill

The existing daily snapshot callback creates a checksum-backed snapshot of managed project records and stores metadata with the object reference. A deterministic restore drill should be performed against a disposable staging database or exported local fixture, never against production. The drill must verify that the downloaded object matches the recorded SHA-256 checksum, that the row count matches metadata, that URLs remain valid under the schema, and that the application can read the restored records.

The pass criteria are a matching checksum, matching record count, successful parse, successful schema validation, and a written record of the operator, date, source snapshot, destination, and result. If a drill fails, keep the original snapshot, stop any production restore attempt, investigate the mismatch, and create a new snapshot only after the cause is understood. The existing production readiness report records that a full staging restoration drill remains an owner-operated gate.

## Incident response

NIST’s current incident-response guidance organizes response around preparation, detection and analysis, response, and recovery considerations.[2] For this project, the practical sequence is:

1. **Prepare.** Keep the repository workflow enabled, maintain the owner contact path, know where Vercel, Supabase, GitHub, and storage audit records are located, and confirm that the latest recovery snapshot has a known checksum.
2. **Detect and preserve.** Record the first observed time, affected URL, deployment identifier, request identifiers, screenshots, relevant provider logs, and the exact symptoms. Do not edit or delete evidence. Avoid placing secrets or personal data in issue comments.
3. **Contain.** If account compromise is suspected, revoke active sessions and rotate affected credentials through the provider. If a deployment is suspect, pause further releases and move traffic to the last known-good deployment using the hosting provider’s controls. Do not run destructive commands against the database while the scope is unknown.
4. **Eradicate and recover.** Identify the vulnerable commit, dependency, credential, or data path. Patch and test in a separate branch. Restore only to a disposable destination first, validate checksums and record counts, and then follow the provider-approved production recovery procedure if required.
5. **Notify and learn.** Determine notification duties with qualified legal and privacy professionals. Document the timeline, root cause, affected data classes, containment actions, recovery evidence, and follow-up controls. Add a regression test for the verified failure mode.

## Safe penetration-test simulation

The repository can safely validate application boundaries without an intrusive production attack. The approved simulation set is read-only and non-destructive: send malformed but bounded inputs to validation tests, verify unauthenticated access is rejected, test unsafe URL schemes, test traversal-shaped storage keys, confirm generic error responses, and confirm that known dependency and credential-marker checks fail closed. Do not attempt credential stuffing, denial of service, destructive SQL, provider-wide scanning, firewall evasion, or exploitation of third-party infrastructure.

A successful application simulation does not prove that Vercel or Supabase detected an intrusion, because those provider controls and logs are outside the application test boundary. The correct result is evidence that the application rejects the tested inputs and that the owner knows which provider console actions are required for containment.

## References

[1]: https://cheatsheetseries.owasp.org/cheatsheets/Threat_Modeling_Cheat_Sheet.html "OWASP Threat Modeling Cheat Sheet"
[2]: https://csrc.nist.gov/pubs/sp/800/61/r3/final "NIST SP 800-61 Rev. 3, Incident Response Recommendations and Considerations for Cybersecurity Risk Management"
[3]: https://docs.github.com/code-security/supply-chain-security/understanding-your-software-supply-chain/about-dependency-review "GitHub Dependency Review"
[4]: https://docs.github.com/code-security/dependabot/dependabot-version-updates/about-dependabot-security-updates "GitHub Dependabot Security Updates"
