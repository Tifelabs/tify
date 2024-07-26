// app.js
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import blogRouter from './routes/blog.js';
import photoRouter from './routes/photo.js';
import aboutRouter from './routes/more.js';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static('public'));


// Use the routers
app.use('/blog', blogRouter);
app.use('/photo', photoRouter);
app.use('/about', aboutRouter);

// Handle 404 - Keep this as a last route
app.use((req, res) => {
  res.status(404).send('404 Not Found');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
