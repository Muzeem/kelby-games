# Security Policy

## Supported Versions

We release patches for security vulnerabilities for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| Latest  | :white_check_mark: |

## Reporting a Vulnerability

We take the security of Kelby Games seriously. If you discover a security vulnerability, please follow these steps:

### 1. Do Not Publicly Disclose

Please do not open a public GitHub issue for security vulnerabilities.

### 2. Report Privately

Send an email to **security@kelby.in** with:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

### 3. Response Timeline

- **Initial Response:** Within 48 hours
- **Status Update:** Within 7 days
- **Fix Timeline:** Depends on severity
  - Critical: 1-7 days
  - High: 7-14 days
  - Medium: 14-30 days
  - Low: 30-90 days

### 4. Disclosure Policy

- We will acknowledge your report within 48 hours
- We will provide regular updates on our progress
- We will notify you when the vulnerability is fixed
- We will credit you in the security advisory (unless you prefer to remain anonymous)

## Security Best Practices

### For Users
- Always access the site via HTTPS
- Keep your browser updated
- Be cautious of phishing attempts
- Report suspicious behavior

### For Contributors
- Never commit sensitive data (API keys, passwords, etc.)
- Use environment variables for configuration
- Validate all user input
- Follow secure coding practices
- Keep dependencies updated (if any are added)

## Known Security Considerations

### Current Architecture
- **No Backend:** Eliminates server-side vulnerabilities
- **No Database:** No SQL injection risks
- **No User Accounts:** No authentication vulnerabilities
- **Static Files Only:** Minimal attack surface

### Client-Side Security
- All code runs in browser sandbox
- LocalStorage used only for game state
- No sensitive data stored
- No external API calls

### Content Security Policy

We recommend the following CSP headers:

```
Content-Security-Policy: 
  default-src 'self';
  script-src 'self';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data:;
  font-src 'self';
  connect-src 'self';
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self';
```

## Security Checklist for New Games

When adding a new game, ensure:

- [ ] No external script dependencies
- [ ] No eval() or Function() constructor
- [ ] Input validation for user data
- [ ] No inline event handlers
- [ ] Proper error handling
- [ ] No sensitive data in code
- [ ] HTTPS-only resources
- [ ] XSS prevention measures

## Vulnerability Disclosure

We will publish security advisories for:
- Critical vulnerabilities
- High-severity issues affecting users
- Vulnerabilities with known exploits

Advisories will be published:
- In GitHub Security Advisories
- On our website
- Via email to affected users (if applicable)

## Security Updates

We commit to:
- Promptly addressing reported vulnerabilities
- Providing security patches in a timely manner
- Maintaining transparency about security issues
- Learning from security incidents

## Contact

For security concerns:
- Email: security@kelby.in
- PGP Key: (Available upon request)

For general issues:
- GitHub Issues: For non-security bugs
- Email: support@kelby.in

---

**Thank you for helping keep Kelby Games secure!**
