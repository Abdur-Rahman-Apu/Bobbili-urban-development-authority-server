const schedule = require("node-schedule");
const { client } = require("../../Configs/ConnectDB");
const {
  findSubmitAppsByQuery,
  insertApprovedApp,
  deleteSubmitApp,
} = require("../DBQueries/DbQueries");

async function performMongoDBAction() {
  try {
    await client.connect();

    const allSubmitApplications = await findSubmitAppsByQuery({});
    console.log(allSubmitApplications, "All");

    const checkDaysPassed = (dateFromDB) => {
      const dateAsFormat = dateFromDB.split("-").reverse().join("-");
      console.log(dateAsFormat, "FIRST GET DATE");

      const targetDate = new Date(dateAsFormat);

      const currentDate = new Date();

      const timeDifference = currentDate - targetDate;

      const daysDifference = timeDifference / (24 * 3600 * 1000);

      console.log(daysDifference, "days difference");

      if (daysDifference > 15) {
        console.log(targetDate, daysDifference);
        return 1;
      } else {
        return 0;
      }
    };

    allSubmitApplications.forEach(async (eachApplication) => {
      const isPassed = checkDaysPassed(eachApplication?.submitDate);
      console.log(isPassed, "IS PASSED");
      if (isPassed) {
        eachApplication["status"] = "approved";
        delete eachApplication["_id"];
        await insertApprovedApp({ ...eachApplication });

        await deleteSubmitApp({
          applicationNo: eachApplication.applicationNo,
        });
      }
    });

    // const result = await collection.insertOne({ key: "value" });
    // console.log("Document inserted:", result.ops[0]);
  } catch (err) {
    console.error(
      "Error connecting to MongoDB or performing the operation:",
      err
    );
  }
}

// Schedule the task to run after a 30-second delay
const taskTime = "0 0 * * *"; // 30 seconds from now

// const taskTime = new Date(new Date().getTime() + 5 * 1000); // 30 seconds from now
const performCornJob = () => {
  schedule.scheduleJob(taskTime, async () => {
    await performMongoDBAction();
  });
};

module.exports = { performCornJob };
