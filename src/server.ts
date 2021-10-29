import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import { connectDatabase, getBookCollection } from './utils/database';
import { books } from './utils/content.json';

if (!process.env.MONGODB_URI) {
  throw new Error('No MongoDB URL dotenv variable');
}

const app = express();
const port = 3000;
const bookCharts = books;

// For parsing application/json
app.use(express.json());

// for post

app.post('/api/books', async (request, response) => {
  const addNewBook = request.body;
  const bookCollection = getBookCollection();
  const existingBook = await bookCollection.findOne({
    title: addNewBook.Title,
  });

  if (!existingBook) {
    const bookChartAdded = await bookCollection.insertMany(bookCharts);
    const responseDocument = { ...bookChartAdded };
    response.status(200).send(responseDocument);
  } else {
    response.status(409).send('Book already exists');
  }
});

// for delete

app.delete('/api/books/:Title', async (request, response) => {
  const bookCollection = getBookCollection();
  const bookToRemove = request.params.Title;
  const findBook = await bookCollection.findOne({
    Title: bookToRemove,
  });
  if (findBook) {
    await bookCollection.deleteOne(findBook);
    response.send(`Book ${bookToRemove} deleted`);
  } else {
    response.status(404).send('This chart doesnt contain your title');
  }
});

app.get('/', (_req, res) => {
  res.send('Hello World!');
});

connectDatabase(process.env.MONGODB_URI).then(() =>
  app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
  })
);
