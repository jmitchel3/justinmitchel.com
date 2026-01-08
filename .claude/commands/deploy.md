Build and deploy justinmitchel.com to Cloudflare Pages.

## Steps

1. Run `npm run build` to build the Astro site
2. Deploy using wrangler:
   ```
   npx wrangler pages deploy dist --project-name justinmitchel-com --commit-dirty=true
   ```
   Note: Ensure `CLOUDFLARE_ACCOUNT_ID` is set in your environment or wrangler is authenticated.
3. Report the deployment URL when complete
