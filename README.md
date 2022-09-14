
# Local use

## Development

Create config files ".env.development" and ".env.production" at the same level as ".env". Set their values based on ".env.example" then run
```
npm install
npm run build:dev
npm start
```

## Production

Create config file ".env.production" at the same level as ".env". Set its values based on ".env.example" then run
```
npm install
npm run build
npm start
npm run deploy:fromlocal
```

# On AWS

Set environment variables "CDN_DIST_ID" and "S3_WEB_BUCKET" on CodeBuild based on ".env.example" values
