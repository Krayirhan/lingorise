# Repository Control Matrix

| Control | Live verification available? | Current state | Evidence | Confidence |
|---|---|---|---|---|
| Repository identity / visibility | Yes | `Krayirhan/lingorise`, public, default `main` | Authenticated `gh repo view` | High |
| Branch protection | Yes | No protection on `main` | Authenticated branch-protection API: 404 “Branch not protected” | High |
| Rulesets | Yes | None | Authenticated rulesets API: `[]` | High |
| Required checks / reviews | Yes | Not enforced by a branch rule/ruleset | Same live protection/ruleset evidence | High |
| Force-push restriction | Yes | Not enforced by a branch rule/ruleset | Same live protection/ruleset evidence | High |
| Secret scanning | Yes | Disabled | Authenticated secret-scanning API response | High |
| Push protection | Partial | Not verified | Read endpoint returned Not Found; no inference made | Medium |
| Dependabot alerts | Yes | Disabled | Authenticated Dependabot alerts API response | High |
| Dependabot update configuration | Yes (repo file) | No `.github/dependabot.yml` | Repository inspection | High |
| Code scanning | Yes | No analysis found | Authenticated code-scanning API response | High |
| Current secret hygiene | Yes (bounded local) | No credible tracked secret found | Category scan; `.env.example` placeholders; false-positive binary excluded | Medium |
| Historical secret hygiene | Yes (bounded local) | No selected-category hit | All-ref name-only category history check | Medium |
| Environment-file hygiene | Yes | `.env` and variants ignored; example allowed | `.gitignore`, `.env.example` | High |
| Local tool config hygiene | Yes | `.mcp.json` ignored; Claude local settings globally ignored | `git check-ignore` | High |

`SUPPLY-QA-001`: no enforced merge gate. `SUPPLY-QA-002`: disabled secret scanning. Neither result proves organization-wide access policy or push protection state.
