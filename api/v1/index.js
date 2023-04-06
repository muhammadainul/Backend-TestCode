const express = require('express');
const router = express.Router();

const IndexService = require('../../services/index');

const { IsVerified } = require('../../middlewares/is_verified');

router.post('/auth/signup', async (req, res) => {
    const userData = req.body;

    const result = await IndexService.SignUp(userData);
    console.log('result', result);

    if (result.error) {
        return res.status(result.status).json({ 
            status: result.status, 
            error: result.message 
        });
    } else {
        return res.status(200).json({
            status: 200,
            data: result
        });
    }
});

router.post('/auth/login', async (req, res) => {
    const userData = req.body;

    const result = await IndexService.Login(userData);
    console.log('result', result);

    if (result.error) {
        return res.status(result.status).json({ 
            status: result.status, 
            error: result.message 
        });
    } else {
        return res.status(200).json({
            status: 200,
            data: result
        });
    }
});

router.get('/user/userlist', IsVerified, async (req, res) => {
    const userData = req.query;

    const result = await IndexService.List(userData);
    console.log('result', result);

    if (result.error) {
        return res.status(result.status).json({ 
            status: result.status, 
            error: result.message 
        });
    } else {
        return res.status(200).json({
            status: 200,
            data: result
        });
    }
});

module.exports = router;