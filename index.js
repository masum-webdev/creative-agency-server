const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs-extra');
const fileUpload = require('express-fileupload');
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config();


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.lmoae.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('orders'));
app.use(fileUpload());

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const serviceCollection = client.db("creativeAgency").collection("services");
    const orderCollection = client.db("creativeAgency").collection("orders");
    const adminCollection = client.db("creativeAgency").collection("admin");
    const reviewCollection = client.db("creativeAgency").collection("review");

    app.post('/addOrder', (req, res) => {
        const orderInfo = req.body;

        orderCollection.insertOne(orderInfo)
        .then(result => {
            res.send(result.insertedCount > 0)
        })
    })

    app.post('/addService', (req, res) => {
        const file = req.files.file;
        const title = req.body.title;
        const description = req.body.description;

        const newImg = file.data;
        const encImg = newImg.toString('base64');

        const icon = {
            contentType: file.mimetype,
            size: file.size,
            img: Buffer.from(encImg, 'base64')
        };

        serviceCollection.insertOne({title, description, icon})
        .then(result => {
            res.send(result.insertedCount > 0)
        })
    })

    app.post('/addAdmin', (req, res) => {
        const admin = req.body;
        adminCollection.insertOne(admin)
        .then(result => {
            res.send(result.insertedCount > 0)
        })
    })

    app.post('/addReview', (req, res) => {
        const review = req.body;
        reviewCollection.insertOne(review)
        .then(result => {
            res.send(result.insertedCount > 0)
        })
    })

    app.post('/orders', (req, res) => {
        const email = req.body.email;
        adminCollection.find({email: email})
        .toArray((err, admins) => {
            const filter = {};

            if(admins.length === 0){
                filter.email = email
            }
            orderCollection.find(filter)
            .toArray((err, documents) => {
                res.send(documents)
            })
        })
    })

    app.post('/isAdmin', (req, res) => {
        const email = req.body.email;
        adminCollection.find({email: email})
        .toArray((err, admins) => {
            res.send(admins.length > 0);
        })
    })

    app.get('/services', (req, res) => {
        serviceCollection.find({})
        .toArray((err, documents) => {
            res.send(documents)
        })
    })

    app.get('/reviews', (req, res) => {
        reviewCollection.find({})
        .toArray((err, documents) => {
            res.send(documents)
        })
    })

    app.get('/admin', (req, res) => {
        adminCollection.find({})
        .toArray((err, documents) => {
            res.send(documents)
        })
    })

    app.get('/', (req, res) => {
        res.send("hello from db it's working")
    })
});

app.listen(process.env.PORT || 5000)
