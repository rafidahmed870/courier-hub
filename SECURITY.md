# Security Policy

## Supported Versions

We actively maintain and provide security updates for the latest release. 

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |
| < 0.1.0 | :x:                |

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

If you discover a security vulnerability in `courier-hub`, please report it responsibly by emailing us at **contact.rafidahmmed@gmail.com**. 

We will try our best to:
1. Acknowledge your report within 48 hours.
2. Investigate the issue and determine its impact.
3. Release a patch as soon as possible.

We kindly ask you to give us reasonable time to fix the issue before making any public disclosure. We highly appreciate your efforts to help keep this project and its users safe.

## Security Best Practices for Users

Since `courier-hub` deals with sensitive data (like API keys, secrets, and tokens), we highly recommend the following:

* **Never hardcode credentials:** Always use environment variables (e.g., `.env` files) to store your `client_id`, `client_secret`, `api_key`, etc.
* **Keep your package updated:** Always use the latest version of `courier-hub` to ensure you have the most recent security patches.
* **Use secure environments:** Ensure your server or runtime environment is secure and access to environment variables is restricted.

## Thank You

Thank you for helping keep `courier-hub` secure!