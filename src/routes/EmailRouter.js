const {
  SendRegistrationEmail,
  AddBidEmail,
  NetworkNotifyEmail,
  WithdrawEmail,
  Network2FAEmail,
  TopupNotifyEmail,
  AcceptBidEmail,
  OfferExpiredEmail,
  ForgetPasswordEmail,
  AccountConfirmEmail,
  BidInterestEmail,
  Admin2FAEmail,
  Login2FAEmail,
  ForgetPasswordAdminEmail,
  NFTPurchasedEmail,
  NFTSoldEmail,
  RegisterCompletionEmail,
  NFTSellEmail,
  BulkIssueEmail,
  BulkSuccessEmail,
  CSVBulkuploadSuccessEmail,
  RegisterAdminNotifyEmail,
} = require("../controllers/EmailController");

function MailRoutes(fastify, options, done) {
  /* To Send Register Confirmation Email */

  fastify.post("/RegisterEmail", SendRegistrationEmail);

  fastify.post("/WithdrawEmail", WithdrawEmail);

  fastify.post("/AddBidEmail", AddBidEmail);

  fastify.post("/TopupNotifyEmail", TopupNotifyEmail);

  fastify.post("/AcceptBidEmail", AcceptBidEmail);

  fastify.post("/OfferExpiredEmail", OfferExpiredEmail);

  /* Login 2FA Email for Login */

  fastify.post("/Login2FAVerifyEmail", Login2FAEmail);

  /* To Send Forgot Password Email */

  fastify.post("/ResetPasswordEmail", ForgetPasswordEmail);

  /* Admin 2FA Email for Login */

  fastify.post("/Admin2FAVerifyEmail", Admin2FAEmail);

  fastify.post("/Network2FAEmail", Network2FAEmail);

  /* Admin Reset Password */

  fastify.post("/ResetPasswordAdminEmail", ForgetPasswordAdminEmail);

  /* To Send Register Complete Email */

  fastify.post("/RegisterCompletionEmail", RegisterCompletionEmail);

  fastify.post("/RegisterAdminNotifyEmail", RegisterAdminNotifyEmail);

  /* To Send NFT Sold Completion Email */

  fastify.post("/NFTSoldEmail", NFTSoldEmail);

  /* To Send Purchase Completion Email */

  fastify.post("/NFTPurchasedEmail", NFTPurchasedEmail);

  /* To Send Sell Request Email */

  fastify.post("/NFTSellEmail", NFTSellEmail);

  fastify.post("/BulkIssueEmail", BulkIssueEmail);

  fastify.post("/AccountConfirmEmail", AccountConfirmEmail);

  fastify.post("/BulkSuccessEmail", BulkSuccessEmail);

  fastify.post("/NetworkNotifyEmail", NetworkNotifyEmail);

  fastify.post("/CSVSuccessEmail", CSVBulkuploadSuccessEmail);

  fastify.post("/BidInterestEmail", BidInterestEmail);

  done();
}

module.exports = MailRoutes;
