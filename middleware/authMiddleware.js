import jwt from 'jsonwebtoken';

export const isAuthenticated = (req, res, next) => {

    // OAuth based authentication
    if (req.isAuthenticated && req.isAuthenticated()) {
        return next();
    }

    // token based authentication
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Access denied, no token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        console.error('Error verifying token:', error);
        res.status(401).json({ error: 'Unauthorized' });
    }
};