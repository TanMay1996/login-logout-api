const mongoose = require('../config/mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = mongoose.model('User', {
    firstname: {
        type: String,
        required: true,
        trim: true
    },
    lastname: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Invalid Email address!');
            }
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 8,
        trim: true
    },
    isLoggedIn: {
        type: Boolean,
        default: false
    },
    authToken: {
        type: String,
        default: null
    }
})

User.login = async (req, res, next) => {
    try {
        const email = req.body.email;
        let isValidUser = false;
        let token = '';
        let user = await User.findOne({ email });

        if (user) {
            let tokenPayload = {
                id: user._id,
                firstname: user.firstname,
                lastname: user.lastname,
                email: user.email
            };
            isValidUser = bcrypt.compareSync(req.body.password, user.password);

            if (isValidUser) {
                token = jwt.sign(tokenPayload, process.env.JWT_TOKEN_SECRET, { expiresIn: process.env.JWT_EXPIRY });
                user.authToken = token;
                user.isLoggedIn = true;
                await user.save();
                tokenPayload.token = token;
            }
            return [tokenPayload, isValidUser]
        }
        return [undefined, isValidUser]
    } catch (error) {
        next(error)
    }
}

User.signUp = async (req, res, next) => {
    try {
        const email = req.body.email;
        let user = await User.find({ email });
        if (user.length == 0) {
            user = new User({
                firstname: req.body.firstname,
                lastname: req.body.lastname,
                email: req.body.email,
                password: bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10))
            })
            await user.save()
            return [user, undefined];
        }
        else {
            return [undefined, 'User already Exists!'];
        }

    } catch (error) {
        next(error)
    }
}

User.logout = async (req, res, next) => {
    try {
        const id = req.user.id;
        const { n, nModified, ok } = await User.updateOne(
            {
                _id: id,
                isLoggedIn: true
            },
            {
                isLoggedIn: false,
                authToken: null
            }
        )

        return !(!nModified)
    } catch (error) {
        next(error)
    }
}

User.changePassword = async (req, res, next) => {
    try {
        const id = req.user.id;
        const newPassword = req.body.newPassword;
        let isupdated = false;
        const email = req.user.email;

        let user = await User.findOne({ email });
        if (user) {
            const isValidUser = bcrypt.compareSync(req.body.oldPassword, user.password);
            if (isValidUser) {
                const { n, nModified, ok } = await User.updateOne(
                    {
                        _id: id,
                        isLoggedIn: true
                    },
                    {
                        password: bcrypt.hashSync(newPassword, bcrypt.genSaltSync(10))
                    }
                )
                if (nModified) { isupdated = true }
            }
        }
        return !(!isupdated)
    } catch (error) {
        next(error)
    }
}

module.exports = User;