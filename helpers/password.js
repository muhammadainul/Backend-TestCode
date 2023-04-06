const crypto = require('crypto');

module.exports = {
    HashPassword: (password) =>
        new Promise(async (resolve, reject) => {
            console.log('HashPassword', { password });
            try {
                const salt = crypto.randomBytes(8).toString('hex');

                crypto.scrypt(password, salt, 64, (err, key) => {
                    if (err) reject(err);
                    resolve(salt + ':' + key.toString('hex'));
                });
            } catch (error) {
                console.log('error', error);
                reject(error);
            }
        }),
    VerifyPassword: (password, hash) =>
        new Promise(async (resolve, reject) => {
            console.log('VerifyPassword', { password, hash });
            try {
                const [salt, hashKey] = hash.split(':');
                crypto.scrypt(password, salt, 64, (err, key) => {
                    if (err) reject(err);
                    resolve(hashKey == key.toString('hex'));
                });
            } catch (error) {
                console.log('error', error);
                reject(error);
            }
        })
};