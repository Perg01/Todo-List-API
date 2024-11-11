import pool from './config/db.js';
import fs from 'fs';
import path from 'path';

const runMigrations = async () => {
    const migrationPath = path.resolve('./migrations/create_users_table.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');

    try {
        await pool.query(migrationSQL);
        console.log('Migration completed successfully');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        pool.end();
    }
};

runMigrations();