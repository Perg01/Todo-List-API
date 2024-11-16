import express from 'express';
import dotenv from 'dotenv';
import { registerUser, loginUser } from './controllers/userController.js';
import { createTodo } from './controllers/todoController.js';
import passport from './config/passport.js';
import session from 'express-session';
import './config/passport.js';

import { authenticateUser } from './middleware/authMiddleware.js';

dotenv.config();
const app = express();
app.use(express.json());

// Initialize session middleware
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: process.env.NODE_ENV === 'production',
            maxAge: 1000 * 60 * 60,
        },
    })
);

// Initialize passport middleware
app.use(passport.initialize());
app.use(passport.session());

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.post('/api/register', registerUser);
app.post('/api/login', loginUser);
app.post('/api/todos', authenticateUser, createTodo);

app.get('/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/' }),
    (req, res) => {
        res.redirect('/dashboard');
    }
);

export default app;