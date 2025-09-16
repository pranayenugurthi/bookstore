
const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');


const app = express();
const port = 3006 || 5000;
app.use(cors())
// Middleware
app.use(bodyParser.json());

// MySQL connection pool - configure your database credentials
const pool = mysql.createConnection({
 host: "bujwr8wyil6qjlge4p0z-mysql.services.clever-cloud.com",
  user: "ugpcbhyjmkvkzl5l",
  password: "jSTNFZSCgkLkRyQnktWh",
  database: "bujwr8wyil6qjlge4p0z",

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
    // const createTable=`
    //   CREATE TABLE IF NOT EXISTS books (
    //     id INT AUTO_INCREMENT PRIMARY KEY,
    //     title VARCHAR(255) NOT NULL,
    //     author VARCHAR(255) NOT NULL,
    //     isbn VARCHAR(20) NOT NULL,
    //     publishedDate VARCHAR(255) NOT NULL,
    //     publisher VARCHAR(255) NOT NULL,
    //     genre VARCHAR(100) NOT NULL,
    //     description TEXT NOT NULL,
    //     pageCount INT NOT NULL,
    //     language VARCHAR(50) NOT NULL,
    //     coverImage VARCHAR(255) NOT NULL,
    //     createdAt VARCHAR(255),
    //     updatedAt VARCHAR(255),
    //     price INT
    //   );
    // `;

    // const dropTable=`
    //   DROP TABLE IF EXISTS books
    // `;

    // const createTable=`
    //     CREATE TABLE IF NOT EXISTS user(
    //     id INT NOT NULL,
    //     username VARCHAR(45) NOT NULL,
    //     password VARCHAR(45) NOT NULL,
    //     role VARCHAR(45) NULL DEFAULT 'user',
    //     PRIMARY KEY (id),
    //     UNIQUE INDEX username_UNIQUE (username ASC) VISIBLE,
    //     UNIQUE INDEX id_UNIQUE (id ASC) VISIBLE);
    // `;

    // const alterTable=`
    //   ALTER TABLE user
    //   CHANGE COLUMN id id INT NOT NULL AUTO_INCREMENT;
    // `

//     const alterTable=`ALTER TABLE user 
// ADD COLUMN resetPwd VARCHAR(45) NULL AFTER role;`
  //   const createTable=`
  //     CREATE TABLE IF NOT EXISTS comments (
  // id INT NOT NULL,
  // bookId INT NOT NULL,
  // userId INT NOT NULL,
  // comment LONGTEXT NULL,
  // rating FLOAT NULL,
  // PRIMARY KEY (id),
  // UNIQUE INDEX id_UNIQUE (id ASC) VISIBLE);
  //   `;
// const createTable=`
//      CREATE TABLE IF NOT EXISTS rating (
//       id INT NOT NULL auto_increment,
//       bookId INT NOT NULL,
//       username varchar(45) NOT NULL,
//       rating FLOAT NOT NULL,
//       date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//       PRIMARY KEY (id),
//       UNIQUE INDEX id_UNIQUE (id ASC) VISIBLE);
// `;
const createTable=`
    create table if not exists comments(
   id INT AUTO_INCREMENT PRIMARY KEY,
    bookId INT NOT NULL,
    username varchar(45) NOT NULL,
    comment longtext NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)
`
// const createTable=`
//     drop table comments
// `
    pool.query(createTable, (err, result) => {
      if (err) {
        console.error('Error creating table:', err);
        return;
      }
      console.log('Table created successfully');
    });


    // console.log("connected")

})

// Create a book
app.get("/book/:id/rating",(req,res)=>{
  try{
    pool.query("select * from rating where bookId=?",[req.params.id],(error,result)=>{
      if(error){
        console.log("Error fetching rating:",error);
        return res.status(500).json({error:"Database errr"})
      }
      console.log(result)
      res.send(result)
    })
  }catch(err){
    console.log(err);
    res.status(500).json({error:"DataBase errr"})
  }
})

app.post("/book/:id/addRating",(req,res)=>{
  const bookId=req.params.id;
  const {username,rating}=req.body;
  const sql=`Insert into rating (bookId,username,rating)
  values(?,?,?)
  `;
  try{
    pool.query(sql,[bookId,username,rating],(error,result)=>{
    if(error){
      console.log("Error adding Rating:",error);
      res.status(500).json({error:"Database error"});
    }
    // console.log("result addRating",result);
   res.status(201).json({ message: 'Rating added successfully', ratingtId: result.insertId });
  })
  }catch(err){
    console.log(err);
    res.status(500).json({err:"database error"})
  }
  
})

