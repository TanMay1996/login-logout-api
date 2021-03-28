const jwt = require('jsonwebtoken');
const User = require('../models/User')

module.exports = async (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decodedToken = jwt.verify(token, process.env.JWT_TOKEN_SECRET);
        const user = await User.findOne({ email: decodedToken.email, authToken: token, isLoggedIn: true })
        if (decodedToken && user) {
            req.user = decodedToken;
            next();
        } else {
            throw new Error('Invalid Token');
        }
    } catch (err) {
        res.status(401).json({ error: 'Unauthorized' });
    }
};