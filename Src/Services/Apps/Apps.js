const {
  findDraftAppsByQuery,
  findSubmitAppsByQuery,
  findRejectedAppsByQuery,
  findShortfallAppsByQuery,
  findApprovedAppsByQuery,
  findUserById,
} = require("../DBQueries/DbQueries");

const findApplicationData = async (query, role, id) => {
  let totalSubmitApplications,
    totalApprovedApplications,
    totalShortfallApplications,
    totalRejectedApplications,
    totalDraftApplications;

  if (role === "ltp") {
    totalDraftApplications = await findDraftAppsByQuery(query);
    totalSubmitApplications = await findSubmitAppsByQuery(query);
    totalApprovedApplications = await findApprovedAppsByQuery(query);
    totalShortfallApplications = await findShortfallAppsByQuery(query);
    totalRejectedApplications = await findRejectedAppsByQuery(query);
    if (
      totalDraftApplications &&
      totalSubmitApplications &&
      totalApprovedApplications &&
      totalShortfallApplications &&
      totalRejectedApplications
    ) {
      return [
        totalDraftApplications,
        totalSubmitApplications,
        totalApprovedApplications,
        totalShortfallApplications,
        totalRejectedApplications,
      ];
    }
  } else if (role === "ps") {
    console.log("aschi ps");
    const findPsInfo = await findUserById(id);

    console.log(findPsInfo, "ps info");

    console.log(query);

    totalSubmitApplications = await findSubmitAppsByQuery({
      "buildingInfo.generalInformation.district": findPsInfo.district,
      "buildingInfo.generalInformation.mandal": findPsInfo.mandal,
      "buildingInfo.generalInformation.gramaPanchayat":
        findPsInfo?.gramaPanchayat,
    });

    totalApprovedApplications = await findApprovedAppsByQuery(query);
    totalShortfallApplications = await findShortfallAppsByQuery(query);
    totalRejectedApplications = await findRejectedAppsByQuery(query);

    console.log(
      totalSubmitApplications,
      totalApprovedApplications,
      totalShortfallApplications,
      totalRejectedApplications
    );
    if (
      totalSubmitApplications &&
      totalApprovedApplications &&
      totalShortfallApplications &&
      totalRejectedApplications
    ) {
      return [
        totalSubmitApplications,
        totalApprovedApplications,
        totalShortfallApplications,
        totalRejectedApplications,
      ];
    }
  } else {
    totalSubmitApplications = await findSubmitAppsByQuery(query);
    totalApprovedApplications = await findApprovedAppsByQuery(query);
    totalShortfallApplications = await findShortfallAppsByQuery(query);
    totalRejectedApplications = await findRejectedAppsByQuery(query);
    if (
      totalSubmitApplications &&
      totalApprovedApplications &&
      totalShortfallApplications &&
      totalRejectedApplications
    ) {
      return [
        totalSubmitApplications,
        totalApprovedApplications,
        totalShortfallApplications,
        totalRejectedApplications,
      ];
    }
  }
};

const sumOfAllAppCharges = (submitApp, approvedApp, shortfallApp) => {
  const sumOfAllUdaCharges =
    submitApp?.totalUdaCharge +
    approvedApp?.totalUdaCharge +
    shortfallApp?.totalUdaCharge;

  const sumOfAllPanchayatCharges =
    submitApp?.totalPanchayatCharge +
    approvedApp?.totalPanchayatCharge +
    shortfallApp?.totalPanchayatCharge;

  const sumOfAllGreenFeeCharges =
    submitApp?.totalGreenFee +
    approvedApp?.totalGreenFee +
    shortfallApp?.totalGreenFee;

  const sumOfAllLabourCharges =
    submitApp?.totalLabourCharge +
    approvedApp?.totalLabourCharge +
    shortfallApp?.totalLabourCharge;

  return {
    totalUdaCharge: sumOfAllUdaCharges,
    totalPanchayatCharge: sumOfAllPanchayatCharges,
    totalGreenFee: sumOfAllGreenFeeCharges,
    totalLabourCharge: sumOfAllLabourCharges,
  };
};

const sumOfArrayElements = (arr) => {
  const sum = arr.reduce((accumulator, currentValue) => {
    return accumulator + currentValue;
  }, 0);
  return sum;
};

