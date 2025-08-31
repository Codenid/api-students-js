const sqlite3 = require('sqlite3').verbose();

// Create database connection
const db = new sqlite3.Database('students.sqlite', (err) => {
    if (err) {
        console.error('Database connection error:', err.message);
        return;
    }
    console.log('Connected to SQLite database.');
});

// Create students table
const sql_query = `
    CREATE TABLE IF NOT EXISTS students (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        firstname TEXT NOT NULL,
        lastname TEXT NOT NULL,
        gender TEXT NOT NULL,
        age TEXT
    )
`;

db.run(sql_query, (err) => {
    if (err) {
        console.error('Error creating table:', err.message);
    } else {
        console.log('Students table created successfully.');
    }
    // Close the database connection
    db.close((err) => {
        if (err) {
            console.error('Error closing database:', err.message);
        } else {
            console.log('Database connection closed.');
        }
    });
});