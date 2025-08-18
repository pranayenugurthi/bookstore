// backend.js

const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3306;
app.use(cors())
// Middleware
app.use(bodyParser.json());

// MySQL connection pool - configure your database credentials
const pool = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'bookstore',
  port:3306
});
pool.on('error', (err) => {
    if(err){
        console.error('MySQL error:', err);
    }
    console.error('MySQL connected');
    
});
pool.connect((err)=>{
    if(err){
        console.log("err",err)
        return
    }
    console.log("connected")
})

// Create a book

app.post('/addAllBooks',(req,res) => {
    try{
        const books=req.body;
        const sql = `
      INSERT INTO books (
        id, title, author, isbn, publishedDate, publisher,
        genre, description, pageCount, language,
        coverImage, createdAt, updatedAt
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)
    `;
    books.map(book=>{
       pool.query(sql, [book.id, book.title, book.author, book.isbn, book.publishedDate,
      book.publisher, book.genre, book.description, book.pageCount, book.language,
      book.coverImage, book.createdAt, book.updatedAt],(err,result)=>{
        if(err){
            res.json({ error: 'Database error' });
            console.log(err)
        } 
       })
    
    })
    }catch(err){
        console.error(err);
        res.status(500).json({ error: ' error' });
    }
    //res.status(201).json({ message: 'Books added successfully' });
});
app.post('/books', (req, res) => {
  try {
    const {
      id, title, author, isbn, publishedDate, publisher,
      genre, description, pageCount, language, coverImage,
      createdAt, updatedAt
    } = req.body;
    const sql = `
      INSERT INTO books (
        id, title, author, isbn, publishedDate, publisher,
        genre, description, pageCount, language,
        coverImage, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
      id, title, author, isbn, publishedDate, publisher,
      genre, description, pageCount, language, coverImage,
      createdAt , updatedAt 
    ];
     pool.query(sql, params,(err,result)=>{
        if(err){
            res.status(500).json({ error: 'Database error' });
        } else {
            res.status(201).json({ message: result });
            
        }
        //console.log("result",result);
     });
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Get all books
app.get('/books',(req, res) => {
  try {
    pool.query('SELECT * FROM books', (error, results) => {
      if (error) {
        console.error('Error fetching books:', error);
        return res.status(500).json({ error: 'Database error' });
      }
      console.log("result", results);
      res.send(results);
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Get a book by id
app.get('/books/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM books WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Book not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Update a book by id
app.put('/books/:id',  (req, res) => {
  try {
    const {
      title, author, isbn, publishedDate, publisher,
      genre, description, pageCount, language, coverImage, price
    } = req.body;
    const sql = `
      UPDATE books SET
        title = ?, author = ?, isbn = ?, publishedDate = ?,
        publisher = ?, genre = ?, description = ?, pageCount = ?,
        language = ?, coverImage = ?, updatedAt = ?, price = ?
      WHERE id = ?
    `;
    const params = [
      title, author, isbn, publishedDate, publisher,
      genre, description, pageCount, language, coverImage,
      new Date(),price, req.params.id
    ];
     pool.query(sql, params,(err,result)=>{
       if (err) {
         console.error(err);
         return res.status(500).json({ error: 'Database error' });
       }
       if (result.affectedRows === 0) {
         return res.status(404).json({ message: 'Book not found' });
       }
       res.json({ message: 'Book updated' });
     });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Delete a book by id
app.delete('/books/:id', async (req, res) => {
  try {
    if (req.params.id === 1) {
      pool.query("DELETE FROM books", (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: 'Database error' });
        }
        res.json({ message: 'All books deleted' });
      });
    }else{
      pool.query('DELETE FROM books WHERE id = ?', [req.params.id]);
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Book not found' });
      }
    res.json({ message: 'Book deleted' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
