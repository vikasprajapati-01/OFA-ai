# OFA AI

> One website for most of your everyday AI tasks.

OFA AI is a full-stack AI productivity platform that brings writing, image generation, image editing, and resume feedback into one simple workspace. The application is built with a React and Vite frontend, an Express backend, Clerk authentication, Neon PostgreSQL storage, Cloudinary media processing, Google Gemini-compatible text generation, and Clipdrop image generation.

**Live application:** [ofa-ai.vercel.app](https://ofa-ai.vercel.app)

---

## Why OFA AI?

AI tools are often spread across multiple websites and accounts. OFA AI provides a single authenticated workspace where users can create content, generate images, process images, review resumes, and revisit their previous creations.

The interface is designed to be approachable for everyday users while keeping the codebase simple enough to extend with new AI tools.

## Features

### AI writing tools

- **Article Generator** — Create structured articles from a topic and choose a short, medium, or long output length.
- **Blog Title Generator** — Generate title ideas for a topic across categories such as technology, health, travel, finance, education, food, lifestyle, entertainment, and sports.

### AI image tools

- **Image Generator** — Create images from text prompts with selectable styles including realistic, cartoon, Ghibli, anime, fantasy, 3D, and portrait.
- **Background Removal** — Upload an image and remove its background.
- **Object Removal** — Upload an image and remove a specified object from it.

### Resume tool

- **Resume Reviewer** — Upload a PDF resume and receive AI-generated feedback about structure, formatting, skills, experience, ATS keywords, strengths, weaknesses, and improvement opportunities.

### Workspace experience

- Clerk-powered sign-in and user sessions.
- Free and premium plan handling through Clerk metadata and plans.
- A free usage limit for supported text and image generation tools.
- Personal dashboard showing recent creations and the active plan.
- Saved creation history in Neon PostgreSQL.
- Light and dark themes.
- Responsive navigation for desktop and mobile layouts.
- Copy generated text to the clipboard.
- Download generated and processed images.
- Markdown rendering for generated articles, blog titles, and resume reviews.

---

## Tech stack

### Frontend

- React 19
- Vite
- React Router
- Tailwind CSS 4 with the Vite plugin
- Clerk React authentication
- Axios for API requests
- React Markdown for formatted AI output
- React Hot Toast for notifications

### Backend

- Node.js with native ES modules
- Express 5
- Clerk Express authentication middleware
- OpenAI-compatible client configured for Google Gemini
- Clipdrop Text-to-Image API
- Cloudinary for image uploads and transformations
- Neon serverless PostgreSQL
- Multer for multipart file uploads
- `pdf-parse` for reading resume PDFs

### Deployment

- Vercel configuration is included for both the frontend and backend.
- The frontend is configured as a Vite application.
- The backend is configured to run through Vercel's Node.js runtime.

---

## Project structure

```text
OFA-ai/
├── backend/
│   ├── config/
│   │   ├── cloudinary.js       # Cloudinary configuration
│   │   ├── db.js               # Neon PostgreSQL client
│   │   └── multer.js           # Temporary upload handling
│   ├── controller/
│   │   ├── aiController.js     # AI generation and image processing logic
│   │   └── userController.js   # User creation-history logic
│   ├── middleware/
│   │   └── auth.js             # Clerk authentication and plan checks
│   ├── routes/
│   │   ├── aiRoutes.js         # AI tool endpoints
│   │   └── userRoutes.js       # User endpoints
│   ├── server.js               # Express application entry point
│   ├── package.json
│   └── vercel.json
│
├── frontend/
│   ├── public/                 # Public assets and icons
│   ├── src/
│   │   ├── assets/             # Branding and tool configuration
│   │   ├── components/         # Shared UI components
│   │   ├── context/            # Theme context
│   │   ├── pages/              # Public pages and AI tool pages
│   │   ├── App.jsx             # Application routes
│   │   ├── index.css           # Global styles and themes
│   │   └── main.jsx            # React application entry point
│   ├── package.json
│   ├── vite.config.js
│   └── vercel.json
│
└── README.md
```

---

## Requirements

Before running OFA AI locally, install:

- Node.js 18 or newer
- npm 9 or newer
- A Clerk application
- A Neon PostgreSQL database
- A Cloudinary account
- A Google AI Studio API key with Gemini API access
- A Clipdrop API key

Use the Node.js version supported by your hosting provider if deploying to production. Node.js 20 or newer is recommended for a new deployment.

---

## Environment variables

Create `backend/.env` with the following variables:

```env
PORT=3000

# Neon PostgreSQL
DATABASE_URL=your_neon_database_connection_string

# Clerk server credentials
CLERK_SECRET_KEY=your_clerk_secret_key

# Google Gemini API key
GEMINI_API_KEY=your_gemini_api_key

# Clipdrop image generation
CLIPDROP_API_KEY=your_clipdrop_api_key

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

Create `frontend/.env` with the following variables:

```env
# Public Clerk key used by the browser
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key

# Public URL of the deployed backend API
VITE_BASE_URL=http://localhost:3000
```

For a deployed frontend, replace `VITE_BASE_URL` with the public URL of the backend, for example:

```env
VITE_BASE_URL=https://your-backend-domain.vercel.app
```

### Security notes

- Never commit `.env` files, API keys, Clerk secrets, database credentials, or Cloudinary secrets.
- Only expose browser-safe values through `VITE_*` variables.
- Keep `CLERK_SECRET_KEY`, `GEMINI_API_KEY`, `CLIPDROP_API_KEY`, `DATABASE_URL`, and Cloudinary secrets on the server.
- If a secret is exposed, revoke and replace it immediately in the provider dashboard.

---

## Database setup

The backend stores user creations in a PostgreSQL table named `creations`. Create the table in your Neon database before using the dashboard and AI tools:

```sql
CREATE TABLE IF NOT EXISTS creations (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  prompt TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS creations_user_id_created_at_idx
  ON creations (user_id, created_at DESC);
```

The application stores the following creation types:

- `article`
- `blog-title`
- `image`
- `resume-review`

---

## Run locally

The frontend and backend are separate Node.js applications, so install and run them in separate terminals.

### 1. Clone the repository

```bash
git clone https://github.com/vikasprajapati-01/OFA-ai.git
cd OFA-ai
```

### 2. Install backend dependencies

```bash
cd backend
npm install
```

Add the backend environment variables to `backend/.env`, then start the development server:

```bash
npm run server
```

The backend runs on `http://localhost:3000` by default.

### 3. Install frontend dependencies

Open a second terminal from the repository root:

```bash
cd frontend
npm install
```

Add the frontend environment variables to `frontend/.env`, then start Vite:

```bash
npm run dev
```

Open the local URL shown by Vite, usually `http://localhost:5173`.

---

## Available scripts

### Frontend

Run these commands from `frontend/`:

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite development server. |
| `npm run build` | Create a production build in `dist/`. |
| `npm run preview` | Preview the production build locally. |
| `npm run lint` | Run ESLint checks. |

### Backend

Run these commands from `backend/`:

| Command | Purpose |
| --- | --- |
| `npm run server` | Start the backend with Nodemon for development. |
| `npm start` | Start the backend with Node.js. |

---

## API reference

All AI and user endpoints require a valid Clerk bearer token unless noted otherwise.

### Health check

```http
GET /
```

Returns a simple `Server Live` response when the backend is running.

### AI endpoints

#### Generate an article

```http
POST /api/ai/generate-article
Content-Type: application/json
Authorization: Bearer <clerk_token>
```

Request body:

```json
{
  "prompt": "Write an article about the future of renewable energy in Medium (800-1200 words).",
  "length": 1200
}
```

#### Generate blog titles

```http
POST /api/ai/generate-blog-title
Content-Type: application/json
Authorization: Bearer <clerk_token>
```

Request body:

```json
{
  "prompt": "Generate blog titles about artificial intelligence in the Technology category."
}
```

#### Generate an image

```http
POST /api/ai/generate-image
Content-Type: application/json
Authorization: Bearer <clerk_token>
```

Request body:

```json
{
  "prompt": "Generate an image of a futuristic city at sunset in the Anime style."
}
```

#### Remove an image background

```http
POST /api/ai/remove-image-bg
Content-Type: multipart/form-data
Authorization: Bearer <clerk_token>
```

Form field:

- `image` — the image file to process.

#### Remove an object from an image

```http
POST /api/ai/remove-image-object
Content-Type: multipart/form-data
Authorization: Bearer <clerk_token>
```

Form fields:

- `image` — the image file to process.
- `object` — a single-word description of the object to remove.

#### Review a resume

```http
POST /api/ai/review-resume
Content-Type: multipart/form-data
Authorization: Bearer <clerk_token>
```

Form field:

- `resume` — a PDF file up to 5 MB.

### User endpoint

#### Get the authenticated user's creations

```http
GET /api/user/get-user-creations
Authorization: Bearer <clerk_token>
```

Returns the authenticated user's saved creations, ordered from newest to oldest.

---

## Authentication and plans

OFA AI uses Clerk for authentication and plan management.

- The frontend obtains a Clerk session token and sends it as a bearer token.
- The backend uses Clerk middleware to read the authenticated user.
- The backend determines whether the user has the `premium` plan.
- Free users have a limit of 10 supported text/image generations.
- Background removal, object removal, and resume review are premium-only features.
- Generated results are associated with the authenticated Clerk user ID before being stored in Neon.

To enable premium access in Clerk, configure a plan with the identifier `premium` and make sure the plan is available through your Clerk billing setup.

---

## Production deployment

The repository includes deployment configuration for Vercel.

### Deploy the backend

1. Create a new Vercel project using this repository.
2. Set the project root directory to `backend`.
3. Add every variable from `backend/.env` to the Vercel project environment settings.
4. Deploy the project.
5. Confirm the backend health check responds at the deployed URL:

```text
https://your-backend-domain.vercel.app/
```

### Deploy the frontend

1. Create a second Vercel project using the same repository.
2. Set the project root directory to `frontend`.
3. Add `VITE_CLERK_PUBLISHABLE_KEY`.
4. Set `VITE_BASE_URL` to the deployed backend URL.
5. Deploy the project.
6. Add the frontend domain to the allowed origins and redirect URLs in Clerk.

### Production checklist

Before sharing the application publicly:

- Verify the frontend can sign in and sign out successfully.
- Verify the backend health check returns successfully.
- Verify the frontend `VITE_BASE_URL` points to the production backend, not localhost.
- Add the production frontend URL to Clerk's allowed origins and redirect URLs.
- Confirm the production database contains the `creations` table and index.
- Confirm Cloudinary uploads and transformations work in production.
- Confirm Gemini and Clipdrop API keys are active and have sufficient quota.
- Confirm premium features are restricted to premium users.
- Run `npm run lint` and `npm run build` in `frontend/` before deployment.
- Review provider logs after the first production request.
- Keep all server-side secrets out of the frontend build and Git history.

---

## Application flow

1. A visitor opens the public landing page.
2. Clerk handles authentication when the visitor enters the AI workspace.
3. The frontend sends authenticated requests to the Express API.
4. The backend validates the Clerk session and checks the user's plan.
5. The selected controller calls the relevant AI, image, storage, or database service.
6. The result is returned to the frontend and saved to the user's creation history where applicable.
7. The dashboard retrieves the user's saved creations from Neon PostgreSQL.

---

## Error handling and operational notes

- API errors are returned as JSON objects with `success: false` and a `message` field.
- Uploaded files are temporarily handled by Multer and removed after processing.
- Resume uploads are limited to 5 MB by the backend controller.
- AI output is rendered as Markdown in the frontend.
- Image outputs are stored or transformed through Cloudinary before being returned to the client.
- Free usage is tracked in Clerk public metadata through the `free_usage` field.

For production operations, monitor Vercel logs, Clerk events, Neon database activity, Cloudinary usage, and AI provider quotas together. A failure in any external provider can prevent a tool from returning a result.

---

## Troubleshooting

### The frontend cannot reach the backend

Check that:

- The backend is running.
- `VITE_BASE_URL` is correct.
- The backend URL does not contain an extra trailing path.
- CORS is configured correctly for the deployed frontend.
- The browser is not trying to call `localhost` in a production build.

### Authentication fails

Check that:

- `VITE_CLERK_PUBLISHABLE_KEY` belongs to the correct Clerk instance.
- `CLERK_SECRET_KEY` is configured on the backend.
- The frontend domain is allowed in Clerk.
- The backend receives the `Authorization: Bearer <token>` header.

### AI generation fails

Check that:

- `GEMINI_API_KEY` is valid and has access to the configured Gemini model.
- `CLIPDROP_API_KEY` is valid for image generation.
- The provider quota has not been exhausted.
- The request is authenticated.
- The user has not reached the free usage limit.

### The dashboard is empty

Check that:

- The Neon `creations` table exists.
- `DATABASE_URL` points to the correct database.
- The authenticated Clerk user ID is being used consistently.
- The backend has permission to connect to Neon.

### File processing fails

Check that:

- The request uses `multipart/form-data`.
- The field names are exactly `image` for image tools and `resume` for resume review.
- The resume is a PDF and is no larger than 5 MB.
- Cloudinary credentials are configured correctly.

---

## Contributing

Contributions are welcome when they improve reliability, usability, security, or the range of supported AI tools.

Recommended workflow:

1. Create a feature branch from `master`.
2. Keep frontend and backend changes focused and easy to review.
3. Add or update documentation for new environment variables or endpoints.
4. Run frontend linting and production builds locally.
5. Test authenticated, unauthenticated, free-plan, and premium-plan behavior.
6. Open a pull request with a clear description of the change.

When adding a new AI tool, update the relevant frontend navigation, tool data, page component, backend route, controller, database creation type, and this README's API documentation.

---

## License

No open-source license is currently declared in this repository. Unless the repository owner adds a license, all rights are reserved by the copyright holder.

---

## Project links

- **Repository:** [github.com/vikasprajapati-01/OFA-ai](https://github.com/vikasprajapati-01/OFA-ai)
- **Live application:** [ofa-ai.vercel.app](https://ofa-ai.vercel.app)
