import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import cloudinaryFramework from 'cloudinary';
import multer from 'multer';
import cloudinaryStorage from 'multer-storage-cloudinary';
import mongoose from 'mongoose';

// Set up MongoDB
const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost/books-tracker';
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = Promise;

// Book Model
const Book = mongoose.model('Book', {
  name: {
    type: String,
    required: true
  },
  author: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  dateRead: {
    type: String,
    required: true
  }
});

dotenv.config();

// Cloudinary Setup
const cloudinary = cloudinaryFramework.v2; 
cloudinary.config({
  cloud_name: 'vanessa-cloudinary',
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = cloudinaryStorage({
  cloudinary,
  params: {
    folder: 'imageupload-practice',
    allowedFormats: ['jpg', 'jpeg', 'png'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }],
  }
});

const parser = multer({ storage });

// Defines the port the app will run on
const port = process.env.PORT || 8080;
const app = express();

// Add middlewares to enable cors and json body parsing
app.use(cors());
app.use(bodyParser.json());

// Start defining your routes here
app.get('/', (req, res) => {
  res.send('Vanessas app to track which books I have read so far...');
});

// Endpoint to create a new Book instance: Including book name, author and image
// In the Frontend, we should send in the body: name, author and attached image file
app.post('/books', parser.single('image'), async (req, res) => {
  try {
    const newBook = await new Book({ name: req.body.name, author: req.body.author, imageUrl: req.file.path, dateRead: req.body.dateRead }).save();
    res.status(200).json({ message: 'Book saved successfully' });
  } catch (err) {
    res.status(400).json({ message: 'Could not save New Book to the database', error });
  }
});

app.get('/books', async (req, res) => {
  try {
    const allBooks = await Book.find();
    res.status(200).json(allBooks);
  } catch (err) {
    res.status(400).json({ message: 'Could not find any Books', error });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