const extractCharges = (allApplication) => {
  // uda Charge extract
  const extractUdaCharge = allApplication?.map((eachApplication) => {
    // console.log(eachApplication, "Each");
    const udaCharge = eachApplication?.payment?.udaCharge?.UDATotalCharged;

    console.log(udaCharge, "first");

    const udaChargeNumber = Number(udaCharge);

    console.log(udaChargeNumber, "Number");

    const finalUdaCharge = isNaN(udaChargeNumber) ? 0 : udaChargeNumber;

    console.log(finalUdaCharge, "Final");

    return finalUdaCharge;
  });
  const extractPanchayatCharge = allApplication?.map((eachApplication) => {
    // console.log(eachApplication, "Each");
    const panchayatCharge =
      eachApplication?.payment?.gramaPanchayatFee?.GramaPanchayetTotalCharged;

    console.log(panchayatCharge, "first");

    const panchayatChargeNumber = Number(panchayatCharge);

    console.log(panchayatCharge, "Number");

    const finalPanchayatCharge = isNaN(panchayatChargeNumber)
      ? 0
      : panchayatChargeNumber;

    console.log(finalPanchayatCharge, "Final");

    return finalPanchayatCharge;
  });
  const extractGreenFee = allApplication?.map((eachApplication) => {
    // console.log(eachApplication, "Each");
    const greenFee =
      eachApplication?.payment?.greenFeeCharge?.greenFeeChargeAmount;

    console.log(greenFee, "first");

    const greenFeeNumber = Number(greenFee);

    console.log(greenFeeNumber, "Number");

    const finalGreenFee = isNaN(greenFeeNumber) ? 0 : greenFeeNumber;

    console.log(finalGreenFee, "Final");

    return finalGreenFee;
  });
  const extractLabourCharge = allApplication?.map((eachApplication) => {
    // console.log(eachApplication, "Each");
    const labourCharge =
      eachApplication?.payment?.labourCessCharge?.labourCessOne;

    console.log(labourCharge, "first");

    const labourChargeNumber = Number(labourCharge);

    console.log(labourChargeNumber, "Number");

    const finalLabourCharge = isNaN(labourChargeNumber)
      ? 0
      : labourChargeNumber;

    console.log(finalLabourCharge, "Final");

    return finalLabourCharge;
  });

  const totalUdaCharge = sumOfArrayElements(extractUdaCharge);
  const totalPanchayatCharge = sumOfArrayElements(extractPanchayatCharge);
  const totalGreenFee = sumOfArrayElements(extractGreenFee);
  const totalLabourCharge = sumOfArrayElements(extractLabourCharge);

  return {
    totalUdaCharge,
    totalPanchayatCharge,
    totalGreenFee,
    totalLabourCharge,
  };
};

const checkLastWeek = (dateFromDB) => {
  console.log(dateFromDB, "FIRST GET DATE");
  const targetDate = new Date(dateFromDB);

  const currentDate = new Date();

  const timeDifference = currentDate - targetDate;

  const daysDifference = timeDifference / (24 * 3600 * 1000);

  console.log(daysDifference);

  if (daysDifference >= 1 && daysDifference < 8) {
    console.log(targetDate, daysDifference);
    return 1;
  } else {
    return 0;
  }
};

const checkMonths = (dateFromDB, duration) => {
  const targetDate = new Date(dateFromDB);

  const currentDate = new Date();

  const yearDifference = currentDate.getFullYear() - targetDate.getFullYear();

  const monthDifference = currentDate.getMonth() - targetDate.getMonth();

  const exactMonthDifference = yearDifference * 12 + monthDifference;

  console.log(
    exactMonthDifference,
    targetDate,
    dateFromDB,
    "Exact month difference"
  );

  if (exactMonthDifference > 0 && exactMonthDifference < duration + 1) {
    return 1;
  } else {
    return 0;
  }
};

