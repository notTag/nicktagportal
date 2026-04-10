---
phase: quick
plan: 260410-gwy
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/shell/src/data/techSkills.json
autonomous: false
must_haves:
  truths:
    - "Each skill in techSkills.json has a years value derived from Nick's career timeline"
    - 'No skill retains the placeholder value of 3 unless that is the correct derived value'
    - 'Nick has verified the years values are accurate'
  artifacts:
    - path: 'apps/shell/src/data/techSkills.json'
      provides: 'Skills data with real years of experience'
      contains: 'years'
  key_links: []
---

<objective>
Update the placeholder "years: 3" values on all 30 skills in techSkills.json with years of
experience derived from Nick's resume career timeline.

Purpose: Phase 06 set all skills to a placeholder of 3 years (per D-06 decision: "Placeholder
years value 3 on all 27 skills -- Nick updates with real values later"). This plan delivers
those real values.

Output: Updated techSkills.json with accurate years per skill.
</objective>

<context>
@apps/shell/src/data/techSkills.json
@apps/shell/src/types/skills.ts

Resume source: /Users/nicktag/Code/Resume/CompletedResumes/DirectorEngineeringResume-31626.tex

Career timeline (from resume):

- Jan 2013 - Jun 2016: Netsmart Technologies (Software Engineer) -- Jira migration, EHR features
- May 2017 - Nov 2018: DOOR3 / AIG (Senior Software Engineer) -- enterprise financial systems
- Dec 2018 - Mar 2020: BlueVoyant MSS Engineer -- backend services, SOC workflows, alert pipelines
- Mar 2020 - Apr 2022: BlueVoyant Senior Full-Stack -- customer-facing SaaS security platform
- Apr 2022 - Apr 2023: BlueVoyant Offshore Lead -- continued platform, distributed teams
- Apr 2023 - Jul 2025: BlueVoyant Tech Lead MDR -- APIs, architecture, DR, incident response
- Nov 2023 - Jul 2025: BlueVoyant Tech Lead SCD -- GraphQL, CI/CD, engineering standards

Resume explicitly lists these technologies: Golang, Vue, React, PostgreSQL, AWS, Docker, Splunk
Resume competency areas: Engineering Leadership, Platform & Architecture, Security & Operations, AI

NOTE: The resume does NOT contain per-skill year breakdowns. The years below are derived from
the career timeline and reasonable inference about when each tool was likely used. Nick MUST
verify these values in the checkpoint task.
</context>

<tasks>

<task type="auto">
  <name>Task 1: Update techSkills.json with derived years of experience</name>
  <files>apps/shell/src/data/techSkills.json</files>
  <action>
Update the `years` field for each skill in `apps/shell/src/data/techSkills.json` using the
values below. These are derived from Nick's resume career timeline (Jan 2013 through Jul 2025,
with current date April 2026 meaning ~9 months since last role ended).

The `years` field is a number (integer). Update each entry's `years` value to match this table.
Do NOT change any other fields (name, displayName, iconPath, category).

Derived years per skill (reasoning follows each):

