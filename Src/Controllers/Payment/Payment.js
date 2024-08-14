const { ObjectId } = require("mongodb");
const { baseUrl } = require("../../Configs/BaseUrl");
const { paymentCollection } = require("../../Models/collections");
const {
  findDraftAppByQuery,
  insertPayment,
  updateDraftApp,
  findPaymentInfoByQuery,
  updatePayment,
  findPaymentInfosBySearchQuery,
} = require("../../Services/DBQueries/DbQueries");
const {
  encrypt,
  generateUniqueID,
  decrypt,
  updatePaymentStatus,
} = require("../../Services/Payment/Payment");

const qs = require("querystring");
require("dotenv").config();

const handleStoreInitialPaymentInfo = async (req, res) => {
  const { applicationNo, ...paymentInfo } = req.body;

  console.log(req.body, "Query");
  const query = { applicationNo };

  const applicationData = await findDraftAppByQuery(query);

  await updatePayment(
    { ...query, message: "initial" },
    { $set: { message: "cancel" } }
  );

  const insertInfoOfPayment = await insertPayment({
    message: "initial",
    ...req.body,
  });

  console.log(insertInfoOfPayment, "Insert result of payment");
  console.log(insertInfoOfPayment.insertedId, "Insert id result of payment");

  const updateDraftDoc = {
    $set: {
      "payment.udaCharge": {
        ...applicationData?.payment?.udaCharge,
        paymentId: String(insertInfoOfPayment.insertedId),
      },
    },
  };

  console.log(query, "query");
  console.log(updateDraftDoc, "update draft doc");

  await updateDraftApp(query, updateDraftDoc);

  return res.send({
    ...insertInfoOfPayment,
    onlinePaymentAmount: paymentInfo?.amount,
  });
};

const handlePaymentRequest = async (req, res) => {
  const {
    amount,
    billing_name,
    billing_email,
    billing_tel,
    applicationNo,
    page,
    // redirect_url,
    // cancel_url,
  } = req.body;

  console.log(req.body, "payment");

  const initialPaymentInfo = await findPaymentInfoByQuery({
    applicationNo,
    message: "initial",
  });

  console.log(initialPaymentInfo, "initial payment info");

  if (!initialPaymentInfo) {
    return res
      .status(404)
      .send({ message: "Please provide correct application no" });
  }

  if (Number(initialPaymentInfo?.amount) !== Number(amount)) {
    return res.status(404).send({ message: "Payment failed" });
  }

  const order_id = generateUniqueID();
  const redirect_url = `${baseUrl}/payment/response?page=${page}&orderId=${order_id}`;
  const cancel_url = redirect_url;

  console.log(process.env.WORKING_KEY, "working key");

  console.log(
    {
      merchant_id: Number(process.env.MERCHANT_ID),
      order_id,
      amount: Number(amount),
      currency: "INR",
      redirect_url,
      cancel_url,
      billing_email,
      billing_tel,
    },
    "payment data"
  );

  const updatePayDoc = {
    $set: { order_id },
  };

  const payQuery = { applicationNo, message: "initial" };
  await updatePayment(payQuery, updatePayDoc);

  // Fetch the RSA key from CCAvenue and encrypt data
  const encryptedData = encrypt(
    qs.stringify({
      merchant_id: Number(process.env.MERCHANT_ID),
      order_id,
      amount: Number(amount),
      currency: "INR",
      redirect_url,
      cancel_url,
      billing_name,
      billing_email,
      billing_tel,
    }),
    process.env.WORKING_KEY
  );

  return res.send({ encryptedData });
};

const handlePaymentResponse = async (req, res) => {
  const { encResp } = req.body;
  const { page, orderId } = req.query;
  const decryptedData = decrypt(encResp, process.env.WORKING_KEY);

  const data = qs.parse(decryptedData);

  console.log(decryptedData, "decrypted data");
  console.log(data, "parse data");
  // Process the decrypted data and verify payment status

  const {
    order_id,
    order_status,
    failure_message,
    status_code,
    status_message,
    amount,
    currency,
    tracking_id,
    payment_mode,
    card_name,
    customer_card_id,
    billing_name,
    billing_email,
    billing_tel,
    trans_date,
  } = data || {};

  const paymentData = {
    order_id,
    order_status,
    failure_message,
    status_code,
    status_message,
    amount,
    currency,
    tracking_id,
    payment_mode,
    card_name,
    customer_card_id,
    billing_name,
    billing_email,
    billing_tel,
    trans_date,
    message: "end",
  };

  console.log(paymentData, "payment data");

  // const frontendDomain = "http://localhost:5173";
  const frontendDomain = "https://bpa-buda.ap.gov.in";
  // const frontendDomain =
  //   "https://bobbili-urban-development-authority.netlify.app";

  const storedPayInfo = await findPaymentInfoByQuery({ order_id: orderId });

  if (order_status && storedPayInfo) {
    await updatePaymentStatus(paymentData, page);

    console.log(page, "page in payment");

    switch (page) {
      case "dashboard":
        return res.redirect(
          `${frontendDomain}/dashboard/draftApplication/paymentStatus/${storedPayInfo?._id}`
        );

      case "home":
        return res.redirect(
          `${frontendDomain}/onlinePayment/paymentStatus/${storedPayInfo?._id}`
        );
    }
  } else {
    switch (page) {
      case "dashboard":
        return res.redirect(
          `${frontendDomain}/dashboard/draftApplication/payment`
        );

      case "home":
        return res.redirect(`${frontendDomain}/onlinePayment`);
    }
  }
  // switch (order_status) {
  //   case "Success":
  //     await updatePaymentStatus(paymentData,page);
  //     break;
  //   case "Failure":
  //     break;
  //   case "Aborted":
  //     break;
  //   case "Invalid":
  //     break;
  //   case "Timeout":
  //     break;
  // }
};

const handleGetPayInfo = async (req, res) => {
  const id = req.query.id;
  console.log(id, "ID OF PAYMENT");
  const query = {
    _id: new ObjectId(id),
  };

  const result = await findPaymentInfoByQuery(query);
  console.log(result, "payment result");
  return res.send(result);
};

const handleSearchPayInfo = async (req, res) => {
  const search = JSON.parse(req.query.search);

  console.log(search, "search");
  console.log(search?.name, "search");
  let query;

  if (search?.appNo) {
    query = { applicationNo: search?.appNo };
  }

  if (search?.name) {
    console.log(search?.name, "search name");
    query = { billing_name: { $regex: `${search?.name}`, $options: "i" } };
  }

  let result = await findPaymentInfosBySearchQuery(query);

  if (result) {
    result = result.map((data) => {
      const { _id, ...rest } = data;
      return rest;
    });
  }

  return res.send(result);
};

module.exports = {
  handleStoreInitialPaymentInfo,
  handlePaymentRequest,
  handlePaymentResponse,
  handleGetPayInfo,
  handleSearchPayInfo,
};
