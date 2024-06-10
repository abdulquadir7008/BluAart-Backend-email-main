const NodeMailer = require("nodemailer");
const SgTransport = require("nodemailer-sendgrid-transport");
//const sgMail = require('@sendgrid/mail')
const HandleBars = require("handlebars");
const Config = require("../Config");
const { Pool } = require("pg");
let SettingInfo;
let SmtpTransporter;

const pool = new Pool(Config.sqldb);

async function GetInfo() {
  SettingInfo = await pool.query('SELECT * FROM "Settings"');
  SettingInfo = SettingInfo.rows[0];
  SmtpTransporter = NodeMailer.createTransport({
    host: SettingInfo.SmtpHost,
    port: SettingInfo.SmtpPort,
    secure: false,
    auth: {
      user: SettingInfo.SmtpUser,
      pass: SettingInfo.SmtpPassword,
    },
  });
  const options = {
    auth: {
      api_key: SettingInfo.SendGridApiKey,
    },
  };
  SendGridTransporter = NodeMailer.createTransport(SgTransport(options));
}

/* Registration Confimration Email */

const SendRegistrationEmail = async (req, res) => {
  try {
    await GetInfo();

    const { To, OTP, UserName } = req.body;

    let Template = await pool.query(
      `SELECT * FROM "EmailTemplates" where "Category" = 'Register'`
    );
    Template = Template.rows[0];

    const Logo = SettingInfo.Logo ? SettingInfo.Logo : "";

    const data = {
      projectName: SettingInfo.ProjectName,
      projectLogo: Logo,
      greet: UserName,
      OTP: OTP,
      weblink: SettingInfo.Weblink,
      twitter: SettingInfo.Twitter,
      facebook: SettingInfo.Facebook,
      linkedin: SettingInfo.Linkedin,
      pinterest: SettingInfo.Pinterest,
      youtube: SettingInfo.Youtube,
      instagram: SettingInfo.Instagram,
      copyrightYear: SettingInfo.CopyrightYear,
      contactEmail: SettingInfo.ContactEmail,
    };
    let Subject = Template.Subject;
    const compiledTemplate = HandleBars.compile(Template.Html);
    const Body = compiledTemplate(data);

    let Info = true;

    if (SettingInfo.EmailType == "smtp") {
      const MailOptions = {
        from: SettingInfo.SmtpUser,
        to: To,
        subject: Subject,
        html: Body,
      };
      SmtpTransporter.sendMail(MailOptions, (error, info) => {
        console.log("fgfgf", error, "info", info);
        if (error) {
          Info = false;
        } else {
          Info = true;
        }
      });
    } else {
      // sgMail.setApiKey(SettingInfo.SendGridApiKey)
      // const msg = {
      //   to: To, // Change to your recipient
      //   from: SettingInfo.SendGridUser, // Change to your verified sender
      //   subject: Subject,
      //   text: 'and easy to do anywhere, even with Node.js',
      //   html: Body,
      // }
      // sgMail
      //   .send(msg)
      //   .then(() => {
      //     console.log('Email sent')
      //   })
      //   .catch((error) => {
      //     console.error(error)
      //   })
      const MailOptions = {
        from: SettingInfo.SendGridUser,
        to: To,
        subject: Subject,
        html: Body,
      };
      SendGridTransporter.sendMail(MailOptions, (error, info) => {
        if (error) {
          Info = false;
        } else {
          Info = true;
        }
      });
    }

    if (Info) {
      return res.code(200).send({ status: true });
    } else {
      return res.code(500).send({ status: false });
    }
  } catch (error) {
    console.log("error-/emailsend", error);
    res.code(500).send({
      status: false,
      message: "Error Occurred",
      error: "error",
    });
  }
};

/* Registration Complete Email */

const RegisterCompletionEmail = async (req, res) => {
  try {
    await GetInfo();

    const { To, Message } = req.body;
    let Template = await pool.query(
      `Select "Subject","Html" from "EmailTemplates" where "Category" = 'RegisterConfirm'`
    );
    Template = Template.rows[0];
    const Logo = SettingInfo.Logo ? SettingInfo.Logo : "";
    let UserData = await pool.query(
      `Select "Email" , "UserName" from "Users" where "Email" = '${To}'`
    );
    const greet =
      UserData && UserData.rows[0].UserName
        ? UserData.rows[0].UserName
        : "User";

    const data = {
      projectName: SettingInfo.ProjectName,
      projectLogo: Logo,
      greet: greet ? greet : "User",
      message: Message,
      weblink: SettingInfo.Weblink,
      twitter: SettingInfo.Twitter,
      facebook: SettingInfo.Facebook,
      linkedin: SettingInfo.Linkedin,
      pinterest: SettingInfo.Pinterest,
      youtube: SettingInfo.Youtube,
      instagram: SettingInfo.Instagram,
      copyrightYear: SettingInfo.CopyrightYear,
      contactEmail: SettingInfo.ContactEmail,
    };

    let Subject = Template.Subject;
    const compiledTemplate = HandleBars.compile(Template.Html);
    const Body = compiledTemplate(data);
    let Info = true;

    if (SettingInfo.EmailType == "sendgrid") {
      const MailOptions = {
        from: SettingInfo.SmtpUser,
        to: To,
        subject: Subject,
        html: Body,
      };
      SmtpTransporter.sendMail(MailOptions, (error, info) => {
        console.log("fgfgf", error, "info", info);
        if (error) {
          Info = false;
        } else {
          Info = true;
        }
      });
    } else {
      const MailOptions = {
        from: SettingInfo.SendGrid.User,
        to: To,
        subject: Subject,
        html: Body,
      };
      SendGridTransporter.sendMail(MailOptions, (error, info) => {
        if (error) {
          Info = false;
        } else {
          Info = true;
        }
      });
    }

    if (Info) {
      return res.code(200).send({ status: true });
    } else {
      return res.code(500).send({ status: false });
    }
  } catch (error) {
    console.log("error-/emailsend", error);
    res.code(500).send({
      status: false,
      message: "Error Occurred",
      error: "error",
    });
  }
};

