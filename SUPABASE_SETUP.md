# Supabase Setup Guide

Follow these steps once to connect the app to Supabase.

---

## 1. Create a Supabase project

1. Go to https://supabase.com and sign in.
2. Click **New Project**.
3. Choose a name (e.g. `composition-support`), select a region close to you, set a strong database password.
4. Wait ~2 minutes for the project to be ready.

---

## 2. Get your project credentials

1. In the Supabase dashboard, go to **Settings → API**.
2. Copy:
   - **Project URL** (e.g. `https://abcdefgh.supabase.co`)
   - **anon public key** (long JWT string)

3. Open `apps/mobile/.env` and fill them in:
   ```
   EXPO_PUBLIC_SUPABASE_URL=https://abcdefgh.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...your_anon_key...
   ```

---

## 3. Run the database migration

1. In the Supabase dashboard, go to **SQL Editor → New query**.
2. Paste the entire contents of `supabase/migrations/20240101000000_initial.sql`.
3. Click **Run**.

This creates:
- `profiles` table (auto-populated on sign-up via trigger)
- `subscriptions` table (populated by Stripe webhook)
- Row Level Security policies
- `handle_new_user` trigger (auto-creates profile row after Google OAuth)

---

## 4. Enable Google OAuth

### In Google Cloud Console

1. Go to https://console.cloud.google.com
2. Create a new project (or use an existing one).
3. Go to **APIs & Services → OAuth consent screen**:
   - User type: **External**
   - Fill in App name, support email, developer email
   - Save
4. Go to **APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID**:
   - Application type: **Web application**
   - Name: `composition-support`
   - Authorized redirect URIs — add:
     ```
     https://YOUR_PROJECT_ID.supabase.co/auth/v1/callback
     ```
     (replace `YOUR_PROJECT_ID` with your actual Supabase project ID)
5. Click **Create** — copy the **Client ID** and **Client Secret**.

### In Supabase

1. Go to **Authentication → Providers → Google**.
2. Toggle **Enable**.
3. Paste the **Client ID** and **Client Secret** from Google Cloud.
4. Save.

---

## 5. Configure GitHub Actions secrets

In your GitHub repository, go to **Settings → Secrets and variables → Actions → New repository secret**, and add:

| Secret name | Value |
|---|---|
| `EXPO_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key |
| `EXPO_TOKEN` | Your Expo access token (from https://expo.dev/accounts/[user]/settings/access-tokens) |
| `VERCEL_TOKEN` | Your Vercel token (from https://vercel.com/account/tokens) |
| `VERCEL_ORG_ID` | Your Vercel org ID (from `vercel whoami` or project settings) |
| `VERCEL_PROJECT_ID` | Your Vercel project ID |

---

## 6. Deploy to Vercel

1. Push the monorepo to GitHub.
2. Go to https://vercel.com → **New Project → Import Git Repository**.
3. Select the repo.
4. Set the **Root Directory** to `apps/mobile`.
5. Set **Output Directory** to `dist`.
6. Add environment variables:
   - `EXPO_PUBLIC_SUPABASE_URL`
   - `EXPO_PUBLIC_SUPABASE_ANON_KEY`
7. Deploy.

After the first deploy, copy the **Vercel project ID** and **org ID** into GitHub Actions secrets (step 5 above) so future pushes to `main` deploy automatically.

---

## 7. Set up EAS (mobile OTA updates)

```bash
npm install -g eas-cli
eas login
cd apps/mobile
eas update:configure
```

Then push to `main` — GitHub Actions will run `eas update --auto` for OTA updates.

For a full native build (APK/IPA):
```bash
eas build --platform android
eas build --platform ios
```

---

## 8. Stripe (deferred to launch)

The Edge Function base is already created at `supabase/functions/stripe-webhook/`.

When ready to enable payments:
1. Create a Stripe account.
2. Add your Stripe secret key to Supabase secrets:
   ```bash
   supabase secrets set STRIPE_SECRET_KEY=sk_live_...
   supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
   ```
3. Deploy the function:
   ```bash
   supabase functions deploy stripe-webhook
   ```
4. In Stripe Dashboard, create a webhook pointing to:
   ```
   https://YOUR_PROJECT_ID.supabase.co/functions/v1/stripe-webhook
   ```
   with events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`.
