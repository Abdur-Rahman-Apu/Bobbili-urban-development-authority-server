const {
  findDraftAppsByQuery,
  findSubmitAppsByQuery,
  findApprovedAppsByQuery,
  findShortfallAppsByQuery,
  findRejectedAppsByQuery,
  findUserById,
} = require("../../Services/DBQueries/DbQueries");

const handleSearchAppByAppNo = async (req, res) => {
  console.log(req.query.search);

  const { searchValue, page } = JSON.parse(req.query.search);

  const filter = { applicationNo: searchValue };

  console.log(filter, "REGEX Search application");

  const searchResultOfDraftApp = await findDraftAppsByQuery(filter);

  if (!searchResultOfDraftApp.length && page === "applicationSearch") {
    const searchResultOfSubmitApp = await findSubmitAppsByQuery(filter);

    if (!searchResultOfSubmitApp.length) {
      const searchResultOfApproveApp = await findApprovedAppsByQuery(filter);

      if (!searchResultOfApproveApp.length) {
        const searchResultOfShortfallApp = await findShortfallAppsByQuery(
          filter
        );
        console.log(searchResultOfShortfallApp);
        if (!searchResultOfShortfallApp.length) {
          console.log("Asci");

          const searchResultOfRejectedApp = await findRejectedAppsByQuery(
            filter
          );

          if (!searchResultOfRejectedApp.length) {
            return res.send({ result: [] });
          }
          return res.send({ result: searchResultOfRejectedApp });
        }
        return res.send({ result: searchResultOfShortfallApp });
      }
      return res.send({ result: searchResultOfApproveApp });
    }

    return res.send({ result: searchResultOfSubmitApp });
  }
  return res.send({ result: searchResultOfDraftApp });
};

const handleSearchByOwnerName = async (req, res) => {
  const { searchValue, page } = JSON.parse(req.query.search);

  const filter = {
    "applicantInfo.applicantDetails.0.name": {
      $regex: searchValue,
      $options: "i",
    },
  };

  const searchResultOfDraftApp = await findDraftAppsByQuery(filter);

  if (page === "applicationSearch") {
    const searchResultOfSubmitApp = await findSubmitAppsByQuery(filter);

    const searchResultOfApproveApp = await findApprovedAppsByQuery(filter);

    const searchResultOfShortfallApp = await findShortfallAppsByQuery(filter);

    const searchResultOfRejectedApp = await findRejectedAppsByQuery(filter);

    const searchResult = [
      ...searchResultOfDraftApp,
      ...searchResultOfSubmitApp,
      ...searchResultOfApproveApp,
      ...searchResultOfShortfallApp,
      ...searchResultOfRejectedApp,
    ];

    return res.send({ result: searchResult });
  } else {
    return res.send({ result: searchResultOfDraftApp });
  }
};

const handleSearchForPsByAppNo = async (req, res) => {
  const { psId, searchValue } = JSON.parse(req.query.search);

  const psInfo = await findUserById(psId);

  const query = {
    applicationNo: searchValue,
    "buildingInfo.generalInformation.gramaPanchayat": psInfo?.gramaPanchayat,
  };

  console.log(query, "APP no");

  const searchResultOfSubmitApp = await findSubmitAppsByQuery(query);
  console.log(searchResultOfSubmitApp);

  if (!searchResultOfSubmitApp.length) {
    const searchResultOfApproveApp = await findApprovedAppsByQuery(query);

    console.log(searchResultOfApproveApp);

    if (!searchResultOfApproveApp.length) {
      const searchResultOfShortfallApp = await findShortfallAppsByQuery(query);

      if (!searchResultOfShortfallApp.length) {
        const searchResultOfRejectedApp = await findRejectedAppsByQuery(query);
        if (!searchResultOfRejectedApp.length) {
          return res.send({ result: [] });
        }

        return res.send({ result: searchResultOfRejectedApp });
      }

      return res.send({ result: searchResultOfShortfallApp });
    }
    return res.send({ result: searchResultOfApproveApp });
  } else {
    return res.send({ result: searchResultOfSubmitApp });
  }
};

const handleSearchForPsByOwnerName = async (req, res) => {
  const { psId, searchValue } = JSON.parse(req.query.search);

  const psInfo = await findUserById(psId);

  const filter = {
    "applicantInfo.applicantDetails.0.name": {
      $regex: searchValue,
      $options: "i",
    },
    "buildingInfo.generalInformation.gramaPanchayat": psInfo?.gramaPanchayat,
  };

  const searchResultOfSubmitApp = await findSubmitAppsByQuery(filter);

  const searchResultOfApproveApp = await findApprovedAppsByQuery(filter);

  const searchResultOfShortfallApp = await findShortfallAppsByQuery(filter);

  const searchResultOfRejectedApp = await findRejectedAppsByQuery(filter);

  const searchResult = [
    ...searchResultOfSubmitApp,
    ...searchResultOfApproveApp,
    ...searchResultOfShortfallApp,
    ...searchResultOfRejectedApp,
  ];

  return res.send({ result: searchResult });
};

const handleGetPsApplications = async (req, res) => {
  // const gramaPanchayat = JSON.parse(req.query.gramaPanchayat);

  const id = JSON.parse(req.query.id);

  console.log(id, "id in ps");

  const psInfo = await findUserById(id);

  console.log(psInfo, "psInfo");

  const filter = {
    "buildingInfo.generalInformation.gramaPanchayat": psInfo?.gramaPanchayat,
  };

  console.log(filter, "filter in ps");

  const searchResultOfSubmitApp = await findSubmitAppsByQuery(filter);

  const searchResultOfApproveApp = await findApprovedAppsByQuery(filter);

  const searchResultOfShortfallApp = await findShortfallAppsByQuery(filter);

  const searchResult = [
    ...searchResultOfSubmitApp,
    ...searchResultOfApproveApp,
    ...searchResultOfShortfallApp,
  ];

  return res.send({ result: searchResult });
};

module.exports = {
  handleSearchAppByAppNo,
  handleSearchByOwnerName,
  handleSearchForPsByAppNo,
  handleSearchForPsByOwnerName,
  handleGetPsApplications,
};
