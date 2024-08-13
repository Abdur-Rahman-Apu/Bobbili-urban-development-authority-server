const {
  findApplicationData,
  getChartData,
} = require("../../Services/Apps/Apps");
const {
  findDraftAppsByQuery,
  findSubmitAppsByQuery,
  findApprovedAppsByQuery,
  findShortfallAppsByQuery,
  findDraftAppByQuery,
  findApprovedAppUsingAppNo,
  findShortfallAppUsingAppNo,
  findRejectedAppUsingAppNo,
  findSubmitAppByAppNo,
  findUserByQuery,
  findRejectedAppsByQuery,
} = require("../../Services/DBQueries/DbQueries");
const { DateTime } = require("luxon");

const handleGetAllApps = async (req, res) => {
  const draftApplications = await findDraftAppsByQuery({});
  const submitApplications = await findSubmitAppsByQuery({});
  const approvedApplications = await findApprovedAppsByQuery({});
  const shortfallApplications = await findShortfallAppsByQuery({});

  const result = [
    ...draftApplications,
    ...submitApplications,
    ...approvedApplications,
    ...shortfallApplications,
  ];
  return res.send(result);
};

const handleGetAppsByQuery = async (req, res) => {
  const { appNo, userId, role, page } = JSON.parse(req.query.data);
  console.log(req.query.data);

  console.log(appNo, userId);

  let result;

  const query = {
    applicationNo: appNo,
  };

  if (page === "submit" || page === "home") {
    result = await findSubmitAppByAppNo(appNo);
  }
  if ((role === "LTP" && page === "draft") || page === "home") {
    result = await findDraftAppByQuery(query);
  }

  if (page === "approved" || page === "home") {
    result = await findApprovedAppUsingAppNo(appNo);
  }
  if (page === "shortfall" || page === "home") {
    result = await findShortfallAppUsingAppNo(appNo);
  }

  if (page.toLowerCase() === "outward") {
    result =
      (await findShortfallAppUsingAppNo(appNo)) ||
      (await findApprovedAppUsingAppNo(appNo)) ||
      (await findRejectedAppUsingAppNo(appNo));
  }

  if (page === "searchApplicationByPs") {
    result =
      (await findSubmitAppByAppNo(appNo)) ||
      (await findShortfallAppUsingAppNo(appNo)) ||
      (await findApprovedAppUsingAppNo(appNo)) ||
      (await findRejectedAppUsingAppNo(appNo));
  }

  console.log(result);
  return res.send(result);
};

const handleGetAmountWithApps = async (req, res) => {
  let role;
  let userInfo;

  if (req?.query?.data) {
    userInfo = JSON.parse(req?.query?.data);
    role = userInfo?.role?.toLowerCase();
  }

  let query = {};
  // let queryForPSExceptSubmitApplication = { psId: userInfo._id };

  console.log(role, "role");
  console.log(query, "USER INFO");

  if (role === "ltp" || role === "ps") {
    console.log("INSIDE LTP OR PS");

    if (role === "ltp") {
      const id = userInfo._id;
      query = { userId: id };
      const [
        totalDraftApplications,
        totalSubmitApplications,
        totalApprovedApplications,
        totalShortfallApplications,
        totalRejectedApplications,
      ] = await findApplicationData(query, role, id);
      result = {
        applications: {
          createdApplications: totalDraftApplications,
          submitApplication: totalSubmitApplications,
          approvedApplications: totalApprovedApplications,
          shortfallApplications: totalShortfallApplications,
          totalRejectedApplications: totalRejectedApplications,
        },
        totalApplication: {
          created: totalDraftApplications.length,
          submitted: totalSubmitApplications.length,
          rejected: totalRejectedApplications.length,
          approved: totalApprovedApplications.length,
          shortfall: totalShortfallApplications.length,
        },
      };
    } else {
      const id = userInfo._id;
      query = { psId: id };

      const [
        totalSubmitApplications,
        totalApprovedApplications,
        totalShortfallApplications,
        totalRejectedApplications,
      ] = await findApplicationData(query, role, id);

      result = {
        applications: {
          receivedApplications: totalSubmitApplications,
          approvedApplications: totalApprovedApplications,
          shortfallApplications: totalShortfallApplications,
          totalRejectedApplications: totalRejectedApplications,
        },
        totalApplication: {
          received: totalSubmitApplications.length,
          rejected: totalRejectedApplications.length,
          approved: totalApprovedApplications.length,
          shortfall: totalShortfallApplications.length,
        },
        // charges,
      };
    }

    return res.send(result);
  } else {
    const [
      totalSubmitApplications,
      totalApprovedApplications,
      totalShortfallApplications,
      // totalRejectedApplications,
    ] = await findApplicationData(query);
    const total =
      totalSubmitApplications.length +
      totalApprovedApplications.length +
      totalShortfallApplications.length;

    const result = {
      applications: {
        approvedApplications: totalApprovedApplications,
        shortfallApplications: totalShortfallApplications,
        submittedApplications: totalSubmitApplications,
      },
      totalApplication: {
        received: totalSubmitApplications.length,
        approved: totalApprovedApplications.length,
        shortfall: totalShortfallApplications.length,

        total,
      },
    };

    return res.send(result);
  }
};