const AccountConfirmEmail = async (req, res) => {
  try {
    await GetInfo();

    const { To, Message } = req.body;

    let Template = await pool.query(
      `Select "Subject","Html" from "EmailTemplates" where "Category" = 'AccountConfirm'`
    );
    Template = Template.rows[0];

    const Logo = SettingInfo.Logo ? SettingInfo.Logo : "";

    let UserData = await pool.query(
      `Select "Email" , "UserName" from "Users" where "Email" = '${To}'`
    );

    const greet =
      UserData && UserData.rows[0].UserName
        ? UserData.rows[0].UserName
        : "User";

    const data = {
      projectName: SettingInfo.ProjectName,
      projectLogo: Logo,
      greet: greet ? greet : "User",
      Message: Message,
      weblink: SettingInfo.Weblink,
      twitter: SettingInfo.Twitter,
      facebook: SettingInfo.Facebook,
      linkedin: SettingInfo.Linkedin,
      pinterest: SettingInfo.Pinterest,
      youtube: SettingInfo.Youtube,
      instagram: SettingInfo.Instagram,
      copyrightYear: SettingInfo.CopyrightYear,
      contactEmail: SettingInfo.ContactEmail,
    };

    let Subject = Template.Subject;
    const compiledTemplate = HandleBars.compile(Template.Html);
    const Body = compiledTemplate(data);

    let Info = true;

    if (SettingInfo.EmailType == "smtp") {
      const MailOptions = {
        from: SettingInfo.SmtpUser,
        to: To,
        subject: Subject,
        html: Body,
      };
      SmtpTransporter.sendMail(MailOptions, (error, info) => {
        if (error) {
          Info = false;
        } else {
          Info = true;
        }
      });
    } else {
      const MailOptions = {
        from: SettingInfo.SendGrid.User,
        to: To,
        subject: Subject,
        html: Body,
      };
      SendGridTransporter.sendMail(MailOptions, (error, info) => {
        if (error) {
          Info = false;
        } else {
          Info = true;
        }
      });
    }

    if (Info) {
      return res.code(200).send({ status: true });
    } else {
      return res.code(500).send({ status: false });
    }
  } catch (error) {
    console.log("error-/emailsend", error);
    res.code(500).send({
      status: false,
      message: "Error Occurred",
      error: "error",
    });
  }
};

const RegisterAdminNotifyEmail = async (req, res) => {
  try {
    await GetInfo();

    const { To, Count } = req.body;

    let Template = await pool.query(
      `SELECT * FROM "EmailTemplates" where "Category" = 'Register Admin Notify'`
    );
    Template = Template.rows[0];

    const Logo = SettingInfo.Logo ? SettingInfo.Logo : "";

    const data = {
      projectName: SettingInfo.ProjectName,
      projectLogo: Logo,
      greet: "Admin",
      Count: Count,
      weblink: SettingInfo.Weblink,
      twitter: SettingInfo.Twitter,
      facebook: SettingInfo.Facebook,
      linkedin: SettingInfo.Linkedin,
      pinterest: SettingInfo.Pinterest,
      youtube: SettingInfo.Youtube,
      instagram: SettingInfo.Instagram,
      copyrightYear: SettingInfo.CopyrightYear,
      contactEmail: SettingInfo.ContactEmail,
    };

    let Subject = Template.Subject;
    const compiledTemplate = HandleBars.compile(Template.Html);
    const Body = compiledTemplate(data);

    let Info = true;

    if (SettingInfo.EmailType == "smtp") {
      const MailOptions = {
        from: SettingInfo.SmtpUser,
        to: To,
        subject: Subject,
        html: Body,
      };
      SmtpTransporter.sendMail(MailOptions, (error, info) => {
        console.log("fgfgf", error, "info", info);
        if (error) {
          Info = false;
        } else {
          Info = true;
        }
      });
    } else {
      const MailOptions = {
        from: SettingInfo.SendGridUser,
        to: To,
        subject: Subject,
        html: Body,
      };
      SendGridTransporter.sendMail(MailOptions, (error, info) => {
        if (error) {
          Info = false;
        } else {
          Info = true;
        }
      });
    }

    if (Info) {
      return res.code(200).send({ status: true });
    } else {
      return res.code(500).send({ status: false });
    }
  } catch (error) {
    console.log("error-/emailsend", error);
    res.code(500).send({
      status: false,
      message: "Error Occurred",
      error: "error",
    });
  }
};

const TopupNotifyEmail = async (req, res) => {
  try {
    await GetInfo();

    const { WalletAddress, Currency } = req.body;

    let Template = await pool.query(
      `SELECT * FROM "EmailTemplates" where "Category" = 'Topup'`
    );
    Template = Template.rows[0];

    const Logo = SettingInfo.Logo ? SettingInfo.Logo : "";

    let UserData = await pool.query(`SELECT * FROM "Admin" WHERE _id = 1`);
    UserData = UserData.rows[0];
    let To = UserData.Email;

    const data = {
      projectName: SettingInfo.ProjectName,
      projectLogo: Logo,
      greet: "Admin",
      WalletAddress: WalletAddress,
      Currency: Currency,
      weblink: SettingInfo.Weblink,
      twitter: SettingInfo.Twitter,
      facebook: SettingInfo.Facebook,
      linkedin: SettingInfo.Linkedin,
      pinterest: SettingInfo.Pinterest,
      youtube: SettingInfo.Youtube,
      instagram: SettingInfo.Instagram,
      copyrightYear: SettingInfo.CopyrightYear,
      contactEmail: SettingInfo.ContactEmail,
    };

    let Subject = Template.Subject;
    const compiledTemplate = HandleBars.compile(Template.Html);
    const Body = compiledTemplate(data);

    let Info = true;

    if (SettingInfo.EmailType == "smtp") {
      const MailOptions = {
        from: SettingInfo.SmtpUser,
        to: To,
        subject: Subject,
        html: Body,
      };
      SmtpTransporter.sendMail(MailOptions, (error, info) => {
        console.log("fgfgf", error, "info", info);
        if (error) {
          Info = false;
        } else {
          Info = true;
        }
      });
    } else {
      const MailOptions = {
        from: SettingInfo.SendGridUser,
        to: To,
        subject: Subject,
        html: Body,
      };
      SendGridTransporter.sendMail(MailOptions, (error, info) => {
        if (error) {
          Info = false;
        } else {
          Info = true;
        }
      });
    }

    if (Info) {
      return res.code(200).send({ status: true });
    } else {
      return res.code(500).send({ status: false });
    }
  } catch (error) {
    console.log("error-/emailsend", error);
    res.code(500).send({
      status: false,
      message: "Error Occurred",
      error: "error",
    });
  }
};

