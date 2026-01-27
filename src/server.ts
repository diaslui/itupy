import express from 'express';
import pagesRoutes from './services/pages/routes.ts';
import { fileURLToPath } from "url";
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const __rootdir = path.join(__dirname, "..");
process.loadEnvFile(path.join(__rootdir, '.env'));

const app = express();
app.use("/assets", express.static(path.join(__rootdir, "public")));
app.set("view engine", "ejs");
app.set("views", path.join(__rootdir, "views"));

const PORT = process.env.PORT || 3000;

app.use('/', pagesRoutes);


if (process.env.NODE_ENV !== 'production'){
  app.listen(3000, () => {
    console.log(`running on http://localhost:3000`);
  });
}