const handleGetChartData = async (req, res) => {
  const search = JSON.parse(req.query.search);
  console.log(search, "Search");

  if (search?.role === "ltp" || search?.role === "ps") {
    console.log("LTP OR PS");
    const id = search.id;
    let query = {};
    const searchDate = search.selectedDate;
    console.log(searchDate, "Search date");

    const today = DateTime.local();

    let allDates = [];
    let arrayOfApplications;
    let applicationWiseDates = {};

    if (search?.role === "ltp") {
      query = { userId: id };
      arrayOfApplications = await findApplicationData(query, search?.role, id);

      const [
        totalDraftApplications,
        totalSubmitApplications,
        totalApprovedApplications,
        totalShortfallApplications,
        totalRejectedApplications,
      ] = arrayOfApplications;

      applicationWiseDates["New"] = totalDraftApplications.map((eachApp) => {
        return eachApp.createdDate;
      });
      applicationWiseDates["Submitted"] = totalSubmitApplications.map(
        (eachApp) => {
          return eachApp.createdDate;
        }
      );
      applicationWiseDates["Approved"] = totalApprovedApplications.map(
        (eachApp) => {
          return eachApp.createdDate;
        }
      );
      applicationWiseDates["Shortfall"] = totalShortfallApplications.map(
        (eachApp) => {
          return eachApp.createdDate;
        }
      );
      applicationWiseDates["Rejected"] = totalRejectedApplications.map(
        (eachApp) => {
          return eachApp.createdDate;
        }
      );

      // console.log(applicationWiseDates, "Application wise dates");

      arrayOfApplications.forEach((appCollection) => {
        appCollection.forEach((eachApp) => {
          allDates.push(eachApp.createdDate);
        });
      });
    } else {
      query = { psId: id };
      arrayOfApplications = await findApplicationData(query, search?.role, id);

      const [
        totalSubmitApplications,
        totalApprovedApplications,
        totalShortfallApplications,
        totalRejectedApplications,
      ] = arrayOfApplications;

      applicationWiseDates["Submitted"] = totalSubmitApplications.map(
        (eachApp) => {
          return eachApp.submitDate;
        }
      );
      applicationWiseDates["Approved"] = totalApprovedApplications.map(
        (eachApp) => {
          return eachApp.submitDate;
        }
      );

      applicationWiseDates["Shortfall"] = totalShortfallApplications.map(
        (eachApp) => {
          return eachApp.submitDate;
        }
      );
      applicationWiseDates["Rejected"] = totalRejectedApplications.map(
        (eachApp) => {
          return eachApp.submitDate;
        }
      );

      arrayOfApplications.forEach((appCollection) => {
        appCollection.forEach((eachApp) => {
          allDates.push(eachApp.submitDate);
        });
      });
    }

    console.log(allDates, "All dates");

    // console.log(arrayOfApplications, "ARRAY OF APPLICATIONS");
    // console.log(allDates, "All Dates");

    const appType = Object.keys(applicationWiseDates);
    const appTypeDate = Object.values(applicationWiseDates);

    // search day wise data for ltp and ps
    if (searchDate === "1 week") {
      const last7Days = Array.from({ length: 7 }, (_, index) =>
        today.minus({ days: index }).toFormat("dd-MM-yyyy")
      );

      const result = {};
      const applicationWiseCount = {};

      // console.log(applicationWiseDates, "APP WISE DATES");

      console.log(last7Days, "LAST 7 DAYS");

      last7Days.forEach((date) => {
        const date1 = DateTime.fromFormat(date, "dd-MM-yyyy");
        let count = 0;

        console.log(appType, appTypeDate, "APP TYPE");
        appTypeDate.forEach((dates, index) => {
          let countApp = 0;
          console.log(dates, "Dates");
          dates?.forEach((eachDate) => {
            const date2 = DateTime.fromFormat(eachDate, "dd-MM-yyyy");
            // console.log(date1, date2, "DEDATE");
            console.log(date1, date2, "COUNT APP");
            if (date1.equals(date2)) {
              countApp++;
            }
          });
          if (applicationWiseCount[appType[index]]) {
            applicationWiseCount[appType[index]] =
              applicationWiseCount[appType[index]] + countApp;
          } else {
            applicationWiseCount[appType[index]] = countApp;
          }
        });

        allDates.forEach((each) => {
          const date2 = DateTime.fromFormat(each, "dd-MM-yyyy");
          if (date1.equals(date2)) {
            count++;
          }
        });

        result[date] = count;
      });

      console.log(last7Days, result, applicationWiseCount, "last 7 days");
      return res.send({ result, applicationWiseCount });
    } else if (searchDate === "1 month") {
      const last4Weeks = Array.from({ length: 4 }, (_, index) =>
        today.minus({ weeks: index })
      );

      const last4WeeksDates = last4Weeks
        .reverse()
        .reduce((result, weekStart, index) => {
          const weekDates = Array.from({ length: 7 }, (_, index) =>
            weekStart.minus({ days: index }).toFormat("dd-MM-yyyy")
          );
          const weekResult = {};

          weekResult[`${index + 1} week`] = weekDates;

          // const result = {};

          return result.concat(weekResult);
        }, []);

      const result = {};
      const applicationWiseCount = {};

      last4WeeksDates.forEach((eachWeek) => {
        const weekDates = Object.values(eachWeek)[0];
        const weekName = Object.keys(eachWeek)[0];
        let count = 0;

        console.log(weekDates, "WEEK DATES");
        weekDates.forEach((date) => {
          const date1 = DateTime.fromFormat(date, "dd-MM-yyyy");
          console.log(date, "date");
          console.log(appTypeDate, "APP TYPE DATE");

          appTypeDate.forEach((dates, index) => {
            let countApp = 0;
            // console.log(dates, "Dates");
            dates?.forEach((eachDate) => {
              console.log(date, eachDate, "DDDD");
              const date2 = DateTime.fromFormat(eachDate, "dd-MM-yyyy");
              // console.log(date1, date2, "DEDATE");
              // console.log(date1, date2, "COUNT APP");
              if (date1.equals(date2)) {
                // console.log("object");
                countApp = countApp + 1;
              }
            });
            console.log(countApp, "CA");
            if (applicationWiseCount[appType[index]]) {
              applicationWiseCount[appType[index]] =
                applicationWiseCount[appType[index]] + countApp;
            } else {
              applicationWiseCount[appType[index]] = countApp;
            }
            // console.log(countApp, "Count app");
          });

          // console.log(applicationWiseCount, "AWC");

          allDates.forEach((eachDate) => {
            const date2 = DateTime.fromFormat(eachDate, "dd-MM-yyyy");
            // console.log(date, eachDate);
            if (date1.equals(date2)) {
              count++;
            }
          });
        });

        result[weekName] = count;
      });

      console.log(
        last4Weeks,
        last4WeeksDates,
        result,
        applicationWiseCount,
        "LMD"
      );
      return res.send({ result, applicationWiseCount });
    } else if (searchDate === "6 months") {
      const startOfThisMonth = today.startOf("month");
      const startOfPreviousSixMonths = Array.from({ length: 6 }, (_, index) =>
        today.minus({ months: index + 1 }).startOf("month")
      );

      const previousSixMonthsDates = startOfPreviousSixMonths
        .reverse()
        .reduce((result, monthStart) => {
          // Exclude the current month
          if (!monthStart.equals(startOfThisMonth)) {
            const monthDates = Array.from(
              { length: monthStart.daysInMonth },
              (_, index) =>
                monthStart.set({ day: index + 1 }).toFormat("dd-MM-yyyy")
            );

            console.log(monthDates[0]);

            const date = DateTime.fromFormat(monthDates[0], "dd-MM-yyyy");
            const monthName = date.toLocaleString({ month: "long" });

            const monthWiseDate = {};

            monthWiseDate[monthName] = monthDates;

            return result.concat(monthWiseDate);
          }
          return result;
        }, []);

      let result = {};
      const applicationWiseCount = {};

      previousSixMonthsDates.forEach((eachMonth) => {
        const monthDates = Object.values(eachMonth)[0];
        const monthName = Object.keys(eachMonth)[0];

        let count = 0;
        monthDates.forEach((eachDate) => {
          const date1 = DateTime.fromFormat(eachDate, "dd-MM-yyyy");

          appTypeDate.forEach((dates, index) => {
            let countApp = 0;
            // console.log(dates, "Dates");
            dates?.forEach((eachDate) => {
              const date2 = DateTime.fromFormat(eachDate, "dd-MM-yyyy");
              // console.log(date1, date2, "DEDATE");
              // console.log(date1, date2, "COUNT APP");
              if (date1.equals(date2)) {
                // console.log("object");
                countApp = countApp + 1;
              }
            });
            console.log(countApp, "CA");
            if (applicationWiseCount[appType[index]]) {
              applicationWiseCount[appType[index]] =
                applicationWiseCount[appType[index]] + countApp;
            } else {
              applicationWiseCount[appType[index]] = countApp;
            }
            // console.log(countApp, "Count app");
          });
          allDates.forEach((date) => {
            const date2 = DateTime.fromFormat(date, "dd-MM-yyyy");
            if (date1.equals(date2)) {
              count++;
            }
          });
        });

        result[monthName] = count;
      });

      console.log(previousSixMonthsDates, result, applicationWiseCount, "RES");
      return res.send({ result, applicationWiseCount });
    } else if (searchDate === "1 year") {
      // const endDate = DateTime.fromFormat(today, "yyyy-MM-dd");
      const startDate = today.minus({ years: 1 });

      const datesForLastYearByMonth = [];

      let currentDate = startDate;
      while (currentDate <= today) {
        const monthName = currentDate.toFormat("MMMM");
        const year = currentDate.toFormat("yyyy");
        const formattedDate = currentDate.toFormat("dd-MM-yyyy");

        // Check if the month exists in the array
        const existingMonth = datesForLastYearByMonth.find(
          (entry) => entry.month === monthName
        );

        if (existingMonth) {
          // If the month exists, add the date to its array
          existingMonth.dates.push(formattedDate);
        } else {
          // If the month doesn't exist, create a new entry
          datesForLastYearByMonth.push({
            month: monthName,
            year,
            dates: [formattedDate],
          });
        }

        currentDate = currentDate.plus({ days: 1 });
      }

      let result = {};
      const applicationWiseCount = {};

      datesForLastYearByMonth.forEach((eachMonth) => {
        const month = eachMonth.month + ", " + eachMonth.year;
        const monthDates = eachMonth.dates;

        console.log(monthDates, "MonthDates");
        let count = 0;
        monthDates.forEach((eachDate) => {
          const date1 = DateTime.fromFormat(eachDate, "dd-MM-yyyy");

          appTypeDate.forEach((dates, index) => {
            let countApp = 0;
            // console.log(dates, "Dates");
            dates?.forEach((eachDate) => {
              const date2 = DateTime.fromFormat(eachDate, "dd-MM-yyyy");
              // console.log(date1, date2, "DEDATE");
              // console.log(date1, date2, "COUNT APP");
              if (date1.equals(date2)) {
                // console.log("object");
                countApp = countApp + 1;
              }
            });
            console.log(countApp, "CA");
            if (applicationWiseCount[appType[index]]) {
              applicationWiseCount[appType[index]] =
                applicationWiseCount[appType[index]] + countApp;
            } else {
              applicationWiseCount[appType[index]] = countApp;
            }
            // console.log(countApp, "Count app");
          });

          allDates.forEach((date) => {
            const date2 = DateTime.fromFormat(date, "dd-MM-yyyy");
            if (date1.equals(date2)) {
              count++;
            }
          });
        });

        result[month] = count;
      });
      console.log(result, applicationWiseCount, "RESULT");
      return res.send({ result, applicationWiseCount });
    }
  } else {
    const district = search.district;
    const mandal = search.mandal;
    const panchayat = search.panchayat;
    const date = search.date;

    let flag;

    flag = district.length ? 1 : flag;
    flag = mandal.length ? 2 : flag;
    flag = panchayat.length ? 3 : flag;
    flag = date.length ? 4 : flag;
    console.log(district, mandal, panchayat, date, flag);

    const result = await getChartData(flag, district, mandal, panchayat, date);

    console.log(result, "ALL RESULT");

    return res.send(result);
  }
};

