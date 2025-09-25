const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;
const CONTACT_FILE = path.join(__dirname, 'Contact.json');

// Middleware
app.use(cors()); // Allow cross-origin requests
app.use(bodyParser.json()); // Parse JSON bodies
app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Serve static files (HTML, CSS, JS) from the current directory
app.use(express.static(__dirname));

app.post('/submit-contact', (req, res) => {
    const newContact = {
        name: req.body.name,
        email: req.body.email,
        company: req.body.company,
        message: req.body.message,
        submittedAt: new Date().toISOString()
    };

    fs.readFile(CONTACT_FILE, 'utf8', (err, data) => {
        if (err && err.code !== 'ENOENT') {
            console.error('Error reading contact file:', err);
            return res.status(500).send('Server error while reading contacts.');
        }

        const contacts = data ? JSON.parse(data) : [];
        contacts.push(newContact);

        fs.writeFile(CONTACT_FILE, JSON.stringify(contacts, null, 2), 'utf8', (err) => {
            if (err) {
                console.error('Error writing to contact file:', err);
                return res.status(500).send('Server error while saving contact.');
            }

            console.log('New contact saved:', newContact);
            // Redirect to a 'thank you' page or send a success response
            res.status(200).send('Thank you for your message!');
        });
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log('Serving files from:', __dirname);
});