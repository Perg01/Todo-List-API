import pool from './config/db.js';
import fs from 'fs';
import path from 'path';

const runMigrations = async () => {

    try {

        const usersMigration = fs.readFileSync(path.resolve('./migrations/create_users_table.sql'), 'utf-8');
        const todosMigration = fs.readFileSync(path.resolve('./migrations/todos.sql'), 'utf-8');

        console.log('Executing users migration...');
        await pool.query(usersMigration);
        console.log('Executing todos migration...');
        await pool.query(todosMigration);

        console.log('Migration completed successfully');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await pool.end();
    }
};

runMigrations();