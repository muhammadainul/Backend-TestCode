const jwt = require('jsonwebtoken');

module.exports = {
    GenerateToken: (data, session_secret, options) => 
        new Promise(async (resolve, reject) => {
            console.log('GenerateToken', { data, session_secret, options});
            try {
                jwt.sign(data, session_secret, options, (err, token) => {
                    if (err) reject(err);
                    resolve(token);
                });
            } catch (error) {
                console.log('error', error);
                reject(error);
            }
        }),
    VerifyToken: (token, session_secret) =>
        new Promise(async (resolve, reject) => {
            console.log('VerifyToken', { token, session_secret });
            try {
                jwt.verify(token, session_secret, (err, decoded) => {
                    if (err) reject(err);
                    resolve(decoded);
                })
            } catch (error) {
                console.log('error', error);
                reject(error);
            }
        })
}