const searchBasedOnDate = (submit, approve, shortfall, date) => {
  console.log("Search based on date");
  const filterFromSubmit = submit.filter((application) => {
    const dateFromDB = application?.submitDate
      ?.split("-")
      ?.reverse()
      ?.join("-");
    if (date === "7 days" && checkLastWeek(dateFromDB)) {
      return application;
    }

    if (date === "1 months" && checkMonths(dateFromDB, 1)) {
      return application;
    }

    if (date === "6 months" && checkMonths(dateFromDB, 6)) {
      return application;
    }

    if (date === "1 year" && checkMonths(dateFromDB, 12)) {
      return application;
    }
  });
  const filterFromApproved = approve.filter((application) => {
    const dateFromDB = application?.psSubmitDate
      ?.split("-")
      ?.reverse()
      ?.join("-");
    if (date === "7 days" && checkLastWeek(dateFromDB)) {
      return application;
    }

    if (date === "6 months" && checkMonths(dateFromDB, 6)) {
      return application;
    }

    if (date === "1 months" && checkMonths(dateFromDB, 1)) {
      return application;
    }

    if (date === "1 year" && checkMonths(dateFromDB, 12)) {
      return application;
    }
  });
  const filterFromShortfall = shortfall.filter((application) => {
    const dateFromDB = application?.psSubmitDate
      ?.split("-")
      ?.reverse()
      ?.join("-");
    if (date === "7 days" && checkLastWeek(dateFromDB)) {
      return application;
    }

    if (date === "6 months" && checkMonths(dateFromDB, 6)) {
      return application;
    }
    if (date === "1 months" && checkMonths(dateFromDB, 1)) {
      return application;
    }

    if (date === "1 year" && checkMonths(dateFromDB, 12)) {
      return application;
    }
  });

  const submitAppCharges = extractCharges(filterFromSubmit);
  const approvedAppCharges = extractCharges(filterFromApproved);
  const shortfallAppCharges = extractCharges(filterFromShortfall);

  const charges = sumOfAllAppCharges(
    submitAppCharges,
    approvedAppCharges,
    shortfallAppCharges
  );

  const result = {
    totalApplication: {
      submitted: filterFromSubmit.length,
      approved: filterFromApproved.length,
      shortfall: filterFromShortfall.length,
    },
    applications: {
      approvedApplications: filterFromApproved,
      shortfallApplications: filterFromShortfall,
      submittedApplications: filterFromSubmit,
    },
    charges,
  };

  return result;
};

const searchBasedOnPanchayat = (
  flag,
  submit,
  approve,
  shortfall,
  panchayat,
  date
) => {
  // console.log("SEARCH ON Panchayat");
  const filterFromSubmit = submit.filter(
    (application) =>
      application?.buildingInfo?.generalInformation?.gramaPanchayat ===
      panchayat
  );
  const filterFromApproved = approve.filter(
    (application) =>
      application?.buildingInfo?.generalInformation?.gramaPanchayat ===
      panchayat
  );
  const filterFromShortfall = shortfall.filter(
    (application) =>
      application?.buildingInfo?.generalInformation?.gramaPanchayat ===
      panchayat
  );

  if (flag === 4) {
    const result = searchBasedOnDate(
      filterFromSubmit,
      filterFromApproved,
      filterFromShortfall,
      date
    );

    return result;
  } else {
    const submitAppCharges = extractCharges(filterFromSubmit);
    const approvedAppCharges = extractCharges(filterFromApproved);
    const shortfallAppCharges = extractCharges(filterFromShortfall);

    const charges = sumOfAllAppCharges(
      submitAppCharges,
      approvedAppCharges,
      shortfallAppCharges
    );

    const result = {
      totalApplication: {
        submitted: filterFromSubmit.length,
        approved: filterFromApproved.length,
        shortfall: filterFromShortfall.length,
      },
      applications: {
        approvedApplications: filterFromApproved,
        shortfallApplications: filterFromShortfall,
        submittedApplications: filterFromSubmit,
      },
      charges,
    };
    console.log(result, "PANCHAYAT");
    return result;
  }
};

