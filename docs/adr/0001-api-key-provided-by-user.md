# API key is provided by the user and stored in the browser

Status: superseded by ADR 0011.

The web app will not embed the shared backend API key in the React bundle. Instead, the user pastes the key into a prompt on first use, and the app stores it in `localStorage` and attaches it to every request as `x-api-key`. If the backend returns `401` (assumed for an invalid or missing key), the app clears the stored key and prompts the user again.

We chose this over embedding the key in the S3-hosted bundle because it keeps the deployment purely static and avoids exposing the key to anyone who can read the JS. It also avoids adding CloudFront, Lambda@Edge, or a backend proxy. The trade-off is that the key is still visible to any user who enters it, and the UX begins with a "paste your key" gate. We accept that for the MVP.
