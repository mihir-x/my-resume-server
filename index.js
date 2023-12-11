const express = require('express')
const cors = require('cors')
require('dotenv').config()
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express()
const port = process.env.PORT || 5000
const formData = require('form-data');
const Mailgun = require('mailgun.js');
const mailgun = new Mailgun(formData);

const mg = mailgun.client({ username: 'api', key: process.env.MAIL_GUN_API_KEY || 'key-yourkeyhere' });

app.use(express.json())
app.use(cors())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.5hh1tg8.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();
        // Send a ping to confirm a successful connection
        const mailCollection = client.db('resumeDB').collection('mails')

        app.post('/send-mail', async (req, res) => {
            const mailInfo = req.body
            const saveMailResult = await mailCollection.insertOne(mailInfo)

            mg.messages.create('sandbox752b2948fd774c2da61cee493b4c4b36.mailgun.org', {
                from: `${mailInfo.email} <mailgun@sandbox-123.mailgun.org>`,
                to: ["ictlancerx@gmail.com"],
                subject: "Hello",
                text: `${mailInfo.message}`,
                html: `<p>${mailInfo.message}</p>`
            })
                .then(msg => console.log(msg)) // logs response data
                .catch(err => console.log(err)); // logs any error
        })

        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('My resume server is running')
})
app.listen(port, (req, res) => {
    console.log('My resume server is running on: ', port)
})
