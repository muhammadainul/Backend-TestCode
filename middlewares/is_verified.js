const { split } = require('lodash');

const { VerifyToken } = require('../helpers/token');

module.exports = {
    IsVerified: async (req, res, next) => {
        const { authorization } = req.headers;
        const token = split(authorization, ' ')[1];

        if (!token) 
            return res.status(401).json({
                status: 401,
                error: 'Unauthorized',
                message: 'Otorisasi gagal! Silahkan melakukan login terlebih dahulu.'
            });

        const user = await VerifyToken(token, process.env.SECRET);
        if (user) {
            req.user = user;
            next();
        } else {
            return res.status(401).json({
                status: 401,
                error: 'Unauthorized',
                message: 'Otorisasi gagal! Silahkan melakukan login terlebih dahulu.'
            });
        }
    }
}