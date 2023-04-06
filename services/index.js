const { isEmpty } = require('lodash');
const moment = require('moment');

const { users } = require('../models');
const { Op } = require('sequelize');

const { HashPassword, VerifyPassword } = require('../helpers/password');
const { GenerateToken } = require('../helpers/token');

async function SignUp (userData) {
    const {
        username, 
        password, 
        fullname
    } = userData;
    console.log('[User] SignUp', userData);
    try {
        if (!username || !password) 
            throw {
                status: 400,
                error: 'Bad Request',
                message: 'Username dan password harus dilampirkan.'
            };
        
        const usernameRegex = /[0-9a-zA-Z]{2,}/;
        if (!username.match(usernameRegex)) 
            throw {
                status: 400,
                error: 'Bad Request',
                message: 'Username minimal 2 karakter.'
            };
        
        const passwordRegex = /[0-9a-zA-Z]{5,}/;
        if (!password.match(passwordRegex)) 
            throw {
                status: 400,
                error: 'Bad Request',
                message: 'Password minimal 5 karakter.'
            };

        const checkUser = await users.findOne({
            where: { username: { [Op.iLike]: `%${username}%` } },
            raw: true
        });
        if (checkUser)
            throw {
                status: 409,
                error: 'Bad Request',
                message: `User dengan nama ${username} sudah tersedia.`
            };

        const passwordEncrypted = await HashPassword(password);

        const created = await users.create({
            username,
            password: passwordEncrypted,
            fullname
        });

        const expired = moment().add(1, 'days');
        const access_token = await GenerateToken(
            {
                username,
                password,
                fullname
            },
            process.env.SECRET,
            { expiresIn: '1d' }
        );

        return {
            message: 'Registrasi berhasil.',
            user: await users.findOne({
                attributes: ['id', 'username', 'fullname', 'last_login'],
                where: { id: created.id },
                raw: true
            }),
            session: { access_token, expired }
        };
    } catch (error) {
        return error;
    }
}

async function Login (userData) {
    const { username, password } = userData;
    console.log('[User] Login', userData);
    try {
        if (!username || !password) 
            throw {
                status: 400,
                error: 'Bad Request',
                message: 'Username dan password harus dilampirkan.'
            };

        const checkUser = await users.findOne({
            where: { username: { [Op.iLike]: `%${username}%` } },
            raw: true
        });
        if (isEmpty(checkUser) || !(await VerifyPassword(password, checkUser.password)))
            throw {
                status: 401,
                error: 'Unauthorized',
                message: 'Login gagal. Username atau password tidak sesuai.'
            };
        
        const expired = moment().add(1, 'days');
        const access_token = await GenerateToken(
            checkUser,
            process.env.SECRET,
            { expiresIn: '1d' }
        );

        await users.update({ last_login: moment().format() }, { where: { id: checkUser.id } });

        return {
            message: 'Login berhasil.',
            user: await users.findOne({ 
                attributes: ['id', 'username', 'fullname', 'last_login'],
                where: { id: checkUser.id } 
            }),
            session: { expired, access_token }
        };
    } catch (error) {
        return error;
    }
}

async function List (userData) {
    const { 
        start, 
        length,
        search,
        order
    } = userData;
    console.log('[User] ListUser', userData);
    try {
        let where;
        (search) 
            ? (where = {
                [Op.and]: [
                    {
                        [Op.or]: {
                            username: { [Op.iLike]: `%${search}%` },
                            fullname: { [Op.iLike]: `%${search}%` }
                        }
                    }
                ]
            })
            : (where = {});
            
        let searchOrder;
        (order) ? searchOrder = [['createdAt', order]] : searchOrder = [['createdAt', 'desc']];

        const [recordsTotal, recordsFiltered, data] = await Promise.all([
            users.count({}),
            users.count({ where }),
            users.findAll({
                attributes: ['id', 'username', 'fullname', 'last_login'],
                where,
                order: searchOrder,
                offset: start,
                limit: length,
                raw: true
            })
        ]);

        return {
            recordsTotal,
            recordsFiltered,
            data
        };
    } catch (error) {
        return error;
    }
}

module.exports = {
    SignUp,
    Login,
    List
}