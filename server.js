const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const multer = require('multer');
const app = express();

// Configure multer for form data
const upload = multer();

const db = new sqlite3.Database('students.sqlite', (err) => {
    if (err) {
        console.error('Database connection error:', err.message);
    } else {
        console.log('Connected to SQLite database.');
        db.run(`CREATE TABLE IF NOT EXISTS students (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            firstname TEXT NOT NULL,
            lastname TEXT NOT NULL,
            gender TEXT NOT NULL,
            age TEXT
        )`);
    }
});

// Middleware to parse JSON (for GET/DELETE if needed)
app.use(express.json());

// GET all students
app.get('/students', (req, res) => {
    db.all('SELECT * FROM students', [], (err, rows) => {
        if (err) {
            res.status(500).send('Database error');
            return;
        }
        res.json(rows.map(row => ({
            id: row.id,
            firstname: row.firstname,
            lastname: row.lastname,
            gender: row.gender,
            age: row.age
        })));
    });
});

// POST a new student
app.post('/students', upload.none(), (req, res) => {
    const { firstname, lastname, gender, age } = req.body;
    if (!firstname || !lastname || !gender || !age) {
        return res.status(400).send('All fields are required');
    }
    const sql = 'INSERT INTO students (firstname, lastname, gender, age) VALUES (?, ?, ?, ?)';
    
    db.run(sql, [firstname, lastname, gender, age], function(err) {
        if (err) {
            res.status(500).send('Error creating student');
            return;
        }
        res.json({ message: `Student with id: ${this.lastID} created successfully` });
    });
});

// GET a single student
app.get('/student/:id', (req, res) => {
    const id = req.params.id;
    db.get('SELECT * FROM students WHERE id = ?', [id], (err, row) => {
        if (err) {
            res.status(500).send('Database error');
            return;
        }
        if (row) {
            res.json(row);
        } else {
            res.status(404).send('Student not found');
        }
    });
});

// PUT (update) a student
app.put('/student/:id', upload.none(), (req, res) => {
    const id = req.params.id;
    const { firstname, lastname, gender, age } = req.body;
    if (!firstname || !lastname || !gender || !age) {
        return res.status(400).send('All fields are required');
    }
    const sql = 'UPDATE students SET firstname = ?, lastname = ?, gender = ?, age = ? WHERE id = ?';
    
    db.run(sql, [firstname, lastname, gender, age, id], function(err) {
        if (err) {
            res.status(500).send('Error updating student');
            return;
        }
        if (this.changes === 0) {
            res.status(404).send('Student not found');
            return;
        }
        res.json({
            id,
            firstname,
            lastname,
            gender,
            age
        });
    });
});

// DELETE a student
app.delete('/student/:id', (req, res) => {
    const id = req.params.id;
    db.run('DELETE FROM students WHERE id = ?', [id], function(err) {
        if (err) {
            res.status(500).send('Error deleting student');
            return;
        }
        if (this.changes === 0) {
            res.status(404).send('Student not found');
            return;
        }
        res.json({ message: `The student with id: ${id} has been deleted.` });
    });
});

const PORT = 8000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
