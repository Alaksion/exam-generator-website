# Serve the static site through CloudFront with BrowserRouter

The React app will use `BrowserRouter` and be served behind an Amazon CloudFront distribution. The S3 bucket is configured for static website hosting and acts as the CloudFront origin. CloudFront will be configured to return `index.html` for all 404 paths so that React Router handles deep links. We will use CloudFront's default domain and HTTPS for the MVP, rather than a custom domain and an ACM certificate.

This gives us HTTPS (which S3 website hosting alone does not) and clean URLs without hash routing. We avoid the extra work of provisioning a custom domain and ACM certificate for the MVP. When the project moves to a branded domain, we can add a custom CloudFront alternate name and certificate.
