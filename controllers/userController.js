import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { query } from '../config/db.js';

export async function registerUser(req, res) {
    const { name, email, password } = req.body;

    try {
        // Check if user already exists
        const userCheck = await query('SELECT * FROM users WHERE email = $1', [email]);
        if (userCheck.rows.length > 0) {
            res.status(400).json({ message: 'User already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Add the new user to the database
        const result = await query(
            'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id',
            [name, email, hashedPassword]);

        // Generate a JWT token for the new user
        const token = jwt.sign({ id: result.rows[0].id },
            process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(201).json({ token });
    } catch (error) {
        res.status(500).json({ error: 'Failed to register user' });
    }
}


export async function loginUser(req, res) {
    const { email, password } = req.body;

    try {

        // Check if the user exists
        const user = await query('SELECT * users WHERE email = $1', [email]);
        if (user.rows.length === 0) {
            return res.status(400).json({ message: 'User not found' });
        }

        // Validate the password
        const validPassword = await bcrypt.compare(password, user.rows[0].password);
        if (!validPassword) {
            return res.status(400).json({ message: 'Invalid password' });
        }

        const token = jwt.sign({ id: user.rows[0].id },
            process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(200).json({ token });
    } catch (error) {
        res.status(500).json({ error: 'Failed to login user' });
    }
}