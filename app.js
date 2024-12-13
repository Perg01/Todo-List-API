import express from 'express';
import dotenv from 'dotenv';
import { registerUser, loginUser, logoutUser } from './controllers/userController.js';
import { createTodo, getTodos, updateTodo, deleteTodo } from './controllers/todoController.js';
import passport from './config/passport.js';
import session from 'express-session';
import './config/passport.js';
import cookieParser from 'cookie-parser';

import { isAuthenticated } from './middleware/authMiddleware.js';

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

app.use(cookieParser());


// Initialize passport middleware
app.use(passport.initialize());
app.use(passport.session());

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.post('/api/register', registerUser);
app.post('/api/login', loginUser);
app.post('/api/todos', isAuthenticated, createTodo);
app.post('/api/update', isAuthenticated, updateTodo);
app.post('/api/delete', isAuthenticated, deleteTodo);
app.post('/api/logout', logoutUser);

app.get(
    '/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get(
    '/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/' }),
    (req, res) => {
        res.redirect('/index.html');
    }
);

app.get('/api/todos', isAuthenticated, getTodos);
// Check if the user is authenticated and logged in
app.get('/api/auth/status', isAuthenticated, (req, res) => {
    res.status(200).json({ loggedIn: true, user: req.user });
});

export default app;