# wuzz-frontend

pnpm + Nx monorepo.

| App | What | Where it runs |
| --- | --- | --- |
| `apps/wuzz` | customer app (React Native) | Android / iOS |
| `apps/station` | station app (React Native) | Android / iOS |
| `apps/pos` | point of sale (Vite) | pos-stg.wuzz.care |
| `apps/backoffice` | admin (Vite) | admin-stg.wuzz.care |
| `apps/landing` | public landing, coming-soon page (Vite) | wuzz.care |

## Environments

`.env` is local, `.env.staging` and `.env.production` are those environments. They are git-ignored
(copy the `.env.example` next to them). Pick one when you run:

```
pnpm --filter @wuzz/pos dev               # .env             -> your local backend (make local)
pnpm --filter @wuzz/pos dev:staging       # .env.staging     -> https://api-stg.wuzz.care
pnpm --filter @wuzz/pos dev:production    # .env.production

cd apps/wuzz
pnpm android:local                        # .env             (com.koobam.wuzz.dev)
pnpm android:staging                      # .env.staging     (com.koobam.wuzz.staging)
pnpm android:production                   # .env.production  (com.koobam.wuzz)
pnpm ios:staging                          # the Staging scheme
```

The three Android and iOS variants have different application ids, so they install side by side.

## Seeing a change before it is merged (feature branches)

```
feature/<what>  ->  PR to develop  ->  CI + a preview  ->  look at it  ->  merge  ->  staging
```

1. Branch from `develop` as `feature/<what>` and open a PR to `develop`. CI runs on the PR.
2. **Web (POS, backoffice):** the PR gets its own preview automatically and a comment with the
   link, `https://<branch>.wuzz-pos-stg.pages.dev` and `https://<branch>.wuzz-admin-stg.pages.dev`.
   It talks to the staging API. Staging itself is not touched, and every push to the branch
   updates the same preview. (Needs the `CLOUDFLARE_*` secrets; without them no preview is made.)
3. **App (Android):** *Actions > Android > Run workflow*, and under *Use workflow from* pick your
   branch, app `wuzz`, environment `staging`. Download the APK from the run's artifacts; its name
   carries the branch. It installs next to the production app.
4. **Backend:** see the backend repo's README ("Seeing a change on staging").
5. Merging to `develop` updates staging (the web apps when `PAGES_AUTO_DEPLOY=true`).

Previews are not cleaned up automatically; delete old ones in the Cloudflare dashboard (Workers & Pages > project > Deployments) when they pile up.
