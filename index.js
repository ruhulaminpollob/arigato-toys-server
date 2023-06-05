const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;


// middleware
const corsOptions = {
    origin: '*',
    credentials: true,
    optionSuccessStatus: 200,
}
app.use(express.json());
app.use(cors())

app.get('/', (req, res) => {
    res.send('Arigatou Toy Is Running');
});


// mongodb 

// console.log(process.env.DB_PASS);



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.uwz0znz.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
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

        const toysCollection = client.db('toysDB').collection('toys')

        // get all toys data from mongodb
        app.get('/toys', async (req, res) => {
            const result = await toysCollection.find().toArray();
            res.send(result);
        })
        //get specific users toys

        app.get('/mytoys', async (req, res) => {
            // console.log(req.query);
            let query = {}
            if (req.query?.email) {
                query = { supplierEmail: req.query.email }
            }
            const result = await toysCollection.find(query).toArray()
            res.send(result)
        })
        // get specific one toy
        app.get('/toys/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await toysCollection.findOne(query)
            res.send(result)
        })

        // Add single Toys
        app.post('/toys', async (req, res) => {
            const newToys = req.body;
            console.log(newToys);
            const result = await toysCollection.insertOne(newToys);
            res.send(result);
        })

        //patch update toys
        app.put('/toys/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const option = { upsert: true }
            const updatedToys=req.body;
            const updateDoc = {
                $set: {
                    name:updatedToys.name, 
                    quantity:updatedToys.quantity, 
                    category:updatedToys.category,
                    price:updatedToys.price,
                    description:updatedToys.description,
                    photo:updatedToys.photo
                }
            }
            const result=await toysCollection.updateOne(filter, updateDoc,option)


            res.send(result)
        })




        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);





app.listen(port, () => {
    console.log('Arigato Toys Server is Running on PORT: ' + port);
})