const WithdrawEmail = async (req, res) => {
  try {
    await GetInfo();

    const { AdminWallet, UserWallet, Amount, Currency } = req.body;

    let Template = await pool.query(
      `SELECT * FROM "EmailTemplates" where "Category" = 'Withdraw'`
    );
    Template = Template.rows[0];

    const Logo = SettingInfo.Logo ? SettingInfo.Logo : "";

    let UserData = await pool.query(`SELECT * FROM "Admin" WHERE _id = 1`);
    UserData = UserData.rows[0];
    let To = UserData.Email;

    const data = {
      projectName: SettingInfo.ProjectName,
      projectLogo: Logo,
      greet: "Admin",
      AdminWallet: AdminWallet,
      Currency: Currency,
      UserWallet: UserWallet,
      Amount: Amount,
      weblink: SettingInfo.Weblink,
      twitter: SettingInfo.Twitter,
      facebook: SettingInfo.Facebook,
      linkedin: SettingInfo.Linkedin,
      pinterest: SettingInfo.Pinterest,
      youtube: SettingInfo.Youtube,
      instagram: SettingInfo.Instagram,
      copyrightYear: SettingInfo.CopyrightYear,
      contactEmail: SettingInfo.ContactEmail,
    };

    let Subject = Template.Subject;
    const compiledTemplate = HandleBars.compile(Template.Html);
    const Body = compiledTemplate(data);

    let Info = true;

    if (SettingInfo.EmailType == "smtp") {
      const MailOptions = {
        from: SettingInfo.SmtpUser,
        to: To,
        subject: Subject,
        html: Body,
      };
      SmtpTransporter.sendMail(MailOptions, (error, info) => {
        console.log("fgfgf", error, "info", info);
        if (error) {
          Info = false;
        } else {
          Info = true;
        }
      });
    } else {
      const MailOptions = {
        from: SettingInfo.SendGridUser,
        to: To,
        subject: Subject,
        html: Body,
      };
      SendGridTransporter.sendMail(MailOptions, (error, info) => {
        if (error) {
          Info = false;
        } else {
          Info = true;
        }
      });
    }

    if (Info) {
      return res.code(200).send({ status: true });
    } else {
      return res.code(500).send({ status: false });
    }
  } catch (error) {
    console.log("error-/emailsend", error);
    res.code(500).send({
      status: false,
      message: "Error Occurred",
      error: "error",
    });
  }
};

/* Forgot Password Email */

const ForgetPasswordEmail = async (req, res) => {
  try {
    await GetInfo();

    const { To, ResetUrl } = req.body;

    let Template = await pool.query(
      `SELECT * FROM "EmailTemplates" where "Category" = 'Reset Password'`
    );
    Template = Template.rows[0];

    const Logo = SettingInfo.Logo ? SettingInfo.Logo : "";

    let UserData = await pool.query(
      `Select "Email" , "UserName" from "Users" where "Email" = '${To}'`
    );
    const greet =
      UserData && UserData.rows[0].UserName
        ? UserData.rows[0].UserName
        : "User";

    const data = {
      projectName: SettingInfo.ProjectName,
      projectLogo: Logo,
      greet: greet,
      resetUrl: ResetUrl,
      weblink: SettingInfo.Weblink,
      twitter: SettingInfo.Twitter,
      facebook: SettingInfo.Facebook,
      linkedin: SettingInfo.Linkedin,
      pinterest: SettingInfo.Pinterest,
      youtube: SettingInfo.Youtube,
      instagram: SettingInfo.Instagram,
      copyrightYear: SettingInfo.CopyrightYear,
      contactEmail: SettingInfo.ContactEmail,
    };

    let Subject = Template.Subject;
    const CompiledTemplate = HandleBars.compile(Template.Html);
    const Body = CompiledTemplate(data);

    let Info = true;

    if (SettingInfo.EmailType == "smtp") {
      const MailOptions = {
        from: SettingInfo.SmtpUser,
        to: To,
        subject: Subject,
        html: Body,
      };
      SmtpTransporter.sendMail(MailOptions, (error, info) => {
        console.log("fgfgf", error, "info", info);
        if (error) {
          Info = false;
        } else {
          Info = true;
        }
      });
    } else {
      const MailOptions = {
        from: SettingInfo.SendGridUser,
        to: To,
        subject: Subject,
        html: Body,
      };
      SendGridTransporter.sendMail(MailOptions, (error, info) => {
        if (error) {
          Info = false;
        } else {
          Info = true;
        }
      });
    }
    console.log("Info", Info);

    if (Info) {
      return res.code(200).send({ status: true });
    } else {
      return res.code(500).send({ status: false });
    }
  } catch (error) {
    console.log("error-/emailsend", error);
    res.code(500).send({
      status: false,
      message: "Error Occurred",
      error: "error",
    });
  }
};

/* Forgot Password Admin Email */

const ForgetPasswordAdminEmail = async (req, res) => {
  try {
    await GetInfo();

    const { To, ResetUrl } = req.body;

    let Template = await pool.query(
      `SELECT * FROM "EmailTemplates" WHERE "Category" = 'Admin Reset Password'`
    );
    Template = Template.rows[0];

    const Logo = SettingInfo.logo ? SettingInfo.logo : "";

    let UserData = await pool.query(
      `SELECT * FROM "Admin" WHERE "Email" = '${To}'`
    );
    UserData = UserData.rows[0];
    const greet = UserData && UserData.UserName ? UserData.UserName : "User";

    const data = {
      projectName: SettingInfo.projectname,
      projectLogo: Logo,
      greet: greet ? greet : "User",
      resetUrl: ResetUrl,
      weblink: SettingInfo.weblink,
      twitter: SettingInfo.twitter,
      facebook: SettingInfo.facebook,
      linkedin: SettingInfo.linkedin,
      pinterest: SettingInfo.pinterest,
      youtube: SettingInfo.youtube,
      instagram: SettingInfo.instagram,
      copyrightYear: SettingInfo.copyrightyear,
      contactEmail: SettingInfo.contactemail,
    };

    let Subject = Template.Subject;
    const CompiledTemplate = HandleBars.compile(Template.Html);
    const Body = CompiledTemplate(data);

    let Info = true;

    if (SettingInfo.EmailType == "smtp") {
      const MailOptions = {
        from: SettingInfo.SmtpUser,
        to: To,
        subject: Subject,
        html: Body,
      };
      SmtpTransporter.sendMail(MailOptions, (error, info) => {
        if (error) {
          Info = false;
        } else {
          Info = true;
        }
      });
    } else {
      const MailOptions = {
        from: SettingInfo.SendGridUser,
        to: To,
        subject: Subject,
        html: Body,
      };
      SendGridTransporter.sendMail(MailOptions, (error, info) => {
        if (error) {
          Info = false;
        } else {
          Info = true;
        }
      });
    }

    if (Info) {
      return res.code(200).send({ status: true });
    } else {
      return res.code(500).send({ status: false });
    }
  } catch (error) {
    console.log("error-/emailsend", error);
    res.code(500).send({
      status: false,
      message: "Error Occurred",
      error: "error",
    });
  }
};

/* Login 2FA Email */

