const bodyParser = require('body-parser')
const mysql = require('mysql')
const jwt = require('jsonwebtoken')
const express = require('express')
const app = express()
const port = process.env.PORT || 3000
const secret = 'HSvysgq370stdUtnJnu7Du7TkRrwKivphtOsRtpwibjoyQnBSbIouUi5zesTsQcqzn8ZgiEPplKwcA1lPB//zA=='

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

const db = mysql.createConnection({
    host: 'ckshdphy86qnz0bj.cbetxkdyhwsb.us-east-1.rds.amazonaws.com',
    user: 'vk6z4up90k7t8a4v',
    password: 'zlxoc2adb3t470od',
    database: 'vgzf8hypwzs91apf'
})

db.connect((error) => {
    if (error) throw error

    console.log('Database connected.')
})

app.get('/', (req, res) => {
    return res.send({ error: false, message: 'Welcome to RESTful APIs by ModeJS.' })
})

app.post('/api/v1/login', (req, res) => {
    const id = req.body.id
    const password = req.body.password

    if (!id || !password) {
        res.status(400).send({
            error: true,
            message: 'Please provide id and password.'
        })
    } else {
        const sql = 'SELECT * FROM users WHERE id = ? AND password = ?'
        db.query(sql, [id, password], (error, results, fields) => {
            if (error) throw error

            if (results === undefined || results.length == 0) {
                res.send({ error: true, message: 'User id or password is invalid.' })
            } else {
                const user = {
                    id: results[0].id,
                    firstName: results[0].first_name,
                    lastName: results[0].last_name,
                    section: results[0].section,
                    email: results[0].email
                }

                jwt.sign({ user }, secret, { expiresIn: '60s' }, (error, token) => {
                    if (error) throw error

                    res.send({
                        error: false,
                        status: 200,
                        message: 'Successfully token created.',
                        token: token
                    })
                })
            }
        })
    }
})

app.get('/api/v1/materials', verifyToken, (req, res) => {
    jwt.verify(req.token, secret, (error, auth) => {
        if (error) {
            res.status(403).send({ error: true, status: 403, message: 'Access denied.' })
        } else {
            const sql = 'SELECT * FROM materials'
            db.query(sql, (error, results, fields) => {
                if (error) throw error

                if (results === undefined || results.length == 0) {
                    res.send({
                        error: true,
                        status: 200,
                        message: 'Data is not found.'
                    })
                } else {
                    res.send({
                        error: false,
                        status: 200,
                        message: 'Successfully get all materials.',
                        data: results
                    })
                }
            })
        }
    })
})

app.post('/api/v1/material', verifyToken, (req, res) => {
    jwt.verify(req.token, secret, (error, auth) => {
        if (error) {
            res.status(403).send({ error: true, status: 403, message: 'Access denied.' })
        } else {
            const matCode = req.body.matCode
            const matDesc = req.body.matDesc
            const baseUom = req.body.baseUom

            if (!matCode || !matDesc || !baseUom) {
                res.status(400).send({
                    error: true,
                    status: 400,
                    message: 'Please provide material data.'
                })
            } else {
                const sql = 'INSERT INTO materials (mat_code, mat_desc, base_uom, created_by, updated_by) VALUES (?, ?, ?, ?, ?)'
                db.query(sql, [matCode, matDesc, baseUom, auth.user.id, auth.user.id], (error, results, fields) => {
                    if (error) throw error

                    res.send({
                        error: false,
                        status: 200,
                        message: 'Successfully material added.',
                        data: results
                    })
                })
            }
        }
    })
})

function verifyToken(req, res, next) {
    const bearerHeader = req.headers['authorization']
    if (bearerHeader === undefined) {
        res.status(401).send({ error: true, status: 401, message: 'Unauthorized.' })
    } else {
        const bearer = bearerHeader.split(' ')
        const bearerToken = bearer[1]
        req.token = bearerToken
        next()
    }
}

app.listen(port, () => {
    console.log(`Server is running on port ${port}.`)
})

module.exports = app