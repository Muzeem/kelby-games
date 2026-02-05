# Deployment Guide

Complete guide for deploying Kelby Games to various hosting platforms.

## Quick Deploy Options

### Option 1: GitHub Pages (Recommended for Open Source)

1. **Enable GitHub Pages**
   - Go to repository Settings → Pages
   - Source: Deploy from branch `main`
   - Folder: `/ (root)`
   - Save

2. **Access your site**
   ```
   https://yourusername.github.io/kelby-games/
   ```

3. **Custom Domain (Optional)**
   - Add `CNAME` file with your domain
   - Configure DNS with your provider
   - Enable HTTPS in GitHub Pages settings

### Option 2: Netlify (Recommended for Production)

1. **Connect Repository**
   - Sign up at [netlify.com](https://netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Connect to GitHub and select repository

2. **Build Settings**
   ```
   Build command: (leave empty)
   Publish directory: .
   ```

3. **Deploy**
   - Click "Deploy site"
   - Site will be live at `random-name.netlify.app`

4. **Custom Domain**
   - Go to Site settings → Domain management
   - Add custom domain
   - Configure DNS as instructed
   - SSL certificate auto-generated

### Option 3: Vercel

1. **Import Project**
   - Sign up at [vercel.com](https://vercel.com)
   - Click "Add New" → "Project"
   - Import from GitHub

2. **Configure**
   ```
   Framework Preset: Other
   Build Command: (leave empty)
   Output Directory: .
   ```

3. **Deploy**
   - Click "Deploy"
   - Live at `project-name.vercel.app`

### Option 4: AWS S3 + CloudFront

1. **Create S3 Bucket**
   ```bash
   aws s3 mb s3://kelby-games
   ```

2. **Upload Files**
   ```bash
   aws s3 sync . s3://kelby-games --delete
   ```

3. **Enable Static Website Hosting**
   ```bash
   aws s3 website s3://kelby-games \
     --index-document index.html \
     --error-document index.html
   ```

4. **Set Bucket Policy**
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [{
       "Sid": "PublicReadGetObject",
       "Effect": "Allow",
       "Principal": "*",
       "Action": "s3:GetObject",
       "Resource": "arn:aws:s3:::kelby-games/*"
     }]
   }
   ```

5. **Create CloudFront Distribution**
   - Origin: S3 bucket website endpoint
   - Enable HTTPS
   - Set custom domain (optional)

## Pre-Deployment Checklist

### Code Quality
- [ ] All games tested and functional
- [ ] No console errors
- [ ] All links working
- [ ] Images optimized
- [ ] Code minified (if using build process)

### Performance
- [ ] Lighthouse score 90+
- [ ] Images compressed
- [ ] Lazy loading implemented
- [ ] Service workers registered
- [ ] Cache headers configured

### SEO & Metadata
- [ ] Meta descriptions on all pages
- [ ] Open Graph tags
- [ ] Sitemap.xml (optional)
- [ ] Robots.txt (optional)
- [ ] Favicon present

### Security
- [ ] HTTPS enabled
- [ ] Content Security Policy
- [ ] No sensitive data in code
- [ ] Privacy policy accessible
- [ ] CORS configured (if needed)

### Accessibility
- [ ] ARIA labels present
- [ ] Keyboard navigation works
- [ ] Color contrast sufficient
- [ ] Screen reader tested
- [ ] Touch targets sized properly

## Environment-Specific Configuration

### Development
```bash
# Local server
python -m http.server 8000
# or
npx serve .
```

### Staging
- Deploy to staging branch
- Test thoroughly
- Get stakeholder approval

### Production
- Deploy to main branch
- Monitor for errors
- Check analytics (if any)

## Continuous Deployment

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: .
```

### Netlify Auto-Deploy
- Automatically deploys on push to main
- Preview deployments for pull requests
- Rollback capability

## Post-Deployment

### Verification Steps
1. Visit homepage
2. Test each game
3. Check mobile responsiveness
4. Verify PWA installation
5. Test offline functionality
6. Check privacy policy link
7. Verify all images load
8. Test on multiple browsers

### Monitoring
- Check for 404 errors
- Monitor load times
- Review user feedback
- Check browser console for errors

## Rollback Procedure

### GitHub Pages
```bash
git revert HEAD
git push origin main
```

### Netlify
- Go to Deploys tab
- Click on previous successful deploy
- Click "Publish deploy"

### Vercel
- Go to Deployments
- Select previous deployment
- Click "Promote to Production"

## Custom Domain Setup

### DNS Configuration

**For Netlify:**
```
Type: A
Name: @
Value: 75.2.60.5

Type: CNAME
Name: www
Value: your-site.netlify.app
```

**For GitHub Pages:**
```
Type: A
Name: @
Value: 185.199.108.153
Value: 185.199.109.153
Value: 185.199.110.153
Value: 185.199.111.153

Type: CNAME
Name: www
Value: yourusername.github.io
```

### SSL Certificate
- Automatically provided by hosting platforms
- Usually takes 5-30 minutes to provision
- Force HTTPS in hosting settings

## Performance Optimization

### CDN Configuration
- Enable automatic CDN (included with most hosts)
- Set cache headers
- Enable compression (gzip/brotli)

### Cache Headers
```
# Static assets (1 year)
Cache-Control: public, max-age=31536000, immutable

# HTML (1 hour)
Cache-Control: public, max-age=3600

# Service Worker (no cache)
Cache-Control: no-cache
```

## Troubleshooting

### Common Issues

**404 on game pages:**
- Check file paths are correct
- Ensure all files uploaded
- Verify folder structure

**PWA not installing:**
- Confirm HTTPS enabled
- Check manifest.json valid
- Verify service worker registered

**Images not loading:**
- Check image paths (absolute vs relative)
- Verify images uploaded
- Check file extensions match

**Slow loading:**
- Compress images
- Enable CDN
- Minify CSS/JS
- Check hosting location

## Cost Estimates

### Free Tier Options
- **GitHub Pages** - Free (public repos)
- **Netlify** - Free (100GB bandwidth/month)
- **Vercel** - Free (100GB bandwidth/month)

### Paid Options
- **AWS S3 + CloudFront** - ~$1-5/month (low traffic)
- **Custom hosting** - Varies by provider

## Support

For deployment issues:
- Check hosting provider documentation
- Review GitHub Issues
- Email: support@kelby.in

---

**Last Updated:** February 2025
