# AWS S3 Upload Guide for Kelby Games

## Files Ready for S3 Upload

Your **P** folder is now optimized for AWS S3 deployment.

## What to Upload

Upload **ALL** files and folders from the P directory:
- ✅ index.html
- ✅ games/ (entire folder)
- ✅ images/ (entire folder)
- ✅ portal-style.css
- ✅ portal-script.js
- ✅ manifest.json
- ✅ service-worker.js
- ✅ privacy-policy.html
- ✅ icon-192.png
- ✅ icon-512.png
- ✅ All other files

## Upload Methods

### Method 1: AWS Console (Easiest)
1. Go to S3 → kelby-games bucket
2. Click "Upload"
3. Drag and drop ALL files/folders from P directory
4. Click "Upload"

### Method 2: AWS CLI (Faster for updates)
```bash
aws s3 sync . s3://kelby-games --delete
```

## Important S3 Settings

### Content-Type Headers (Set these in S3)
After upload, set metadata for proper file serving:

**For HTML files:**
- Content-Type: `text/html`

**For CSS files:**
- Content-Type: `text/css`

**For JS files:**
- Content-Type: `application/javascript`

**For JSON files:**
- Content-Type: `application/json`

**For SVG files:**
- Content-Type: `image/svg+xml`

**For PNG files:**
- Content-Type: `image/png`

**For JPG files:**
- Content-Type: `image/jpeg`

**For MP3 files:**
- Content-Type: `audio/mpeg`

### Cache Control (Optional but Recommended)
Set cache headers for better performance:

**For static assets (images, icons):**
- Cache-Control: `public, max-age=31536000` (1 year)

**For HTML/JS/CSS:**
- Cache-Control: `public, max-age=3600` (1 hour)

## Files Removed (Netlify-specific)
- ❌ netlify.toml (not needed for S3)
- ❌ _redirects (not needed for S3)

## S3 Bucket Configuration

### Static Website Hosting
- Index document: `index.html`
- Error document: `index.html`

### Bucket Policy
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::kelby-games/*"
    }
  ]
}
```

## Verify Deployment

After upload, test these URLs:
- http://kelby-games.s3-website-us-east-1.amazonaws.com/
- http://kelby-games.s3-website-us-east-1.amazonaws.com/games/hangman/
- http://kelby-games.s3-website-us-east-1.amazonaws.com/games/dreamers-puzzle/

All should load correctly.

## Troubleshooting

**403 Forbidden Error:**
- Check bucket policy is applied
- Verify "Block public access" is OFF
- Check file permissions

**404 Not Found:**
- Verify files uploaded to root (not in subfolder)
- Check file names are correct (case-sensitive)

**Blank Page:**
- Check Content-Type headers
- Verify index.html is in root

## Cost Estimate

For your site (~50MB, low traffic):
- Storage: $0.001/month
- Requests: $0.01/month
- Data transfer: $0.50/month (first 10GB free)

**Total: ~$0.50-1.00/month**

## Next Steps

1. Upload all files to S3
2. Test S3 website endpoint
3. Configure Hostinger DNS
4. Wait for DNS propagation (10-30 min)
5. Test kelby.in

---

**Note:** Without CloudFront, you won't have HTTPS. PWAs require HTTPS to work properly.