const Login2FAEmail = async (req, res) => {
  try {
    await GetInfo();

    const { To, OTP } = req.body;

    let Template = await pool.query(
      `SELECT * FROM "EmailTemplates" where "Category" = 'Login 2FA'`
    );
    Template = Template.rows[0];

    const Logo = SettingInfo.Logo ? SettingInfo.Logo : "";

    let UserData = await pool.query(
      `Select "Email" , "UserName" from "Users" where "Email" = '${To}'`
    );
    const greet =
      UserData && UserData.rows[0].UserName
        ? UserData.rows[0].UserName
        : "User";

    const data = {
      projectName: SettingInfo.ProjectName,
      projectLogo: Logo,
      greet: greet,
      OTP: OTP,
      weblink: SettingInfo.Weblink,
      twitter: SettingInfo.Twitter,
      facebook: SettingInfo.Facebook,
      linkedin: SettingInfo.Linkedin,
      pinterest: SettingInfo.Pinterest,
      youtube: SettingInfo.Youtube,
      instagram: SettingInfo.Instagram,
      copyrightYear: SettingInfo.CopyrightYear,
      contactEmail: SettingInfo.ContactEmail,
    };

    let Subject = Template.Subject;
    const CompiledTemplate = HandleBars.compile(Template.Html);
    const Body = CompiledTemplate(data);

    let Info = true;

    if (SettingInfo.EmailType == "smtp") {
      const MailOptions = {
        from: SettingInfo.SmtpUser,
        to: To,
        subject: Subject,
        html: Body,
      };
      SmtpTransporter.sendMail(MailOptions, (error, info) => {
        console.log("fgfgf", error, "info", info);
        if (error) {
          Info = false;
        } else {
          Info = true;
        }
      });
    } else {
      const MailOptions = {
        from: SettingInfo.SendGridUser,
        to: To,
        subject: Subject,
        html: Body,
      };
      SendGridTransporter.sendMail(MailOptions, (error, info) => {
        if (error) {
          Info = false;
        } else {
          Info = true;
        }
      });
    }

    if (Info) {
      return res.code(200).send({ status: true });
    } else {
      return res.code(500).send({ status: false });
    }
  } catch (error) {
    console.log("error-/emailsend", error);
    res.code(500).send({
      status: false,
      message: "Error Occurred",
      error: "error",
    });
  }
};

/* Admin 2FA Email */

const Admin2FAEmail = async (req, res) => {
  try {
    await GetInfo();

    const { To, OTP } = req.body;

    let Template = await pool.query(
      `SELECT * FROM "EmailTemplates" where "Category" = 'Admin 2FA'`
    );

    Template = Template.rows[0];
    const Logo = SettingInfo.Logo ? SettingInfo.Logo : "";

    const data = {
      projectName: SettingInfo.ProjectName,
      projectLogo: Logo,
      greet: "Admin",
      OTP: OTP,
      weblink: SettingInfo.Weblink,
      twitter: SettingInfo.Twitter,
      facebook: SettingInfo.Facebook,
      linkedin: SettingInfo.Linkedin,
      pinterest: SettingInfo.Pinterest,
      youtube: SettingInfo.Youtube,
      instagram: SettingInfo.Instagram,
      copyrightYear: SettingInfo.CopyrightYear,
      contactEmail: SettingInfo.ContactEmail,
    };

    let Subject = Template.Subject;
    const CompiledTemplate = HandleBars.compile(Template.Html);
    const Body = CompiledTemplate(data);

    let Info = true;
    if (SettingInfo.EmailType == "smtp") {
      const MailOptions = {
        from: SettingInfo.SmtpUser,
        to: To,
        subject: Subject,
        html: Body,
      };
      SmtpTransporter.sendMail(MailOptions, (error, info) => {
        console.log("error", error);
        if (error) {
          Info = false;
        } else {
          Info = true;
        }
      });
    } else {
      const MailOptions = {
        from: SettingInfo.SendGridUser,
        to: To,
        subject: Subject,
        html: Body,
      };
      SendGridTransporter.sendMail(MailOptions, (error, info) => {
        console.log("error", error);
        if (error) {
          Info = false;
        } else {
          Info = true;
        }
      });
    }

    if (Info) {
      return res.code(200).send({ status: true });
    } else {
      return res.code(500).send({ status: false });
    }
  } catch (error) {
    console.log("error-/emailsend", error);
    res.code(500).send({
      status: false,
      message: "Error Occurred",
      error: "error",
    });
  }
};

const Network2FAEmail = async (req, res) => {
  try {
    await GetInfo();

    const { To, OTP } = req.body;

    let Template = await pool.query(
      `SELECT * FROM "EmailTemplates" where "Category" = 'Network 2FA'`
    );

    Template = Template.rows[0];
    const Logo = SettingInfo.Logo ? SettingInfo.Logo : "";

    const data = {
      projectName: SettingInfo.ProjectName,
      projectLogo: Logo,
      greet: "Admin",
      OTP: OTP,
      weblink: SettingInfo.Weblink,
      twitter: SettingInfo.Twitter,
      facebook: SettingInfo.Facebook,
      linkedin: SettingInfo.Linkedin,
      pinterest: SettingInfo.Pinterest,
      youtube: SettingInfo.Youtube,
      instagram: SettingInfo.Instagram,
      copyrightYear: SettingInfo.CopyrightYear,
      contactEmail: SettingInfo.ContactEmail,
    };

    let Subject = Template.Subject;
    const CompiledTemplate = HandleBars.compile(Template.Html);
    const Body = CompiledTemplate(data);

    let Info = true;
    if (SettingInfo.EmailType == "smtp") {
      const MailOptions = {
        from: SettingInfo.SmtpUser,
        to: To,
        subject: Subject,
        html: Body,
      };
      SmtpTransporter.sendMail(MailOptions, (error, info) => {
        console.log("error", error);
        if (error) {
          Info = false;
        } else {
          Info = true;
        }
      });
    } else {
      const MailOptions = {
        from: SettingInfo.SendGridUser,
        to: To,
        subject: Subject,
        html: Body,
      };
      SendGridTransporter.sendMail(MailOptions, (error, info) => {
        console.log("error", error);
        if (error) {
          Info = false;
        } else {
          Info = true;
        }
      });
    }

    if (Info) {
      return res.code(200).send({ status: true });
    } else {
      return res.code(500).send({ status: false });
    }
  } catch (error) {
    console.log("error-/emailsend", error);
    res.code(500).send({
      status: false,
      message: "Error Occurred",
      error: "error",
    });
  }
};

/* NFT Purchase Email */

