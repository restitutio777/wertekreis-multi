# Deployment Instructions for Shared Hosting

## Prerequisites
- Node.js installed locally (for building)
- FTP/SFTP access to your shared hosting server
- Your Supabase credentials configured in `.env` file

## Step 1: Build the Application

```bash
# Install dependencies (if not already done)
npm install

# Build the production version
npm run build
```

This creates a `dist` folder with all the static files needed for deployment.

## Step 2: Environment Variables Setup

### For Shared Hosting (Static Deployment):
Since shared hosting serves static files, environment variables need to be set at build time.

1. Create a `.env` file in your project root:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

2. These variables will be embedded in the built files during `npm run build`

## Step 3: Upload Files to Shared Hosting

### Option A: FTP/SFTP Upload
1. Connect to your shared hosting server via FTP/SFTP
2. Navigate to your domain's public folder (usually `public_html` or `www`)
3. Upload ALL contents of the `dist` folder to this directory
4. Ensure the `.htaccess` file is uploaded and visible

### Option B: File Manager (cPanel)
1. Log into your hosting control panel
2. Open File Manager
3. Navigate to `public_html` or your domain's root folder
4. Upload and extract the `dist` folder contents
5. Ensure `.htaccess` file is present

## Step 4: Verify Deployment

### Check these items:
- [ ] Website loads at your domain
- [ ] All pages are accessible (routing works)
- [ ] Images and assets load correctly
- [ ] Supabase connection works (try login/signup)
- [ ] Map functionality works
- [ ] Mobile responsiveness is maintained

## Step 5: Domain Configuration

### If using a subdomain:
- Update your DNS settings to point to the hosting server
- Wait for DNS propagation (up to 24 hours)

### If using the main domain:
- Ensure files are in the correct public folder
- Check that index.html is the default document

## Troubleshooting

### Common Issues:

#### 1. **404 Errors on Page Refresh**
- **Problem**: React Router routes don't work on direct access
- **Solution**: Ensure `.htaccess` file is uploaded and mod_rewrite is enabled

#### 2. **Assets Not Loading**
- **Problem**: Incorrect base path configuration
- **Solution**: Verify `base: './'` is set in `vite.config.ts`

#### 3. **Supabase Connection Issues**
- **Problem**: Environment variables not set correctly
- **Solution**: Rebuild with correct `.env` file

#### 4. **Slow Loading**
- **Problem**: Large bundle sizes
- **Solution**: Check if compression is enabled in `.htaccess`

## File Structure After Upload

Your hosting directory should look like:
```
public_html/
├── index.html
├── .htaccess
├── assets/
│   ├── index-[hash].js
│   ├── index-[hash].css
│   └── [other assets]
├── manifest.json
├── robots.txt
├── sitemap.xml
└── [other static files]
```

## Performance Optimization

### Already Configured:
- ✅ Gzip compression
- ✅ Browser caching
- ✅ Code splitting
- ✅ Asset optimization

### Additional Recommendations:
- Enable CDN if available through your hosting provider
- Monitor Core Web Vitals after deployment
- Set up uptime monitoring

## Security Considerations

### Implemented:
- ✅ Security headers in `.htaccess`
- ✅ Sensitive file protection
- ✅ XSS protection
- ✅ Content type validation

### Additional Steps:
- Regularly update Supabase keys if compromised
- Monitor for unusual traffic patterns
- Keep hosting environment updated

## Support

If you encounter issues:
1. Check browser console for errors
2. Verify `.htaccess` file is working
3. Test Supabase connection separately
4. Contact your hosting provider for server-specific issues

## Maintenance

### Regular Tasks:
- Monitor application performance
- Update dependencies periodically
- Backup your built files
- Check for broken links or features

Your Werte•Kreis spiritual community app is now ready for shared hosting deployment! 🚀