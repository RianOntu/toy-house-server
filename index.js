require('dotenv').config();
const express=require('express');
const app=express();
const cors=require('cors');
const port=process.env.PORT || 5000;

app.use(cors());
app.use(express.json());




const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.eiu6qvf.mongodb.net/?retryWrites=true&w=majority`;

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
    const categoryCollection=client.db('toy-house').collection('shopByCategory');
    const usertoysCollection=client.db('toy-house').collection('userToys')

    app.get('/alltabtoys',async(req,res)=>{
      const cursor = categoryCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })
    app.get('/toysbycategory', async (req, res) => {
     
      let query = {};
      if (req.query?.category ) {
          query = { categoryName: req.query.category }
      }
      const result = await categoryCollection.find(query).toArray();
      res.send(result);
  })
  app.get('/toydetails/:id',async (req,res)=>{
    const id=req.params.id;
    const cursor = categoryCollection.find();
      const result = await cursor.toArray();
      const allCarToys = [];

result.forEach(category => {
  category.subcategories.forEach(subcategory => {
    allCarToys.push(...subcategory.carToys);
  });
});
console.log(allCarToys);
const singletoy=allCarToys.find(toy=>toy.id==id);
console.log(singletoy);
res.send(singletoy)

  })
  app.post('/addtoy',async(req,res)=>{
    const newtoy=req.body;
    const result=await usertoysCollection.insertOne(newtoy);
    res.send(result);
  })
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    
  }
}
run().catch(console.dir);

app.get('/',(req,res)=>{
    res.send("server is running")
})
app.listen(port);