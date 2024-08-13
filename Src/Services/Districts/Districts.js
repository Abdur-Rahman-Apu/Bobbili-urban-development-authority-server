const findIndexOfExistDistrict = (oldLocations, districtName) => {
  return oldLocations?.findIndex(
    (eachLocation) => eachLocation.name === districtName
  );
};

const addNewDistrict = (
  oldLocations,
  districtName,
  mandalName,
  villageName
) => {
  const data = {
    name: districtName,
    mandal: mandalName
      ? [{ name: mandalName, village: villageName ? [villageName] : [] }]
      : [],
  };
  oldLocations.push(data);
};

const addNewMandal = (
  oldLocations,
  findDistrictIndex,
  mandalArr,
  mandalName,
  villageName
) => {
  mandalArr.push({
    name: mandalName,
    village: villageName ? [villageName] : [],
  });
  oldLocations[findDistrictIndex]["mandal"] = mandalArr;
};

const addNewVillage = (
  villageArr,
  villageName,
  mandalArr,
  findIndexOfExistMandal,
  oldLocations,
  findDistrictIndex
) => {
  villageArr.push(villageName);
  mandalArr[findIndexOfExistMandal]["village"] = [...villageArr];
  oldLocations[findDistrictIndex]["mandal"] = [...mandalArr];
};

const getMandalsWithMandalIndex = (
  oldLocations,
  findDistrictIndex,
  mandalName
) => {
  // mandalArr= all mandals of searching district
  const mandalArr = oldLocations[findDistrictIndex]?.mandal;

  // chcking the requested mandal is exist or not into the db
  const findIndexOfExistMandal = mandalArr?.findIndex(
    (eachMandal) => eachMandal?.name === mandalName
  );

  return { mandalArr, findIndexOfExistMandal };
};

const getVillagesWithVillageIndex = (
  mandalArr,
  findIndexOfExistMandal,
  villageName
) => {
  const villageArr = mandalArr[findIndexOfExistMandal]?.village;

  const findIndexOfVillage = villageArr.includes(villageName);
  return { villageArr, findIndexOfVillage };
};

module.exports = {
  findIndexOfExistDistrict,
  addNewDistrict,
  addNewMandal,
  addNewVillage,
  getMandalsWithMandalIndex,
  getVillagesWithVillageIndex,
};
