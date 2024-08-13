const { ObjectId } = require("mongodb");
const {
  allDistricts,
  updateDistricts,
} = require("../../Services/DBQueries/DbQueries");
const {
  findIndexOfExistDistrict,
  addNewDistrict,
  addNewVillage,
  getMandalsWithMandalIndex,
  getVillagesWithVillageIndex,
  addNewMandal,
} = require("../../Services/Districts/Districts");

const getAllDistricts = async (req, res) => {
  const result = await allDistricts();
  return res.send(result);
};

const addLocation = async (req, res) => {
  console.log(req.query.data, "add LOCATION");
  const data = JSON.parse(req.query.data);

  const resultOfOldValue = await allDistricts();

  const oldLocations = resultOfOldValue[0]?.district;
  console.log(oldLocations, "OLD");

  let newLocations;

  const districtName = data?.district;
  const mandalName = data?.mandal;
  const villageName = data?.village;

  const findDistrictIndex = findIndexOfExistDistrict(
    oldLocations,
    districtName
  );

  console.log(findDistrictIndex, "Is find district");

  if (districtName?.length && mandalName?.length && villageName?.length) {
    if (findDistrictIndex === -1) {
      // district is not exist into the db
      // oldLocations.push({
      //   name: districtName,
      //   mandal: [{ name: mandalName, village: [villageName] }],
      // });
      addNewDistrict(oldLocations, districtName, mandalName, villageName);
    } else {
      // district is exist into the db

      // // mandalArr= all mandals of searching district
      // const mandalArr = oldLocations[findDistrictIndex]?.mandal;

      // // chcking the requested mandal is exist or not into the db
      // const findIndexOfExistMandal = mandalArr?.findIndex(
      //   (eachMandal) => eachMandal?.name === mandalName
      // );

      const { mandalArr, findIndexOfExistMandal } = getMandalsWithMandalIndex(
        oldLocations,
        findDistrictIndex,
        mandalName
      );

      if (findIndexOfExistMandal === -1) {
        // mandal is not present into the db
        // mandalArr.push({ name: mandalName, village: [villageName] });
        // oldLocations[findDistrictIndex]["mandal"] = mandalArr;
        addNewMandal(
          oldLocations,
          findDistrictIndex,
          mandalArr,
          mandalName,
          villageName
        );
      } else {
        // mandal is exist into the db
        // const villageArr = mandalArr[findIndexOfExistMandal]?.village;

        // const findIndexOfVillage = villageArr.includes(villageName);

        const { villageArr, findIndexOfVillage } = getVillagesWithVillageIndex(
          mandalArr,
          findIndexOfExistMandal,
          villageName
        );

        if (findIndexOfVillage) {
          // village is exist into the db
          return res.json({ msg: "Village is already exist" });
        } else {
          // village is not exist into the db
          // villageArr.push(villageName);
          // mandalArr[findIndexOfExistMandal]["village"] = [...villageArr];
          // oldLocations[findDistrictIndex]["mandal"] = [...mandalArr];
          addNewVillage(
            villageArr,
            villageName,
            mandalArr,
            findIndexOfExistMandal,
            oldLocations,
            findDistrictIndex
          );
        }
      }
    }
  } else if (districtName?.length && mandalName?.length) {
    if (findDistrictIndex === -1) {
      // district is not exist into the db
      addNewDistrict(oldLocations, districtName, mandalName);
    } else {
      // district is exist into the db
      // mandalArr= all mandals of searching district
      // const mandalArr = oldLocations[findDistrictIndex]?.mandal;

      // // chcking the requested mandal is exist or not into the db
      // const findIndexOfExistMandal = mandalArr?.findIndex(
      //   (eachMandal) => eachMandal?.name === mandalName
      // );

      const { mandalArr, findIndexOfExistMandal } = getMandalsWithMandalIndex(
        oldLocations,
        findDistrictIndex,
        mandalName
      );

      if (findIndexOfExistMandal === -1) {
        // mandal is not present into the db
        // mandalArr.push({ name: mandalName, village: [villageName] });
        // oldLocations[findDistrictIndex]["mandal"] = mandalArr;
        addNewMandal(oldLocations, findDistrictIndex, mandalArr, mandalName);
      } else {
        return res.json({ msg: "Mandal is already exist" });
      }
    }
  } else {
    // handling only district addition into the db
    if (findDistrictIndex === -1) {
      addNewDistrict(oldLocations, districtName);
      // oldLocations.push({ name: districtName, mandal: [] });
    } else {
      return res.json({ msg: "District is already exist" });
    }
  }

  newLocations = [...oldLocations];

  const updateDoc = {
    $set: { district: newLocations },
  };

  const filter = { _id: new ObjectId(resultOfOldValue[0]?._id) };

  const result = await updateDistricts(filter, updateDoc);
  console.log(result, "RESULT LOC");

  if (result.acknowledged) {
    return res.send({ msg: "Location added successfully", response: result });
  } else {
    return res.send({ msg: "Failed to add location", response: result });
  }
};

