const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

require("dotenv").config();

const port = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.listen(port, () => {
  console.log("Server is running on port ", port);
});

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.PASSWORD}@cluster0.iidrxjp.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  // All collections
  const userCollection = client
    .db("Construction-Application")
    .collection("users");

  // get users data
  app.get("/getUser", async (req, res) => {
    const id = req.query.id;
    console.log(id);

    const result = await userCollection.findOne({ userId: id });

    console.log(result);
    const { _id, role, userId, password, name } = result;

    if (result) {
      res.send({
        status: 1,
        userInfo: { _id, role, userId, password, name },
      });
    } else {
      res.send({
        status: 0,
      });
    }
  });

  // get all users
  app.get("/allUser", async (req, res) => {
    const cursor = userCollection.find({});
    const result = await cursor.toArray();
    res.send(result);
  });

  //get users draftapplication
  app.get("/draftApplications/:id", async (req, res) => {
    const id = req.params.id;
    console.log(id);

    const { draftApplication } = await userCollection.findOne({
      _id: new ObjectId(id),
    });

    res.send(draftApplication);
  });

  // store user data
  app.post("/addUser", async (req, res) => {
    const userInfo = req.body;

    console.log(userInfo);

    const findSameIdPerson = await userCollection.findOne({
      userId: userInfo.userId,
    });
    console.log(findSameIdPerson);

    if (findSameIdPerson) {
      res.send({
        result: 0,
        message: "User id already exist",
      });
    } else {
      const result = await userCollection.insertOne(userInfo);
      res.send(result);
    }
  });

  // update user draft application  data
  app.patch("/updateDraftApplicationData/:id", async (req, res) => {
    const userId = req.params.id;
    const newDraftData = req.body;

    const filter = { _id: new ObjectId(userId) };

    const { draftApplication: oldDraftData } = await userCollection.findOne(
      filter
    );
    // console.log(oldDraftData, "Old draft data");

    const findExistingData = oldDraftData.findIndex(
      (application) => application.applicationNo === newDraftData.applicationNo
    );

    console.log(findExistingData, "findExistingData");

    if (findExistingData === -1) {
      oldDraftData.push(newDraftData);
    } else {
      oldDraftData[findExistingData] = {
        ...oldDraftData[findExistingData],
        ...newDraftData,
      };
    }

    const updateDoc = {
      $set: {
        draftApplication: oldDraftData,
      },
    };

    // console.log(oldDraftData[findExistingData]);
    // console.log(newDraftData);

    const result = await userCollection.updateOne(filter, updateDoc);

    res.send(result);
  });

  // update user information
  app.patch("/updateUserInfo/:id", async (req, res) => {
    const id = req.params.id;
    const { name, userId, password, role } = req.body;

    console.log(id);

    const filter = { _id: new ObjectId(id) };

    const updateDoc = {
      $set: {
        name,
        userId,
        password,
        role,
      },
    };

    const result = await userCollection.updateOne(filter, updateDoc);

    res.send(result);
  });

  // delete an individual user
  app.delete("/deleteUser/:id", async (req, res) => {
    const userId = req.params.id;
    console.log(userId);

    const query = { _id: new ObjectId(userId) };

    const result = await userCollection.deleteOne(query);

    res.send(result);
  });

  // delete specific draft application
  app.delete("/deleteSingleDraft", async (req, res) => {
    const { applicationNo, userID } = req.body;

    console.log(applicationNo, userID);

    // const userInfo = await userCollection.findOne({ _id: ObjectId(userID) });

    const result = await userCollection.updateOne(
      { _id: new ObjectId(`${userID}`) },
      { $pull: { draftApplication: { applicationNo } } }
    );
    console.log(result);
    res.send(result);
  });
}

run().catch(console.dir);

// Export the Express API
module.exports = app;
