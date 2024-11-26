import pool from '../config/db.js';

export const createTodo = async (req, res) => {
    // Get title and description from the request body
    const { title, description } = req.body;
    const userId = req.user ? req.user.id : 1;

    if (!title || !description) {
        return res.status(400).json({ error: 'Both title and description are required' });
    }

    try {
        const result = await pool.query(
            'INSERT INTO todos (user_id, title, description) VALUES($1, $2, $3) RETURNING *',
            [userId, title, description]
        );

        res.status(201).json({ message: 'Todo created successfully', data: result.rows[0] });

    } catch (error) {
        console.error('Error creating todo:', error);
        res.status(500).json({ error: 'Failed to create todo' });
    }
};

export const getTodos = async (req, res) => {
    try {
        const userID = req.user.id;
        const result = await pool.query('SELECT * FROM todos WHERE user_id = $1', [userID]);
        res.status(200).json({ todos: result.rows });

    } catch (error) {
        console.error('Error getting todos:', error);
        res.status(500).json({ message: 'Failed to get todos' });
    }
};

export const updateTodo = async (req, res) => {
    try {
        const { id: todoID, title, description } = req.body;

        // Validation for required fields
        if (!req.body || !title || !description || !todoID) {
            return res.status(400).json({ error: 'All fields (title, description, id) are required' });
        }

        // Check if the todo exists
        // const validID = await pool.query('SELECT COUNT(*) FROM todos WHERE id = $1', [todoID]);
        const validID = await pool.query('SELECT EXISTS(SELECT 1 FROM todos WHERE id = $1)', [todoID]);
        if (!validID.rows[0].exists) {
            return res.status(400).json({ error: 'Invalid, id doesn\'t exists' });
        }
        // Running the update query
        const updateResult = await pool.query('UPDATE todos SET title = $1, description = $2 WHERE id = $3 RETURNING *',
            [title, description, todoID]);
        res.status(200).json({ todos: updateResult.rows });

    } catch (error) {
        console.error('Error updating todo:', error);
        res.status(500).json({ message: 'Failed to update todo' });
    }
};

export const deleteTodo = async (req, res) => {
    try {
        const { id: todoID } = req.body;

        if (!todoID) {
            res.status(400).json({ error: 'ID is required' });
        }

        const validateID = await pool.query('SELECT EXISTS(SELECT 1 FROM todos WHERE id = $1)', [todoID]);
        if (!validateID.rows[0].exists) {
            res.status(400).json({ error: 'Invalid, id doesn\'t exist' });
        }

        const deleteTodo = await pool.query('DELETE FROM todos WHERE id = $1 RETURNING *', [todoID]);
        res.status(200).json({ message: `Todo # ${todoID} has been deleted successfully`, todo: deleteTodo.rows[0] });

    } catch (error) {
        console.error('Error Deleting todo:', error);
        res.status(500).json({ message: 'Failed to delete todo' });
    }
};