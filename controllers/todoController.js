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

