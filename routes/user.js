const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwtAuth = require('../middlewares/jwtAuth');

router.post('/login', async (req, res, next) => {
    try {
        const [user, isValidUser] = await User.login(req, res, next)

        if (isValidUser) {
            return res.status(200).send(user);
        }
        else {
            return res.status(401).send({ error: 'unauthorized' });
        }

    } catch (error) {
        next(error);
    }
});

router.post('/signup', async (req, res, next) => {
    try {
        const [user, error] = await User.signUp(req, res, next);

        if (!error) {
            res.status(201).send({ message: 'User created!' });
        }
        else {
            res.status(400).send({ error })
        }

    } catch (error) {
        next(error)
    }
})

router.get('/logout', jwtAuth, async (req, res, next) => {
    try {
        const isloggedOut = await User.logout(req, res, next);
        res.status(200).send({ isloggedOut })
    } catch (error) {
        next(error)
    }
})

router.post('/change-password', jwtAuth, async (req, res, next) => {
    try {
        const isChanged = await User.changePassword(req, res, next);
        res.status(200).send({ isChanged })
    } catch (error) {
        next(error)
    }
})

router.get('/user-info', async (req, res, next) => {
    try {
        const user = new UserNS({
            firstname: 'tanmay',
            lastname: 'yerunkar',
            email: 'tanyerunkar62@gmail.com',
            password: 'Newuser@123'
        })

        await user.save();
        return res.send(user);

    } catch (error) {
        console.log(error);
        next(error);
    }
})


module.exports = router;