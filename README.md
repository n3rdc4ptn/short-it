# Short it

This is an url shortener for being run as a cloudflare worker.

## Usage

You need to deploy this worker to your cloudflare account.
Before deploying, you need to set the following variables in wrangler.toml:
```toml
%UNKEY_API_ID% = set it to your unkey api id; this is needed for having the shortener authenticated.

%CUSTOM_DOMAIN% = set it to your custom domain; this is the domain used for the shortener

%CLOUDFLARE_KV_NAMESPACE_ID% = set it to your cloudflare kv namespace id; this is needed for storing the short urls; you need to create a kv namespace for it.
```

You can use the following command to deploy it:

```bash
bunx wrangler deploy
```
