import express from 'express';
import dotenv from 'dotenv';
import { registerUser, loginUser } from './controllers/userController.js';
import { createTodo } from './controllers/todoController.js';
import { authenticateUser } from './middleware/authMiddleware.js';

dotenv.config();
const app = express();
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello World!');
});
app.post('/api/register', registerUser);
app.post('/api/login', loginUser);
app.post('/api/todos', authenticateUser, createTodo);

export default app;