import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { query } from '../config/db.js';
import pool from '../config/db.js';

export const registerUser = async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        // Check if user already exists
        const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userExists.rows.length > 0) {
            res.status(400).json({ error: 'Email already exists. User already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Add the new user to the database
        const newUser = await pool.query(
            'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *',
            [name, email, hashedPassword]);

        res.status(201).json({ message: 'User registered successfully', user: newUser.rows[0] });
    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ error: 'Failed to register user' });
    }
};


export const loginUser = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Both Email and Password are required' });
    }

    try {

        // Check if the user exists
        const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

        if (userResult.rows.length === 0) {
            return res.status(400).json({ message: 'User not found' });
        }

        // Getting the first user from the result
        const user = userResult.rows[0];
        // Validate the password by comparing
        const isPasswordMatch = await bcrypt.compare(password, user.password);

        if (!isPasswordMatch) {
            return res.status(400).json({ message: 'Invalid password' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.cookie('token', token, {
            httpOnly: true, // prevents client-side access
            secure: false, // set to true if using HTTPS
            sameSite: 'Strict',
            maxAge: 3600000, // 1 hour
        });

        return res.status(200).json({ token, user: { id: user.id, name: user.name, email: user.email } });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: 'Failed to login user' });
    }
};

export const logoutUser = async (req, res) => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: false,
            sameSite: 'Strict',
            maxAge: 0,
        });

        const oAuthCookie = req.cookies['connect.sid'];

        if (oAuthCookie) {
            res.clearCookie('connect.sid', {
                httpOnly: true,
                secure: false,
                sameSite: 'Strict',
                maxAge: 0,
            });
        }
        res.status(200).json({ message: 'User logged out successfully' });

    } catch (error) {
        console.error("Logout error:", error);
        res.status(500).json({ error: 'Failed to logout user' });
    }
};