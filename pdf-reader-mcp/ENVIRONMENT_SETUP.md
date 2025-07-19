# Invoice Ninja Environment Setup Guide

This guide explains how to configure the environment variables for your Invoice Ninja Docker setup.

## Quick Setup

1. **Copy Environment Template**
   ```bash
   cp .env.example .env
   ```

2. **Generate APP_KEY**
   
   **Windows (PowerShell):**
   ```powershell
   .\scripts\generate-app-key.ps1
   ```
   
   **Linux/Mac:**
   ```bash
   chmod +x scripts/generate-app-key.sh
   ./scripts/generate-app-key.sh
   ```
   
   **Manual Method:**
   ```bash
   docker run --rm invoiceninja/invoiceninja-debian:latest php artisan key:generate --show
   # Copy the output and replace APP_KEY in .env file
   ```

3. **Customize Settings**
   Edit `.env` file with your preferred settings (see sections below)

## Key Configuration Sections

### Application Settings
```env
APP_URL=http://localhost:8080          # Change to your domain
APP_ENV=production                     # Use 'local' for development
APP_DEBUG=false                        # Set to 'true' for debugging
```

### Database Configuration
```env
DB_DATABASE=invoiceninja              # Database name
DB_USERNAME=invoiceninja              # Database user
DB_PASSWORD=secure_ninja_password     # Change this password!
DB_ROOT_PASSWORD=secure_root_password # Change this password!
```

### Initial User Setup
```env
IN_USER_EMAIL=admin@invoiceninja.test # Your admin email
IN_PASSWORD=SecurePassword123!        # Your admin password
```
**Important:** Remove these variables after first setup for security.

### PDF Generation Settings
```env
PDF_GENERATOR=snappdf                 # Uses Chrome for better PDFs
SNAPPDF_CHROMIUM_PATH=/usr/bin/google-chrome-stable
```

### Custom Date Formats (for PDF customization)
```env
CUSTOM_DATE_FORMAT=Y-m-d              # ISO format (2024-01-15)
CUSTOM_DATETIME_FORMAT=Y-m-d H:i:s    # ISO datetime
CUSTOM_TIME_FORMAT=H:i:s              # 24-hour time
```

**Common Date Format Options:**
- `Y-m-d` → 2024-01-15 (ISO format)
- `m/d/Y` → 01/15/2024 (US format)
- `d/m/Y` → 15/01/2024 (European format)
- `F j, Y` → January 15, 2024 (Long format)
- `M j, Y` → Jan 15, 2024 (Medium format)

### Email Configuration
```env
MAIL_MAILER=smtp                      # or 'log' for testing
MAIL_HOST=smtp.your-provider.com      # Your SMTP server
MAIL_PORT=587                         # SMTP port
MAIL_USERNAME=your-email@domain.com   # SMTP username
MAIL_PASSWORD=your-smtp-password      # SMTP password
MAIL_ENCRYPTION=tls                   # or 'ssl'
```

## Security Considerations

1. **Change Default Passwords**: Always change database passwords from defaults
2. **Use Strong APP_KEY**: Never reuse APP_KEY across installations
3. **Remove Initial User Variables**: Delete IN_USER_EMAIL and IN_PASSWORD after setup
4. **HTTPS in Production**: Set REQUIRE_HTTPS=true and use proper SSL certificates
5. **Secure File Permissions**: Ensure .env file is not publicly accessible

## Environment Variables Reference

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| APP_URL | Application URL | http://localhost:8080 | Yes |
| APP_KEY | Encryption key | Generated | Yes |
| DB_HOST | Database host | mysql | Yes |
| DB_DATABASE | Database name | invoiceninja | Yes |
| DB_USERNAME | Database user | invoiceninja | Yes |
| DB_PASSWORD | Database password | - | Yes |
| REDIS_HOST | Redis host | redis | Yes |
| PDF_GENERATOR | PDF engine | snappdf | No |
| CUSTOM_DATE_FORMAT | Date format for PDFs | Y-m-d | No |

## Troubleshooting

### Common Issues

1. **APP_KEY Generation Fails**
   - Ensure Docker is running
   - Check internet connection for image download
   - Try manual generation method

2. **Database Connection Issues**
   - Verify database credentials in .env
   - Ensure DB_HOST=mysql (not localhost)
   - Check if containers are running

3. **PDF Generation Problems**
   - For localhost testing, use domains ending in .test
   - Verify Chrome is available in container
   - Check PDF_GENERATOR setting

### Validation Commands

```bash
# Check if containers are running
docker-compose ps

# View application logs
docker-compose logs app

# Test database connection
docker-compose exec app php artisan migrate:status

# Generate test PDF
docker-compose exec app php artisan ninja:test-pdf
```

## Next Steps

After environment setup:
1. Run `docker-compose up -d`
2. Access http://localhost:8080
3. Complete initial setup wizard
4. Configure PDF date formats (see PDF_CUSTOMIZATION.md)