const NFTPurchasedEmail = async (req, res) => {
  try {
    await GetInfo();

    const { To } = req.body;

    let Template = await pool.query(
      `SELECT * FROM "EmailTemplates" where "Category" = 'NFT Purchased'`
    );
    Template = Template.rows[0];

    const Logo = SettingInfo.Logo ? SettingInfo.Logo : "";

    let UserData = await pool.query(
      `Select "Email" , "UserName" from "Users" where "Email" = '${To}'`
    );
    const greet =
      UserData && UserData.rows[0].UserName
        ? UserData.rows[0].UserName
        : "User";

    const data = {
      projectName: SettingInfo.ProjectName,
      projectLogo: Logo,
      greet: greet ? greet : "User",
      weblink: SettingInfo.Weblink,
      twitter: SettingInfo.Twitter,
      facebook: SettingInfo.Facebook,
      linkedin: SettingInfo.Linkedin,
      pinterest: SettingInfo.Pinterest,
      youtube: SettingInfo.Youtube,
      instagram: SettingInfo.Instagram,
      copyrightYear: SettingInfo.CopyrightYear,
      contactEmail: SettingInfo.ContactEmail,
    };

    let Subject = Template.Subject;
    const CompiledTemplate = HandleBars.compile(Template.Html);
    const Body = CompiledTemplate(data);

    let Info = true;

    if (SettingInfo.EmailType == "smtp") {
      const MailOptions = {
        from: SettingInfo.SmtpUser,
        to: To,
        subject: Subject,
        html: Body,
      };
      SmtpTransporter.sendMail(MailOptions, (error, info) => {
        console.log("fgfgf", error, "info", info);
        if (error) {
          Info = false;
        } else {
          Info = true;
        }
      });
    } else {
      const MailOptions = {
        from: SettingInfo.SendGridUser,
        to: To,
        subject: Subject,
        html: Body,
      };
      SendGridTransporter.sendMail(MailOptions, (error, info) => {
        if (error) {
          Info = false;
        } else {
          Info = true;
        }
      });
    }

    if (Info) {
      return res.code(200).send({ status: true });
    } else {
      return res.code(500).send({ status: false });
    }
  } catch (error) {
    console.log("error-/emailsend", error);
    res.code(500).send({
      status: false,
      message: "Error Occurred",
      error: "error",
    });
  }
};

/* NFT Sold Email */

const NFTSoldEmail = async (req, res) => {
  try {
    await GetInfo();

    const { To } = req.body;

    let Template = await pool.query(
      `SELECT * FROM "EmailTemplates" where "Category" = 'NFT Sold'`
    );
    Template = Template.rows[0];

    const Logo = SettingInfo.Logo ? SettingInfo.Logo : "";

    let UserData = await pool.query(
      `Select "Email" , "UserName" from "Users" where "Email" = '${To}'`
    );
    const greet =
      UserData && UserData.rows[0].UserName
        ? UserData.rows[0].UserName
        : "User";
    const data = {
      projectName: SettingInfo.ProjectName,
      projectLogo: Logo,
      greet: greet ? greet : "User",
      weblink: SettingInfo.Weblink,
      twitter: SettingInfo.Twitter,
      facebook: SettingInfo.Facebook,
      linkedin: SettingInfo.Linkedin,
      pinterest: SettingInfo.Pinterest,
      youtube: SettingInfo.Youtube,
      instagram: SettingInfo.Instagram,
      copyrightYear: SettingInfo.CopyrightYear,
      contactEmail: SettingInfo.ContactEmail,
    };

    let Subject = Template.Subject;
    const CompiledTemplate = HandleBars.compile(Template.Html);
    const Body = CompiledTemplate(data);

    let Info = true;

    if (SettingInfo.EmailType == "smtp") {
      const MailOptions = {
        from: SettingInfo.SmtpUser,
        to: To,
        subject: Subject,
        html: Body,
      };
      SmtpTransporter.sendMail(MailOptions, (error, info) => {
        console.log("fgfgf", error, "info", info);
        if (error) {
          Info = false;
        } else {
          Info = true;
        }
      });
    } else {
      const MailOptions = {
        from: SettingInfo.SendGridUser,
        to: To,
        subject: Subject,
        html: Body,
      };
      SendGridTransporter.sendMail(MailOptions, (error, info) => {
        if (error) {
          Info = false;
        } else {
          Info = true;
        }
      });
    }

    if (Info) {
      return res.code(200).send({ status: true });
    } else {
      return res.code(500).send({ status: false });
    }
  } catch (error) {
    console.log("error-/emailsend", error);
    res.code(500).send({
      status: false,
      message: "Error Occurred",
      error: "error",
    });
  }
};

/* NFT Sell Request Email */

const NFTSellEmail = async (req, res) => {
  try {
    await GetInfo();

    const { To } = req.body;

    let Template = await pool.query(
      `SELECT * FROM "EmailTemplates" where "Category" = 'NFT Sell Request'`
    );
    Template = Template.rows[0];

    const Logo = SettingInfo.Logo ? SettingInfo.Logo : "";

    let UserData = await pool.query(
      `Select "Email" , "UserName" from "Users" where "Email" = '${To}'`
    );
    const greet =
      UserData && UserData.rows[0].UserName
        ? UserData.rows[0].UserName
        : "User";

    const data = {
      projectName: SettingInfo.ProjectName,
      projectLogo: Logo,
      greet: greet ? greet : "User",
      weblink: SettingInfo.Weblink,
      twitter: SettingInfo.Twitter,
      facebook: SettingInfo.Facebook,
      linkedin: SettingInfo.Linkedin,
      pinterest: SettingInfo.Pinterest,
      youtube: SettingInfo.Youtube,
      instagram: SettingInfo.Instagram,
      copyrightYear: SettingInfo.CopyrightYear,
      contactEmail: SettingInfo.ContactEmail,
    };

    let Subject = Template.Subject;
    const CompiledTemplate = HandleBars.compile(Template.Html);
    const Body = CompiledTemplate(data);

    let Info = true;

    if (SettingInfo.EmailType == "smtp") {
      const MailOptions = {
        from: SettingInfo.SmtpUser,
        to: To,
        subject: Subject,
        html: Body,
      };
      SmtpTransporter.sendMail(MailOptions, (error, info) => {
        console.log("fgfgf", error, "info", info);
        if (error) {
          Info = false;
        } else {
          Info = true;
        }
      });
    } else {
      const MailOptions = {
        from: SettingInfo.SendGridUser,
        to: To,
        subject: Subject,
        html: Body,
      };
      SendGridTransporter.sendMail(MailOptions, (error, info) => {
        if (error) {
          Info = false;
        } else {
          Info = true;
        }
      });
    }

    if (Info) {
      return res.code(200).send({ status: true });
    } else {
      return res.code(500).send({ status: false });
    }
  } catch (error) {
    console.log("error-/emailsend", error);
    res.code(500).send({
      status: false,
      message: "Error Occurred",
      error: "error",
    });
  }
};

/* Bulk Issue Email */

