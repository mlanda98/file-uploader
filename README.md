# File Uploader - UploadStack

A responsive web-based file storage service inspired by Google Drive, built with Node.js, Express, Prisma, and Passport.js. This application allows users to register or log in (including as a guest), create folders, upload files, and manage their content — with cloud storage via Supabase and secure backend data stored in PostgreSQL on Railway.

---

🔗 Links

- [Live Demo]()
- [Repository](https://github.com/mlanda98/file-uploader)

---

🚀 Features

- Responsive UI – Works seamlessly on mobile, tablet, and desktop.
- Authentication – User registration, login, and secure session handling via Passport.js.
- Guest Login – Explore the app without creating an account.
- Folder Management – Full CRUD operations on folders.
- File Uploads – Upload files to specific folders using Multer.
- Cloud Storage – Files are stored in Supabase Storage.
- File Details – View file name, size, and upload time.
- File Download – Download files directly via a download button.
- Persistent Sessions – Session management stored in PostgreSQL using Prisma session store.

---

🛠️ Tech Stack
- Backend: Node.js, Express
- Authentication: Passport.js (session-based)
- ORM: Prisma
- Database: PostgreSQL (hosted on Railway)
- File Storage: Supabase Storage
- Middleware: Multer for handling file uploads
- Session Store: Prisma Session Store
- Frontend: EJS 
- Deployment: Railway

---

💻 Run It Locally

- Prerequisites: Node.js, Supabase account, Railway project with PostgresSQL, Git.
- Clone the repository
  `git clone https://github.com/mlanda98/file-uploader.git`
- cd file-uploader
- run `npm install`
- set up environment variables:
  ````
  DATABASE_URL="your_railway_postgres_url"
  SESSION_SECRET="your_secure_session_secret"
  SUPABASE_URL="https://your-supabase-project.supabase.co"
  SUPABASE_KEY="your-supabase-service-role-key"
  SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key"
  ````
- run migrations: `npx prisma migrate dev --name init`
- Run the development server: `npm run dev`
- Visit `http://localhost:3000`

- Lint: npm run lint
- Fix lint issues automatically: `npm run lint:fix`
- Format with Prettier: `npm run format`

---

🌱 Future Improvements

- email verification and password reset
- Dark mode toggle

---

📬 Contact

- Email: mlandae16@gmail.com