app.put("/book/:id/UpdateRating",(req,res)=>{
  const bookId=req.params.id;
  const {username,rating}=req.body;
  const sql=`Update rating set rating=? where bookId=? and username=?
  `;
  try{
    pool.query(sql,[rating,bookId,username],(error,result)=>{
    if(error){
      console.log("Error adding Rating:",error);
      res.status(500).json({error:"Database error"});
    }
    // console.log("result addRating",result);
   res.status(201).json({ message: 'Rating updated successfully', ratingId: result.insertId });
  })
  }catch(err){
    console.log(err);
    res.status(500).json({err:"database error"})
  }

})

app.delete("/book/:id/deleteRating", (req, res) => {
  const { id } = req.params;
  const { username } = req.body;
  const sql = "DELETE FROM rating WHERE bookId = ? and username=?";
  pool.query(sql, [id, username], (error, results) => {
    if (error) {
      console.error('Error deleting rating:', error);
      return res.status(500).json({ error: 'Database error' });
    }
    res.status(200).json({ message: 'Rating deleted successfully' });
  });
});

app.get('/book/:id/comments',(req,res)=>{
  try{
    pool.query("select * from comments where bookId = ?", [req.params.id], (error, results) => {
      if (error) {
        console.error('Error fetching comments:', error);
        return res.status(500).json({ error: 'Database error' });
      }
      console.log("result", results);
      res.send(results);
    });
  }catch(err){
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
})
app.post('/book/:id/addComments', (req, res) => {
  try {
    const { username, comment } = req.body;
    console.log("req.body",req.body)
    const sql = `
      INSERT INTO comments (bookId, username, comment,timestamp)
      VALUES (?, ?, ?,?)
    `;
    pool.query(sql, [req.params.id, username, comment,new Date()], (error, results) => {
      if (error) {
        console.error('Error adding comment:', error);
        return res.status(500).json({ error: 'Database error' });
      }
      res.status(201).json({ message: 'Comment added successfully', commentId: results.insertId });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.delete("/book/:id/comments/:commentId", (req, res) => {
  const { id, commentId } = req.params;
  const sql = "DELETE FROM comments WHERE bookId = ? AND id = ?";
  pool.query(sql, [id, commentId], (error, results) => {
    if (error) {
      console.error('Error deleting comment:', error);
      return res.status(500).json({ error: 'Database error' });
    }
    res.status(200).json({ message: 'Comment deleted successfully' });
  });
});

app.get('/users', (req, res) => {
  try {
    pool.query('SELECT * FROM user', (error, results) => {
      if (error) {
        console.error('Error fetching users:', error);
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

app.post("/addUser", (req, res) => {
  const { id, username, password, role, resetPwd } = req.body;
  const sql = `
    INSERT INTO user (id, username, password, role, resetPwd)
    VALUES (?, ?, ?, ?, ?)
  `;
  pool.query(sql, [id, username, password, role, resetPwd], (error, results) => {
    if (error) {
      console.error('Error adding user:', error);
      return res.status(500).json({ error: 'Database error' });
    }
    res.status(201).json({ message: 'User added successfully', userId: results.insertId });
  });
});

app.delete("/deleteUser/:id", (req, res) => {
  const userId=req.params.id;
  const sql = "DELETE FROM user WHERE id = ?";
  pool.query(sql, [userId], (error, results) => {
    if (error) {
      console.error('Error deleting user:', error);
      return res.status(500).json({ error: 'Database error' });
    }
    res.status(200).json({ message: 'User deleted successfully' });
  });
});

app.put("/updateUser/:id", (req, res) => {
  const userId = req.params.id;

  const updatedUser = req.body;
  let sql=`UPDATE user SET`,
  params = [];
  const { username, password, role, resetPwd } = updatedUser;
  if(username!==undefined){
    sql += ` username = ?,`;
    params.push(username);
  }
  if(password!==undefined){
    sql += ` password = ?,`;
    params.push(password);
  }
  if(role!==undefined){
    sql += ` role = ?,`;
    params.push(role);
  }
  if(resetPwd!==undefined){
    sql += ` resetPwd = ?,`;
    params.push(resetPwd);
  }
  sql = sql.slice(0, -1); // Remove trailing comma
  sql += ` WHERE id = ?`;
  params.push(userId);

  pool.query(sql, params, (error, results) => {
    if (error) {
      console.error('Error updating user:', error);
      return res.status(500).json({ error: 'Database error' });
    }
    res.status(200).json({ message: 'User updated successfully' });
  });
});
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
      pool.query('DELETE FROM books WHERE id = ?', [req.params.id], (err, result) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Book not found' });
      }
      res.json({ message: 'Book deleted' });
    });
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