const BulkIssueEmail = async (req, res) => {
  try {
    await GetInfo();

    const { To, Content, itemName } = req.body;

    let Template = await pool.query(
      `SELECT * FROM "EmailTemplates" where "Category" = 'Issue Bulk Mint'`
    );
    Template = Template.rows[0];

    const Logo = SettingInfo.Logo ? SettingInfo.Logo : "";

    let UserData = await pool.query(
      `Select "Email" , "UserName" from "Users" where "Email" = '${To}'`
    );
    const greet =
      UserData && UserData.rows[0].UserName
        ? UserData.rows[0].UserName
        : "User";

    const data = {
      projectName: SettingInfo.ProjectName,
      projectLogo: Logo,
      greet: greet ? greet : "User",
      Content: Content,
      itemName: itemName,
      weblink: SettingInfo.Weblink,
      twitter: SettingInfo.Twitter,
      facebook: SettingInfo.Facebook,
      linkedin: SettingInfo.Linkedin,
      pinterest: SettingInfo.Pinterest,
      youtube: SettingInfo.Youtube,
      instagram: SettingInfo.Instagram,
      copyrightYear: SettingInfo.CopyrightYear,
      contactEmail: SettingInfo.ContactEmail,
    };

    let Subject = Template.Subject;
    const CompiledTemplate = HandleBars.compile(Template.Html);
    const Body = CompiledTemplate(data);

    let Info = true;

    if (SettingInfo.EmailType == "smtp") {
      const MailOptions = {
        from: SettingInfo.SmtpUser,
        to: To,
        subject: Subject,
        html: Body,
      };
      SmtpTransporter.sendMail(MailOptions, (error, info) => {
        console.log("fgfgf", error, "info", info);
        if (error) {
          Info = false;
        } else {
          Info = true;
        }
      });
    } else {
      const MailOptions = {
        from: SettingInfo.SendGridUser,
        to: To,
        subject: Subject,
        html: Body,
      };
      SendGridTransporter.sendMail(MailOptions, (error, info) => {
        if (error) {
          Info = false;
        } else {
          Info = true;
        }
      });
    }

    if (Info) {
      return res.code(200).send({ status: true });
    } else {
      return res.code(500).send({ status: false });
    }
  } catch (error) {
    console.log("error-/emailsend", error);
    res.code(500).send({
      status: false,
      message: "Error Occurred",
      error: "error",
    });
  }
};

const BulkSuccessEmail = async (req, res) => {
  try {
    await GetInfo();

    const { To, Content } = req.body;

    let Template = await pool.query(
      `SELECT * FROM "EmailTemplates" where "Category" = 'Success Bulk Mint'`
    );
    Template = Template.rows[0];

    const Logo = SettingInfo.Logo ? SettingInfo.Logo : "";

    let UserData = await pool.query(
      `Select "Email" , "UserName" from "Users" where "Email" = '${To}'`
    );
    const greet =
      UserData && UserData.rows[0].UserName
        ? UserData.rows[0].UserName
        : "User";

    const data = {
      projectName: SettingInfo.ProjectName,
      projectLogo: Logo,
      greet: greet ? greet : "User",
      Content: Content,
      weblink: SettingInfo.Weblink,
      twitter: SettingInfo.Twitter,
      facebook: SettingInfo.Facebook,
      linkedin: SettingInfo.Linkedin,
      pinterest: SettingInfo.Pinterest,
      youtube: SettingInfo.Youtube,
      instagram: SettingInfo.Instagram,
      copyrightYear: SettingInfo.CopyrightYear,
      contactEmail: SettingInfo.ContactEmail,
    };

    let Subject = Template.Subject;
    const CompiledTemplate = HandleBars.compile(Template.Html);
    const Body = CompiledTemplate(data);

    let Info = true;

    if (SettingInfo.EmailType == "smtp") {
      const MailOptions = {
        from: SettingInfo.SmtpUser,
        to: To,
        subject: Subject,
        html: Body,
      };
      SmtpTransporter.sendMail(MailOptions, (error, info) => {
        console.log("fgfgf", error, "info", info);
        if (error) {
          Info = false;
        } else {
          Info = true;
        }
      });
    } else {
      const MailOptions = {
        from: SettingInfo.SendGridUser,
        to: To,
        subject: Subject,
        html: Body,
      };
      SendGridTransporter.sendMail(MailOptions, (error, info) => {
        if (error) {
          Info = false;
        } else {
          Info = true;
        }
      });
    }

    if (Info) {
      return res.code(200).send({ status: true });
    } else {
      return res.code(500).send({ status: false });
    }
  } catch (error) {
    console.log("error-/emailsend", error);
    res.code(500).send({
      status: false,
      message: "Error Occurred",
      error: "error",
    });
  }
};

const CSVBulkuploadSuccessEmail = async (req, res) => {
  try {
    await GetInfo();

    const { To, Content } = req.body;

    let Template = await pool.query(
      `SELECT * FROM "EmailTemplates" where "Category" = 'CSV Upload'`
    );
    Template = Template.rows[0];

    const Logo = SettingInfo.Logo ? SettingInfo.Logo : "";

    let UserData = await pool.query(
      `Select "Email" , "UserName" from "Users" where "Email" = '${To}'`
    );
    const greet =
      UserData && UserData.rows[0].UserName
        ? UserData.rows[0].UserName
        : "User";

    const data = {
      projectName: SettingInfo.ProjectName,
      projectLogo: Logo,
      greet: greet ? greet : "User",
      Content: Content,
      weblink: SettingInfo.Weblink,
      twitter: SettingInfo.Twitter,
      facebook: SettingInfo.Facebook,
      linkedin: SettingInfo.Linkedin,
      pinterest: SettingInfo.Pinterest,
      youtube: SettingInfo.Youtube,
      instagram: SettingInfo.Instagram,
      copyrightYear: SettingInfo.CopyrightYear,
      contactEmail: SettingInfo.ContactEmail,
    };

    let Subject = Template.Subject;
    const CompiledTemplate = HandleBars.compile(Template.Html);
    const Body = CompiledTemplate(data);

    let Info = true;

    if (SettingInfo.EmailType == "smtp") {
      const MailOptions = {
        from: SettingInfo.SmtpUser,
        to: To,
        subject: Subject,
        html: Body,
      };
      SmtpTransporter.sendMail(MailOptions, (error, info) => {
        console.log("fgfgf", error, "info", info);
        if (error) {
          Info = false;
        } else {
          Info = true;
        }
      });
    } else {
      const MailOptions = {
        from: SettingInfo.SendGridUser,
        to: To,
        subject: Subject,
        html: Body,
      };
      SendGridTransporter.sendMail(MailOptions, (error, info) => {
        if (error) {
          Info = false;
        } else {
          Info = true;
        }
      });
    }

    if (Info) {
      return res.code(200).send({ status: true });
    } else {
      return res.code(500).send({ status: false });
    }
  } catch (error) {
    console.log("error-/emailsend", error);
    res.code(500).send({
      status: false,
      message: "Error Occurred",
      error: "error",
    });
  }
};