| name           | displayName     | years | Reasoning                                                                                          |
| -------------- | --------------- | ----- | -------------------------------------------------------------------------------------------------- |
| splunk         | Splunk          | 7     | Explicitly listed in resume Technologies. Used at BlueVoyant (security/SOC) Dec 2018-Jul 2025      |
| datadog        | DataDog APM     | 5     | APM tool likely adopted at BlueVoyant during SaaS platform scaling, ~2020-2025                     |
| jira           | JIRA Metrics    | 11    | Used since Netsmart (led Jira migration 2013-2016), continuous use through career                  |
| terraform      | Terraform       | 5     | Infrastructure-as-code at BlueVoyant, likely adopted ~2020 during platform scaling                 |
| atlantis       | Atlantis        | 4     | Terraform PR automation, typically adopted after Terraform, ~2021-2025                             |
| ansible        | Ansible         | 5     | Config management at BlueVoyant, likely ~2020-2025                                                 |
| gitlab         | Gitlab          | 6     | CI/CD platform at BlueVoyant, resume mentions Gitlab Feature Flags. Dec 2018-Jul 2025              |
| github         | GitHub          | 11    | Used since early career (standard tool for any developer since ~2013+)                             |
| aws            | AWS             | 7     | Explicitly listed in resume Technologies. Used at BlueVoyant Dec 2018-Jul 2025                     |
| cloudflare     | Cloudflare      | 5     | CDN/infrastructure at BlueVoyant, likely ~2020-2025                                                |
| sqs            | SQS             | 6     | AWS messaging, used at BlueVoyant with event-driven architecture Dec 2018-Jul 2025                 |
| kafka          | Kafka           | 5     | Event-driven architecture at BlueVoyant, likely ~2020-2025                                         |
| vault          | HashiCorp Vault | 5     | Secrets management for security-sensitive SaaS, likely ~2020-2025                                  |
| cycode         | Cycode          | 3     | Supply chain security tool, likely adopted during SCD role Nov 2023-Jul 2025                       |
| casbin         | Casbin RBAC     | 4     | RBAC for SaaS platform, likely ~2021-2025                                                          |
| mysql          | MySQL           | 7     | Database used across career, Netsmart + DOOR3/AIG + BlueVoyant                                     |
| sql            | SQL             | 13    | Core skill used throughout entire career since Jan 2013                                            |
| go-testing     | Golang          | 7     | Explicitly listed in resume Technologies. Primary backend language at BlueVoyant Dec 2018-Jul 2025 |
| jwt            | JWT             | 7     | Auth tokens for SaaS platform, used at BlueVoyant Dec 2018-Jul 2025                                |
| iam            | AWS IAM         | 7     | AWS identity management, used alongside AWS at BlueVoyant Dec 2018-Jul 2025                        |
| okta           | Okta            | 5     | Enterprise SSO/identity, likely adopted during SaaS platform maturity ~2020-2025                   |
| opsgenie       | OpsGenie        | 5     | Incident management, likely adopted during BlueVoyant ~2020-2025                                   |
| slack          | Slack           | 8     | Team communication, standard since ~2017 (DOOR3/AIG onward)                                        |
| swagger        | Swagger         | 8     | API documentation, used since DOOR3/AIG (May 2017) through BlueVoyant                              |
| postman        | Postman         | 10    | API testing tool, used since early career ~2015+                                                   |
| gitlab-ff      | Gitlab FF       | 4     | Feature flags via Gitlab, likely adopted ~2021-2025                                                |
| unleash        | Unleash         | 3     | Feature flag platform, likely adopted during SCD/MDR lead roles 2023-2025                          |
| cloudflare-cdn | Cloudflare CDN  | 5     | CDN caching via Cloudflare, likely ~2020-2025                                                      |
| matomo         | Matomo          | 4     | Privacy-focused analytics, likely adopted ~2021-2025                                               |
| uptime         | Uptime / SLAs   | 6     | SLA tracking at BlueVoyant, from MSS role onward Dec 2018-Jul 2025                                 |

Preserve the exact JSON formatting style (one object per line, double-quoted keys, trailing newline).
</action>
<verify>
<automated>cd /Users/nicktag/Code/Projects/nicktagtech/nicktagportal && bun run --cwd apps/shell test -- --run 2>&1 | tail -20</automated>
</verify>
<done>All 30 skills in techSkills.json have updated years values. No other fields changed. All existing tests pass.</done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <what-built>
Updated all 30 skills in techSkills.json with years of experience derived from the resume
career timeline. The derivation is based on when each technology was likely first used at
which company, calculated through July 2025 (end of last role).

Summary of changes (sorted by years descending):

- 13 years: SQL
- 11 years: JIRA Metrics, GitHub
- 10 years: Postman
- 8 years: Slack, Swagger
- 7 years: Splunk, AWS, MySQL, Golang, JWT, AWS IAM
- 6 years: Gitlab, SQS, Uptime/SLAs
- 5 years: DataDog APM, Terraform, Ansible, Cloudflare, Kafka, Vault, Okta, OpsGenie, Cloudflare CDN
- 4 years: Atlantis, Casbin RBAC, Gitlab FF, Matomo
- 3 years: Cycode, Unleash
  </what-built>
  <how-to-verify>

1. Review the years values in `apps/shell/src/data/techSkills.json`
2. Compare against your actual experience with each tool
3. Adjust any values that feel incorrect -- these were derived from resume dates, not firsthand knowledge
4. Run the dev server (`cd apps/shell && bun run dev`) and visit the Skills page to see the updated values in the diamond info panels
   </how-to-verify>
   <resume-signal>Type "approved" if all years look correct, or list corrections as "skillName: X years" (e.g., "splunk: 5, kafka: 3")</resume-signal>
   </task>

</tasks>

<verification>
- All 30 skills have non-placeholder years values (unless 3 is genuinely correct for that skill)
- `bun run --cwd apps/shell test -- --run` passes (tests use their own fixture data, not techSkills.json)
- Skills page renders correctly with updated years in info panels
</verification>

<success_criteria>

- techSkills.json updated with Nick-verified years of experience for all 30 skills
- No test regressions
- Skills page displays accurate years in diamond info panels
  </success_criteria>

<output>
No summary file needed for quick tasks.
</output>
