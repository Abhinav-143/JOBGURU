const express = require('express');
const app = express();
const cors = require('cors');
const port = process.env.PORT || 5000;
require('dotenv').config();

console.log(process.env.DB_USER);
console.log(process.env.DB_PASSWORD);

// Middleware
app.use(express.json());
app.use(cors());

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@jobdemo1.jw9veev.mongodb.net/?retryWrites=true&w=majority&appName=jobdemo1`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

let jobsCollections;

async function run() {
  try {
    // Connect the client to the server
    await client.connect();
    const db = client.db("mernJobPortal");
    jobsCollections = db.collection("demoJobs");

    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
  }
}

run().catch(console.dir);

// POST job
app.post("/post-job", async (req, res) => {
  try {
    const body = req.body;
    body.createAT = new Date();
    const result = await jobsCollections.insertOne(body);

    if (result.acknowledged) {
      return res.status(200).json(result);
    } else {
      return res.status(500).json({
        message: "Failed to insert job",
        status: false
      });
    }
  } catch (err) {
    console.error("Error in POST /post-job:", err);
    return res.status(500).json({
      message: "An error occurred",
      status: false
    });
  }
});

// GET all jobs
app.get("/all-jobs", async (req, res) => {
  try {
    const jobs = await jobsCollections.find().toArray();
    res.send(jobs);
  } catch (err) {
    console.error("Error in GET /all-jobs:", err);
    res.status(500).json({
      message: "An error occurred",
      status: false
    });
  }
});

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log("Closing MongoDB client...");
  await client.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log("Closing MongoDB client...");
  await client.close();
  process.exit(0);
});
