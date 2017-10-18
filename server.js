// Basic Setup
var http = require('http');
var express = require('express');
var mysql = require('mysql');
var parser = require('body-parser');

// Database Connection
var connection = mysql.createConnection({
    host : 'localhost',
    user : 'root',
    password : '',
    database : 'node_shop'
});

try {
    connection.connect();
} catch(e) {
    console.log('Database Connection failed:' + e);
}

// Setup express
var app = express();
app.use(parser.json());
app.use(parser.urlencoded({extended: true}));
app.set('port', process.env.PORT || 5000);

// Set default route
app.get('/', function (req, res) {
    res.send('<html><body><p>Welcome to Shop App</p></body></html>');
});

app.get('/product/all', function(req, res) {
    connection.query("SELECT * FROM nd_products", function(err, result, fields) {
        if(!err) {
            var response = [];

            if(result.length != 0) {
                response.push({'result' : 'success', 'data' : result});
            } else {
                response.push({'result' : 'error', 'msg' : 'No Results Found'});
            }

            res.setHeader('Content-Type', 'application/json');
            res.status(200).send(JSON.stringify(response));
        } else {
            res.status(400).send(err);
        }
    });
});

app.post('/product/add', function(req, res) {
    var response = [];
    console.log(req.body.name);
    console.log(req.body.price);
    console.log(req.body.imageUrl);
    if(
        typeof req.body.name !== 'undefined' && 
        typeof req.body.price !== 'undefined' &&
        typeof req.body.imageUrl !== 'undefined'
    ) {
        var name = req.body.name, price = req.body.price, imageUrl = req.body.imageUrl;

        connection.query('INSERT INTO nd_products (product_name, product_price, product_image) VALUES (?, ?, ?)',
            [name, price, imageUrl],
            function(err, result) {
                if(!err) {
                    if(result.affectedRows != 0) {
                        response.push({'result' : 'success'});
                    } else {
                        response.push({'msg' : 'No Result Found'});
                    }

                    res.setHeader('Content-Type', 'application/json');
                    res.status(200).send(JSON.stringify(response));
                } else {
                    res.status(400).send(err);
                }
            });
    } else {
        response.push({'result' : 'error', 'msg' : 'Please fill required details'});
        res.setHeader('Content-type', 'applicationCache/json');
        res.status(200).send(JSON.stringify(response));
    }
});

app.get('/product/:id', function(req, res){
    var id = req.params.id;

    connection.query('SELECT * FROM nd_products WHERE id=?', [id], function(err, rows, fields) {
        if(!err) {
            var response = [];

            if(rows.length != 0) {
                response.push({'result' : 'success', 'data' : rows});
            } else {
                response.push({'result' : 'error', 'msg' : 'No Results Found'});
            }

            res.setHeader('Content-Type', 'application/json');
            res.status(200).send(JSON.stringify(response));
        }else {
            res.status(400).send(err);
        }
    });
});

app.post('/product/edit/:id', function (req, res) {
    var id = req.params.id, response = [];

    if(
        typeof req.body.name !== 'undefined' &&
        typeof req.body.price !== 'undefined' &&
        typeof req.body.imageUrl !== 'undefined'
    ) {
        var name = req.body.name, price = req.body.price, imageUrl = req.body.imageUrl;

        connection.query('UPDATE nd_products SET product_name = ?, product_price = ?, product_image = ? WHERE id = ?',
         [name, price, imageUrl, id],
         function(err, result) {
             if(!err) {
                 if(result.affectedRows != 0) {
                     response.push({'result' : 'success'});
                 } else {
                     response.push({'msg' : 'No Result Found'});
                 }
                 
                 res.setHeader('Content-Type' , 'application/json');
                 res.status(200).send(JSON.stringify(response));
             } else {
                 res.status(400).send(err);
             }
         });
    } else {
        response.push({'result' : 'error', 'msg' : 'Please fill required information'});
        res.setHeader('Content-Type', 'application/json');
        res.send(200, JSON.stringify(response));
    }
});

app.delete('/product/delete/:id', function(req, res) {
    var id = req.params.id;

    connection.query('DELETE FROM nd_products WHERE id=?', [id], function(err, result) {
        if(!err) {
            var response = [];

            if(result.affectedRows != 0) {
                response.push({'result' : 'success'});
            } else {
                response.push({'msg' : 'No Result Found'});
            }

            res.setHeader('Content-Type', 'application/json');
            res.status(200).send(JSON.stringify(response));
        } else {
            res.status(400).send(err);
        }
    })
});

// Create server
http.createServer(app).listen(app.get('port'), function() {
    console.log('Server is listening on port ' + app.get('port'));
});
