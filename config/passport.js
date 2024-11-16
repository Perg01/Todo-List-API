import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import pool from './db.js';

// GoogleStrategy handles login with Google and gets user data
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: 'api/auth/google/callback'
},
    async (accessToken, refreshToken, profile, done) => { // Process's user data received from Google
        try {
            console.log('Google profile:', profile);
            const email = profile.emails[0].value;
            const name = profile.displayName;

            // Check if the user already exists
            const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
            let user;

            if (result.rows.length > 0) {
                user = result.rows[0]; // User already exists
            } else {
                const insertResult = await pool.query(
                    'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *', [name, email]
                );
                user = insertResult.rows[0];
            }

            done(null, user);
        } catch (error) {
            done(error, null);
        }
    }));

// Serialize user (stores the user's id in session)
passport.serializeUser((user, done) => done(null, user.id));

// Deserialize user (retrieves the user object from the database using the id stored in the session)
passport.deserializeUser(async (id, done) => {
    try {
        const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
        done(null, result.rows[0]);
    } catch (error) {
        done(error, null);
    }
});

export default passport;