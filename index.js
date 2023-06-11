require('dotenv').config();
const express=require('express');
const app=express();
const cors=require('cors');
const port=process.env.PORT || 5000;

app.use(cors());
app.use(express.json());




const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
  app.get('/alltoys',async(req,res)=>{
    const result=await usertoysCollection.find().limit(20).toArray();
    res.send(result);
  })
  app.get('/toysbysearch',async(req,res)=>{
    let query = {};
      if (req.query?.toyName ) {
          query = { nameoftoy: req.query.toyName }
      }
      const result = await usertoysCollection.find(query).toArray();
      res.send(result);
  })
  app.get('/mytoys',async(req,res)=>{
    let status=req.query?.status;
    let query = {};
      if (req.query?.username ) {
          query = { sellername: req.query.username }
      }
      const options = {
        
        sort: { 
            "price": status === 'asc' ? 1 : -1
        }
      }
      const result = await usertoysCollection.find(query,options).toArray();
      res.send(result);
  })
  app.get('/update/:id',async (req,res)=>{
    const id=req.params.id;
    const filter={_id:new ObjectId(id)};
    const singleToy=await usertoysCollection.findOne(filter);
    res.send(singleToy);
  })
  app.put('/update/:id', async (req, res) => {
    const id = req.params.id;
    const filter = { _id: new ObjectId(id) };
    const toy = req.body;
    const option = {upsert: true};
    const updatedToy = {
        $set: {
          nameoftoy:toy.nameoftoy,
          purloftoy:toy.purloftoy,
          subcategory:toy.subcategory,
          price:toy.price,
          rating:toy.rating,
          avquantity:toy.avquantity,
          details:toy.details,
          sellername:toy.sellername,
          selleremail:toy.selleremail
        }
    }
    const result = await usertoysCollection.updateOne(filter, updatedToy, option);
    console.log(result);
    res.send(result);
})
app.delete('/delete/:id', async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) }
  const result = await usertoysCollection.deleteOne(query);
  res.send(result);
})
app.get('/toy-details/:id',async (req,res)=>{
  const id=req.params.id;
  const query={_id:new ObjectId(id)};
  const result=await usertoysCollection.findOne(query);
  res.send(result);
})

    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
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