const searchBasedOnMandal = (
  flag,
  submit,
  approve,
  shortfall,
  mandal,
  panchayat,
  date
) => {
  // console.log("SEARCH ON MANDAL");
  const filterFromSubmit = submit.filter(
    (application) =>
      application?.buildingInfo?.generalInformation?.mandal === mandal
  );
  const filterFromApproved = approve.filter(
    (application) =>
      application?.buildingInfo?.generalInformation?.mandal === mandal
  );
  const filterFromShortfall = shortfall.filter(
    (application) =>
      application?.buildingInfo?.generalInformation?.mandal === mandal
  );

  if (flag !== 2) {
    const result = searchBasedOnPanchayat(
      flag,
      filterFromSubmit,
      filterFromApproved,
      filterFromShortfall,
      panchayat,
      date
    );

    return result;
  } else {
    const submitAppCharges = extractCharges(filterFromSubmit);
    const approvedAppCharges = extractCharges(filterFromApproved);
    const shortfallAppCharges = extractCharges(filterFromShortfall);

    const charges = sumOfAllAppCharges(
      submitAppCharges,
      approvedAppCharges,
      shortfallAppCharges
    );

    const result = {
      totalApplication: {
        submitted: filterFromSubmit.length,
        approved: filterFromApproved.length,
        shortfall: filterFromShortfall.length,
      },
      applications: {
        approvedApplications: filterFromApproved,
        shortfallApplications: filterFromShortfall,
        submittedApplications: filterFromSubmit,
      },
      charges,
    };
    console.log(result, "Mandal");
    return result;
  }
};

const searchBasedOnDistrict = (
  flag,
  totalSubmitApplications,
  totalApprovedApplications,
  totalShortfallApplications,
  district,
  mandal,
  panchayat,
  date
) => {
  const districtFromSubmitApplication = totalSubmitApplications?.filter(
    (application) =>
      application.buildingInfo?.generalInformation?.district === district
  );

  // console.log(districtFromSubmitApplication, "FROM");

  const districtFromApprovedApplication = totalApprovedApplications?.filter(
    (application) =>
      application.buildingInfo?.generalInformation?.district === district
  );

  const districtFromShortfallApplication = totalShortfallApplications?.filter(
    (application) =>
      application.buildingInfo?.generalInformation?.district === district
  );

  if (flag === 1) {
    const submitAppCharges = extractCharges(districtFromSubmitApplication);
    const approvedAppCharges = extractCharges(districtFromApprovedApplication);
    const shortfallAppCharges = extractCharges(
      districtFromShortfallApplication
    );

    const charges = sumOfAllAppCharges(
      submitAppCharges,
      approvedAppCharges,
      shortfallAppCharges
    );

    const result = {
      applications: {
        approvedApplications: districtFromApprovedApplication,
        shortfallApplications: districtFromShortfallApplication,
        submittedApplications: districtFromSubmitApplication,
      },
      totalApplication: {
        submitted: districtFromSubmitApplication.length,
        approved: districtFromApprovedApplication.length,
        shortfall: districtFromShortfallApplication.length,
      },
      charges,
    };
    console.log(result, "district");

    return result;
    // return result;
  } else {
    const result = searchBasedOnMandal(
      flag,
      districtFromSubmitApplication,
      districtFromApprovedApplication,
      districtFromShortfallApplication,
      mandal,
      panchayat,
      date
    );

    return result;
  }
};

const getChartData = async (flag, district, mandal, panchayat, date) => {
  const totalSubmitApplications = await findSubmitAppsByQuery({});
  const totalApprovedApplications = await findApprovedAppsByQuery({});
  const totalShortfallApplications = await findShortfallAppsByQuery({});

  let result;

  switch (flag) {
    case 1:
      result = searchBasedOnDistrict(
        flag,
        totalSubmitApplications,
        totalApprovedApplications,
        totalShortfallApplications,
        district
      );
      break;

    case 2:
      result = searchBasedOnDistrict(
        flag,
        totalSubmitApplications,
        totalApprovedApplications,
        totalShortfallApplications,
        district,
        mandal
      );
      break;

    case 3:
      result = searchBasedOnDistrict(
        flag,
        totalSubmitApplications,
        totalApprovedApplications,
        totalShortfallApplications,
        district,
        mandal,
        panchayat
      );
      break;

    case 4:
      result = searchBasedOnDistrict(
        flag,
        totalSubmitApplications,
        totalApprovedApplications,
        totalShortfallApplications,
        district,
        mandal,
        panchayat,
        date
      );
      break;
  }

  console.log(result, "BREAK");

  return result;
};

module.exports = { findApplicationData, getChartData };
