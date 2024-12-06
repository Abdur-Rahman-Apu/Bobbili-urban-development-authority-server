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
  findAndDeletePreviousPayDetails,
} = require("../../Services/DBQueries/DbQueries");
const {
  encrypt,
  generateUniqueID,
  decrypt,
  updatePaymentStatus,
} = require("../../Services/Payment/Payment");

const crypto = require("crypto");
require("dotenv").config();

const handleStoreInitialPaymentInfo = async (req, res) => {
  const { applicationNo, ...paymentInfo } = req.body;

  console.log(req.body, "Query");
  const query = { applicationNo };

  const applicationData = await findDraftAppByQuery(query);

  // await updatePayment(
  //   { ...query, message: "initial" },
  //   { $set: { message: "cancel" } }
  // );
  await findAndDeletePreviousPayDetails(query);

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
  const { amount, payerInfo, applicationNo, page } = req.body;

  console.log(payerInfo, "payerInfo");
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
  // const redirect_url = `${baseUrl}/payment/response?page=${page}&orderId=${order_id}`;
  // const return_url = `http://localhost:5173/dashboard/draftApplication/paymentStatus/${order_id}`;
  // const return_url = `https://bobbili-urban-development-authority.netlify.app/dashboard/draftApplication/paymentStatus/${order_id}`;
  // const return_url = `https://bpa-buda.ap.gov.in/dashboard/draftApplication/paymentStatus/${order_id}`;
  const return_url = `${baseUrl}/payment/response?page=${page}&orderId=${order_id}`;
  // const cancel_url = redirect_url;

  console.log(process.env.ENC_KEY, "ENC key");

  console.log(
    {
      merchant_id: Number(process.env.MERCHANT_ID),
      order_id,
      amount: Number(amount),
      return_url,
    },
    "payment data"
  );

  const updatePayDoc = {
    $set: {
      orderId: order_id,
    },
  };

  const payQuery = { applicationNo, message: "initial" };

  await updatePayment(payQuery, updatePayDoc);

  // Fetch the RSA key from CCAvenue and encrypt data
  // const encryptedData = encrypt(
  //   qs.stringify({
  //     merchant_id: Number(process.env.MERCHANT_ID),
  //     order_id,
  //     amount: Number(amount),
  //     currency: "INR",
  //     redirect_url,
  //     cancel_url,
  //     billing_name,
  //     billing_email,
  //     billing_tel,
  //   }),
  //   process.env.WORKING_KEY
  // );

  const mandatoryFieldsEnc = encrypt(
    `${order_id}|25|10|Abdur|1234567890|123456789012|Bobbili|Bobbili|Bobbili|Bobbili`
  );
  console.log(mandatoryFieldsEnc, "mae");
  const returnUrlEnc = encrypt(`${return_url}`);
  console.log(returnUrlEnc);
  const refNoEnc = encrypt(`${order_id}`);
  console.log(refNoEnc);
  const subMerchantIdEnc = encrypt(`25`);
  const amountEnc = encrypt(`${10}`);
  const payModeEnc = encrypt(`9`);

  console.log(
    `https://eazypayuat.icicibank.com/EazyPG?merchantid=${process.env.MERCHANT_ID}&mandatory fields= ${order_id}|25|10|Abdur|1234567890|123456789123|Bobbili|Bobbili|Bobbili|Bobbili&optional fields=&returnurl=${return_url}&Reference No=${order_id}&submerchantid=25&transaction amount=10&paymode=9`
  );

  const url = `https://eazypayuat.icicibank.com/EazyPG?merchantid=${process.env.MERCHANT_ID}&mandatory fields=${mandatoryFieldsEnc}&optional fields=&returnurl=${returnUrlEnc}&Reference No=${refNoEnc}&submerchantid=${subMerchantIdEnc}&transaction amount=${amountEnc}&paymode=${payModeEnc}`;

  console.log(url);

  return res.send({ url });
};

const redirectAfterPay = async ({ res, status, page, paymentData }) => {
  const frontendDomain = "https://bpa-buda.ap.gov.in";
  // const frontendDomain = "http://localhost:5173";

  await updatePaymentStatus(paymentData, page);
  if (status) {
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
};

const handlePaymentResponse = async (req, res) => {
  console.log(req.body, "body");
  // const { encResp } = req.body;
  const { page, orderId } = req.query;
  const aesKey = process.env.ENC_KEY;
  console.log(page, orderId, "page&orderid");
  const data = req.body;

  let paymentData = {
    statusCode: data["Response Code"],
    message: "end",
  };

  console.log(
    `${data.ID}|${data.Response_Code}|${data.Unique_Ref_Number}|` +
      `${data.Service_Tax_Amount}|${data.Processing_Fee_Amount}|${data.Total_Amount}|` +
      `${data.Transaction_Amount}|${data.Transaction_Date}|${data.Interchange_Value}|` +
      `${data.TDR}|${data.Payment_Mode}|${data.SubMerchantId}|${data.ReferenceNo}|${data.TPS}|${aesKey}`,
    "verification string"
  );

  console.log(paymentData, "payment data");

  if (data["Response Code"] === "E000") {
    // Check if payment is successful

    paymentData = {
      ...paymentData,
      transactionId: data["Unique Ref Number"],
      paymentMode: data["Payment Mode"],
      paymentDate: data["Transaction Date"],
    };

    console.log(paymentData, "payment data in success");
    const verificationString =
      `${data.ID}|${data.Response_Code}|${data.Unique_Ref_Number}|` +
      `${data.Service_Tax_Amount}|${data.Processing_Fee_Amount}|${data.Total_Amount}|` +
      `${data.Transaction_Amount}|${data.Transaction_Date}|${data.Interchange_Value}|` +
      `${data.TDR}|${data.Payment_Mode}|${data.SubMerchantId}|${data.ReferenceNo}|${data.TPS}|${aesKey}`;

    const hash = crypto
      .createHash("sha512")
      .update(verificationString)
      .digest("hex");

    console.log(hash, "hash");

    console.log(hash === data.RS, "check hash data.RS");

    // const paymentData = {
    //   order_id,
    //   order_status,
    //   failure_message,
    //   status_code,
    //   status_message,
    //   amount,
    //   currency,
    //   tracking_id,
    //   payment_mode,
    //   card_name,
    //   customer_card_id,
    //   billing_name,
    //   billing_email,
    //   billing_tel,
    //   trans_date,
    //   message: "end",
    // };

    if (hash === data.RS) {
      console.log("hash match");
      // Validate the response
      console.log("Payment Successful!");
      // Handle success: update DB, send email, etc.
      redirectAfterPay({ res, status: 1, page, paymentData });
      // res.redirect(`/payment-success/${data.Unique_Ref_Number}`); // Redirect to a React route
    } else {
      redirectAfterPay({ res, status: 0, page, paymentData });
      console.log("Hash Mismatch. Payment Validation Failed.");
      // res.redirect("/payment-failed"); // Redirect to a React failure route
    }
  } else {
    console.log("Payment Failed.");
    const date = new Date().toLocaleString();

    const regex = /(?<month>\d{2})\/(?<day>\d{1,2})\/(?<year>\d{4})/g;
    const paymentDate = date.replaceAll(regex, "$<day>-$<month>-$<year>");
    paymentData = { ...paymentData, paymentDate };
    redirectAfterPay({ res, status: 0, page, paymentData });

    // res.redirect("/payment-failed"); // Redirect to a React failure route
  }
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