const removeLocation = async (req, res) => {
  console.log(req.query.data, "remove LOCATION");
  const data = JSON.parse(req.query.data);

  const resultOfOldValue = await allDistricts();

  const oldLocations = resultOfOldValue[0]?.district;
  console.log(oldLocations, "OLD");

  let newLocation;

  const districtName = data?.district;
  const mandalName = data?.mandal;
  const villageName = data?.village;

  const findDistrictIndex = findIndexOfExistDistrict(
    oldLocations,
    districtName
  );

  if (districtName?.length && mandalName?.length && villageName?.length) {
    if (findDistrictIndex === -1) {
      // district is not found into the db
      return res.send({ msg: "Location not found" });
    } else {
      // district is exist into the db
      const { mandalArr, findIndexOfExistMandal } = getMandalsWithMandalIndex(
        oldLocations,
        findDistrictIndex,
        mandalName
      );

      if (findIndexOfExistMandal === -1) {
        // mandal is not exist into the db
        return res.send({ msg: "Mandal is not found" });
      } else {
        // mandal is exist into the db
        // const { villageArr, findIndexOfVillage } = getVillagesWithVillageIndex(
        //   mandalArr,
        //   findIndexOfExistMandal,
        //   villageName
        // );
        const indexOfVillage = mandalArr[
          findIndexOfExistMandal
        ]?.village.findIndex((eachVillage) => eachVillage === villageName);

        if (indexOfVillage !== -1) {
          // village exist into the db
          mandalArr[findIndexOfExistMandal]?.village.splice(indexOfVillage, 1);
          console.log(mandalArr[findIndexOfExistMandal]?.village);
          oldLocations[findDistrictIndex]["mandal"] = [...mandalArr];
        } else {
          // village is not exist into the db
          return res.send({ msg: "Village is not found" });
        }
      }
    }
  } else if (districtName?.length && mandalName?.length) {
    if (findDistrictIndex === -1) {
      // district is not found into the db
      return res.send({ msg: "Location not found" });
    } else {
      // district is exist into the db
      const { mandalArr, findIndexOfExistMandal } = getMandalsWithMandalIndex(
        oldLocations,
        findDistrictIndex,
        mandalName
      );

      if (findIndexOfExistMandal === -1) {
        // mandal is not exist into the db
        return res.send({ msg: "Mandal is not found" });
      } else {
        // mandal is exist into the db
        mandalArr.splice(findIndexOfExistMandal, 1);

        oldLocations[findDistrictIndex]["mandal"] = [...mandalArr];
      }
    }
  } else {
    // only for district value
    if (findDistrictIndex === -1) {
      return res.send({ msg: "Location not found" });
    } else {
      oldLocations.splice(findDistrictIndex, 1);
    }
  }

  newLocation = [...oldLocations];

  const updateDoc = {
    $set: { district: newLocation },
  };

  const filter = { _id: new ObjectId(resultOfOldValue[0]?._id) };

  const result = await updateDistricts(filter, updateDoc);
  console.log(result, "RESULT LOC");

  if (result.acknowledged) {
    return res.send({ msg: "Location removed successfully", response: result });
  } else {
    return res.send({ msg: "Failed to remove location", response: result });
  }
};

module.exports = { getAllDistricts, addLocation, removeLocation };