const NetworkNotifyEmail = async (req, res) => {
  try {
    await GetInfo();

    const { To, Content } = req.body;

    let Template = await pool.query(
      `SELECT * FROM "EmailTemplates" where "Category" = 'Network Notify'`
    );
    Template = Template.rows[0];

    const Logo = SettingInfo.Logo ? SettingInfo.Logo : "";

    const data = {
      projectName: SettingInfo.ProjectName,
      projectLogo: Logo,
      greet: "Admin",
      Content: Content,
      weblink: SettingInfo.Weblink,
      twitter: SettingInfo.Twitter,
      facebook: SettingInfo.Facebook,
      linkedin: SettingInfo.Linkedin,
      pinterest: SettingInfo.Pinterest,
      youtube: SettingInfo.Youtube,
      instagram: SettingInfo.Instagram,
      copyrightYear: SettingInfo.CopyrightYear,
      contactEmail: SettingInfo.ContactEmail,
    };

    let Subject = Template.Subject;
    const CompiledTemplate = HandleBars.compile(Template.Html);
    const Body = CompiledTemplate(data);

    let Info = true;

    if (SettingInfo.EmailType == "smtp") {
      const MailOptions = {
        from: SettingInfo.SmtpUser,
        to: To,
        subject: Subject,
        html: Body,
      };
      SmtpTransporter.sendMail(MailOptions, (error, info) => {
        console.log("fgfgf", error, "info", info);
        if (error) {
          Info = false;
        } else {
          Info = true;
        }
      });
    } else {
      const MailOptions = {
        from: SettingInfo.SendGridUser,
        to: To,
        subject: Subject,
        html: Body,
      };
      SendGridTransporter.sendMail(MailOptions, (error, info) => {
        if (error) {
          Info = false;
        } else {
          Info = true;
        }
      });
    }

    if (Info) {
      return res.code(200).send({ status: true });
    } else {
      return res.code(500).send({ status: false });
    }
  } catch (error) {
    console.log("error-/emailsend", error);
    res.code(500).send({
      status: false,
      message: "Error Occurred",
      error: "error",
    });
  }
};

/* Forgot Password Email */

const BidInterestEmail = async (req, res) => {
  try {
    await GetInfo();

    const { To, Url } = req.body;

    let Template = await pool.query(
      `Select "Subject","Html" from "EmailTemplates" where "Category" = 'Bid Interest'`
    );
    Template = Template.rows[0];

    const Logo = SettingInfo.Logo ? SettingInfo.Logo : "";

    let UserData = await pool.query(
      `Select "Email" , "UserName" from "Users" where "Email" = '${To}'`
    );

    const greet =
      UserData && UserData.rows[0].UserName
        ? UserData.rows[0].UserName
        : "User";

    const data = {
      projectName: SettingInfo.ProjectName,
      projectLogo: Logo,
      greet: greet ? greet : "User",
      Url: Url,
      weblink: SettingInfo.Weblink,
      twitter: SettingInfo.Twitter,
      facebook: SettingInfo.Facebook,
      linkedin: SettingInfo.Linkedin,
      pinterest: SettingInfo.Pinterest,
      youtube: SettingInfo.Youtube,
      instagram: SettingInfo.Instagram,
      copyrightYear: SettingInfo.CopyrightYear,
      contactEmail: SettingInfo.ContactEmail,
    };

    let Subject = Template.Subject;
    const CompiledTemplate = HandleBars.compile(Template.Html);
    const Body = CompiledTemplate(data);

    let Info = true;

    if (SettingInfo.EmailType == "smtp") {
      const MailOptions = {
        from: SettingInfo.SmtpUser,
        to: To,
        subject: Subject,
        html: Body,
      };
      SmtpTransporter.sendMail(MailOptions, (error, info) => {
        if (error) {
          Info = false;
        } else {
          Info = true;
        }
      });
    } else {
      const MailOptions = {
        from: SettingInfo.SendGrid.User,
        to: To,
        subject: Subject,
        html: Body,
      };
      SendGridTransporter.sendMail(MailOptions, (error, info) => {
        if (error) {
          Info = false;
        } else {
          Info = true;
        }
      });
    }

    if (Info) {
      return res.code(200).send({ status: true });
    } else {
      return res.code(500).send({ status: false });
    }
  } catch (error) {
    console.log("error-/emailsend", error);
    res.code(500).send({
      status: false,
      message: "Error Occurred",
      error: "error",
    });
  }
};

const AddBidEmail = async (req, res) => {
  try {
    await GetInfo();

    const { Type, To, ItemName, Price, UserName } = req.body;

    let templateQuery = "";

    if (Type === "Bid") {
      templateQuery =
        'SELECT * FROM "EmailTemplates" WHERE "Category" = $1 LIMIT 1';
    } else if (Type === "Offer") {
      templateQuery =
        'SELECT * FROM "EmailTemplates" WHERE "Category" = $1 LIMIT 1';
    } else {
      templateQuery =
        'SELECT * FROM "EmailTemplates" WHERE "Category" = $1 LIMIT 1';
    }

    const queryParams =
      Type === "Bid"
        ? ["Bid Placed"]
        : Type === "Offer"
          ? ["Offer Placed"]
          : ["Pre Offer Placed"];
    const templateResult = await pool.query(templateQuery, queryParams);
    let Template = templateResult.rows[0];

    const Logo = SettingInfo.Logo ? SettingInfo.Logo : "";

    let UserData = await pool.query(
      `Select "Email" , "UserName" from "Users" where "Email" = '${To}'`
    );
    const greet =
      UserData && UserData.rows[0].UserName
        ? UserData.rows[0].UserName
        : "User";

    const data = {
      projectName: SettingInfo.ProjectName,
      projectLogo: Logo,
      greet: UserName,
      ItemName: ItemName,
      UserName: UserName,
      Price: Price,
      weblink: SettingInfo.Weblink,
      twitter: SettingInfo.Twitter,
      facebook: SettingInfo.Facebook,
      linkedin: SettingInfo.Linkedin,
      pinterest: SettingInfo.Pinterest,
      youtube: SettingInfo.Youtube,
      instagram: SettingInfo.Instagram,
      copyrightYear: SettingInfo.CopyrightYear,
      contactEmail: SettingInfo.ContactEmail,
    };

    let Subject = Template.Subject;
    const compiledTemplate = HandleBars.compile(Template.Html);
    const Body = compiledTemplate(data);

    let Info = true;

    if (SettingInfo.EmailType == "smtp") {
      const MailOptions = {
        from: SettingInfo.SmtpUser,
        to: To,
        subject: Subject,
        html: Body,
      };
      SmtpTransporter.sendMail(MailOptions, (error, info) => {
        console.log("fgfgf", error, "info", info);
        if (error) {
          Info = false;
        } else {
          Info = true;
        }
      });
    } else {
      const MailOptions = {
        from: SettingInfo.SendGridUser,
        to: To,
        subject: Subject,
        html: Body,
      };
      SendGridTransporter.sendMail(MailOptions, (error, info) => {
        if (error) {
          Info = false;
        } else {
          Info = true;
        }
      });
    }

    if (Info) {
      return res.code(200).send({ status: true });
    } else {
      return res.code(500).send({ status: false });
    }
  } catch (error) {
    console.log("error-/emailsend", error);
    res.code(500).send({
      status: false,
      message: "Error Occurred",
      error: "error",
    });
  }
};

