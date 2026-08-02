# Deploy with GitHub Actions to S3 + CloudFront

The web app will be built and deployed by a GitHub Actions workflow. On each push to the default branch, the workflow will install dependencies, run the test suite, build the production bundle, sync the `dist/` directory to the S3 bucket, and invalidate the CloudFront distribution cache so that the new files are served immediately.

We chose this over manual deployments because it gives us reproducible builds, automated tests before deploy, and fast iteration. We are not using a full infrastructure-as-code setup for the MVP because the S3 bucket and CloudFront distribution are expected to be created once and rarely change; the pipeline focuses on the application artifact.