const handleGetSerialNo = async (req, res) => {
  // get all collections applications
  const draftApplications = await findDraftAppsByQuery({});
  const submittedApplications = await findSubmitAppsByQuery({});
  const approvedApplications = await findApprovedAppsByQuery({});
  const shortfallApplications = await findShortfallAppsByQuery({});

  const allApplications = [
    ...draftApplications,
    ...submittedApplications,
    ...approvedApplications,
    ...shortfallApplications,
  ];

  if (allApplications?.length) {
    let applicationNumbers = allApplications.map((application) => {
      return Number(application?.applicationNo.split("/")[1]);
    });

    applicationNumbers = applicationNumbers.sort(function (a, b) {
      return a - b;
    });

    console.log(applicationNumbers, "Application numbers");

    const lastSerialNumber = Math.max(...applicationNumbers);

    console.log(lastSerialNumber, "SERIAL");
    return res.send({ serialNo: lastSerialNumber + 1 });
  } else {
    return res.send({ serialNo: 1 });
  }
};

const handleGetVerificationStatus = async (req, res) => {
  const allPS = await findUserByQuery({ role: "PS" });

  const allPsInfo = allPS.map((item) => {
    return {
      id: item?._id.toString(),
      district: item?.district,
      mandal: item?.mandal,
      gramaPanchayat: item?.gramaPanchayat,
      village: item?.village,
      name: item?.name,
      contact: item?.phone,
    };
  });

  const verificationStatus = allPsInfo.map(async (eachPs) => {
    const queryForAppCame = {
      "buildingInfo.generalInformation.district": eachPs?.district,
      "buildingInfo.generalInformation.mandal": eachPs?.mandal,
      "buildingInfo.generalInformation.gramaPanchayat": eachPs?.gramaPanchayat,
    };

    console.log(
      queryForAppCame,
      { psId: eachPs?.id.toString() },
      "Verification status"
    );

    const applicationNotVerified = await findSubmitAppsByQuery(queryForAppCame);

    const approved = await findApprovedAppsByQuery({
      psId: eachPs?.id,
    });
    const shortfall = await findShortfallAppsByQuery({
      psId: eachPs?.id,
    });
    const rejected = await findRejectedAppsByQuery({
      psId: eachPs?.id,
    });

    console.log("Approved length", approved?.length);
    console.log("Shortfall length", shortfall?.length);
    console.log("rejected length", rejected?.length);
    console.log(
      "applicationNotVerified length",
      applicationNotVerified?.length
    );
    console.log("PS NAME", eachPs?.name);

    const applicationVerified =
      approved?.length + shortfall?.length + rejected?.length;

    return {
      psId: eachPs?.id,
      psName: eachPs?.name,
      psContact: eachPs?.contact,
      assigned: applicationNotVerified?.length + applicationVerified,
      verified: applicationVerified,
      pending: applicationNotVerified?.length,
    };
  });

  Promise.all(verificationStatus).then((result) => {
    console.log(result, "verification result");
    return res.send(result);
  });
};

const handleGetPageWiseApps = async (req, res) => {
  const { userId, searchApplicationName } = JSON.parse(req.query.data);

  console.log(userId, searchApplicationName);

  let result;
  if (searchApplicationName === "Submit Applications") {
    result = await findSubmitAppsByQuery({ userId });
  }
  if (searchApplicationName === "Approved Applications") {
    result = await findApprovedAppsByQuery({ userId });
  }
  if (searchApplicationName === "Shortfall Applications") {
    console.log("Shortfall");
    result = await findShortfallAppsByQuery({ userId });
  }

  return res.send(result);
};

module.exports = {
  handleGetAllApps,
  handleGetAppsByQuery,
  handleGetAmountWithApps,
  handleGetChartData,
  handleGetSerialNo,
  handleGetVerificationStatus,
  handleGetPageWiseApps,
};