const OfferExpiredEmail = async (req, res) => {
  try {
    await GetInfo();

    const { To, ItemName } = req.body;

    let Template = await pool.query(
      `SELECT * FROM "EmailTemplates" where "Category" = 'Offer Expired'`
    );
    Template = Template.rows[0];

    const Logo = SettingInfo.Logo ? SettingInfo.Logo : "";

    let UserData = await pool.query(
      `Select "Email" , "UserName" from "Users" where "Email" = '${To}'`
    );
    const greet =
      UserData && UserData.rows[0].UserName
        ? UserData.rows[0].UserName
        : "User";

    const data = {
      projectName: SettingInfo.ProjectName,
      projectLogo: Logo,
      greet: greet ? greet : "User",
      ItemName: ItemName,
      weblink: SettingInfo.Weblink,
      twitter: SettingInfo.Twitter,
      facebook: SettingInfo.Facebook,
      linkedin: SettingInfo.Linkedin,
      pinterest: SettingInfo.Pinterest,
      youtube: SettingInfo.Youtube,
      instagram: SettingInfo.Instagram,
      copyrightYear: SettingInfo.CopyrightYear,
      contactEmail: SettingInfo.ContactEmail,
    };

    let Subject = Template.Subject;
    const compiledTemplate = HandleBars.compile(Template.Html);
    const Body = compiledTemplate(data);

    let Info = true;

    if (SettingInfo.EmailType == "smtp") {
      const MailOptions = {
        from: SettingInfo.SmtpUser,
        to: To,
        subject: Subject,
        html: Body,
      };
      SmtpTransporter.sendMail(MailOptions, (error, info) => {
        console.log("fgfgf", error, "info", info);
        if (error) {
          Info = false;
        } else {
          Info = true;
        }
      });
    } else {
      const MailOptions = {
        from: SettingInfo.SendGridUser,
        to: To,
        subject: Subject,
        html: Body,
      };
      SendGridTransporter.sendMail(MailOptions, (error, info) => {
        if (error) {
          Info = false;
        } else {
          Info = true;
        }
      });
    }

    if (Info) {
      return res.code(200).send({ status: true });
    } else {
      return res.code(500).send({ status: false });
    }
  } catch (error) {
    console.log("error-/emailsend", error);
    res.code(500).send({
      status: false,
      message: "Error Occurred",
      error: "error",
    });
  }
};

const AcceptBidEmail = async (req, res) => {
  try {
    await GetInfo();

    const { Type, To, ItemName, Price } = req.body;

    let templateQuery = `SELECT * FROM "EmailTemplates" 
      WHERE "Category" = $1 LIMIT 1;`;

    const queryParams =
      Type === "Bid"
        ? ["Bid Accepted"]
        : Type === "Offer"
          ? ["Offer Accepted"]
          : ["Pre Offer Accepted"];

    const templateResult = await pool.query(templateQuery, queryParams);
    const Template = templateResult.rows[0];

    const Logo = SettingInfo.Logo ? SettingInfo.Logo : "";

    let UserData = await pool.query(
      `Select "Email" , "UserName" from "Users" where "Email" = '${To}'`
    );
    const greet =
      UserData && UserData.rows[0].UserName
        ? UserData.rows[0].UserName
        : "User";

    const data = {
      projectName: SettingInfo.ProjectName,
      projectLogo: Logo,
      greet: greet,
      ItemName: ItemName,
      Price: Price,
      weblink: SettingInfo.Weblink,
      twitter: SettingInfo.Twitter,
      facebook: SettingInfo.Facebook,
      linkedin: SettingInfo.Linkedin,
      pinterest: SettingInfo.Pinterest,
      youtube: SettingInfo.Youtube,
      instagram: SettingInfo.Instagram,
      copyrightYear: SettingInfo.CopyrightYear,
      contactEmail: SettingInfo.ContactEmail,
    };

    let Subject = Template.Subject;
    const compiledTemplate = HandleBars.compile(Template.Html);
    const Body = compiledTemplate(data);

    let Info = true;

    if (SettingInfo.EmailType == "smtp") {
      const MailOptions = {
        from: SettingInfo.SmtpUser,
        to: To,
        subject: Subject,
        html: Body,
      };
      SmtpTransporter.sendMail(MailOptions, (error, info) => {
        console.log("fgfgf", error, "info", info);
        if (error) {
          Info = false;
        } else {
          Info = true;
        }
      });
    } else {
      const MailOptions = {
        from: SettingInfo.SendGridUser,
        to: To,
        subject: Subject,
        html: Body,
      };
      SendGridTransporter.sendMail(MailOptions, (error, info) => {
        if (error) {
          Info = false;
        } else {
          Info = true;
        }
      });
    }

    if (Info) {
      return res.code(200).send({ status: true });
    } else {
      return res.code(500).send({ status: false });
    }
  } catch (error) {
    console.log("error-/emailsend", error);
    res.code(500).send({
      status: false,
      message: "Error Occurred",
      error: "error",
    });
  }
};

module.exports = {
  SendRegistrationEmail,
  ForgetPasswordEmail,
  Admin2FAEmail,
  BulkIssueEmail,
  AddBidEmail,
  BulkSuccessEmail,
  Login2FAEmail,
  NFTPurchasedEmail,
  NFTSoldEmail,
  ForgetPasswordAdminEmail,
  AccountConfirmEmail,
  RegisterCompletionEmail,
  NFTSellEmail,
  CSVBulkuploadSuccessEmail,
  BidInterestEmail,
  RegisterAdminNotifyEmail,
  AcceptBidEmail,
  OfferExpiredEmail,
  TopupNotifyEmail,
  WithdrawEmail,
  Network2FAEmail,
  NetworkNotifyEmail,
};
