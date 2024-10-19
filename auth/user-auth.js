let database = require("../config/database/connection");
let collections = require("../config/database/collection");
let joi = require("joi");
let bcrypt = require("bcrypt");
let ObjectId = require("mongodb").ObjectId;

module.exports.Auth = {
  doSignUP: function (userData) {
    return new Promise(async (resolve, reject) => {
      let userCredential = {
        username: null,
        email: null,
        dob: null,
        password: null,
        terms_and_condition: null,
        data: function (userInfo) {
          const { username, email, bday_day, bday_month, bday_year, password, terms_and_condition } = userInfo;
          this.username = username ? username : null;
          this.email = email ? email : null;
          this.dob = bday_day && bday_month && bday_year ? bday_year + "-" + bday_month + "-" + bday_day : null;
          this.password = password ? password : null;
          this.terms_and_condition = terms_and_condition ? terms_and_condition : nul;
        },
      };

      userCredential.data(userData);

      const schema = joi.object().keys({
        email: joi
          .string()
          .email()
          .messages({
            "string.base": "Email must be a string.",
            "string.empty": "Email cannot be empty.",
            "string.email": "Email must be a valid email address.",
            "any.required": "Email is required.",
          })
          .required(),
        username: joi
          .string()
          .pattern(/^[a-zA-Z0-9\s]+$/)
          .min(4)
          .max(30)
          .messages({
            "string.base": "Username must be a string.",
            "string.empty": "Username cannot be empty.",
            "string.min": "Username must have at least {#limit} characters.",
            "string.max": "Username cannot exceed {#limit} characters.",
            "string.pattern.base": "Username can only contain letters (a-z, A-Z), digits (0-9), and spaces.",
          })
          .required(),
        dob: joi
          .string()
          .isoDate()
          .messages({
            "string.base": "DOB must be a string",
            "string.pattern.base": 'Date of birth must be in the format "YYYY-MM-DD".',
          })
          .required(),
        terms_and_condition: joi.string().required(),
        password: joi
          .string()
          .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
          .messages({
            "string.base": "Password must be a string.",
            "string.empty": "Password cannot be empty.",
            "string.pattern.base": "Password must contain at least one uppercase letter, lowercase letter, one digit, and one special character.",
            "any.required": "Password is required.",
          })
          .required(),
      });

      const isUserInputValid = schema.validate({
        username: userCredential.username,
        email: userCredential.email,
        dob: userCredential.dob,
        password: userCredential.password,
        terms_and_condition: userCredential.terms_and_condition,
      });

      if (isUserInputValid.error) {
        // Handle validation errors
        reject(isUserInputValid.error.details[0].message);
      } else {
        // Input is valid
        let email = await database.fetch().collection(collections.USER_COLLECTION).findOne({ email: userCredential.email });
        if (email) {
          reject("This email already create an account!");
        } else {
          userCredential.password = await bcrypt.hash(userCredential.password, 10);
          userCredential.createAt = new Date();
          database
            .fetch()
            .collection(collections.USER_COLLECTION)
            .insertOne({
              username: userCredential.username,
              email: userCredential.email,
              dob: userCredential.dob,
              password: userCredential.password,
              role: "user",
              terms_and_condition: userCredential.terms_and_condition,
              createAt: new Date(),
            })
            .then((data) => {
              resolve("Account Created.");
            })
            .catch((err) => {
              reject("Account not created please try again!");
            });
        }
      }
    });
  }, //end user singup
  doLogin(userData) {
    return new Promise(async (resolve, reject) => {
      let userCredential = {
        email: userData.email ? userData.email : null,
        password: userData.password ? userData.password : null,
      };

      const schema = joi.object().keys({
        email: joi
          .string()
          .email()
          .messages({
            "string.base": "Email must be a string.",
            "string.empty": "Email cannot be empty.",
            "string.email": "Email must be a valid email address.",
            "any.required": "Email is required.",
          })
          .required(),
        password: joi
          .string()
          .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
          .messages({
            "string.base": "Password must be a string.",
            "string.empty": "Password cannot be empty.",
            "string.pattern.base": "Password must contain at least one uppercase letter, lowercase letter, one digit, and one special character.",
            "any.required": "Password is required.",
          })
          .required(),
      });

      const isUserInputValid = schema.validate(userCredential);

      if (isUserInputValid.error) {
        reject(isUserInputValid.error.details[0].message);
      } else {
        try {
          let resDB = await database.fetch().collection(collections.USER_COLLECTION).findOne({ email: userCredential.email });
          if (resDB) {
            let status = await bcrypt.compare(userCredential.password, resDB.password);
            if (status) {
              resolve({
                username: resDB.username,
                email: resDB.email,
                dob: resDB.dob,
                role: resDB.role,
                createAt: resDB.createAt,
              });
            } else {
              reject("invalid credentials!");
            }
          } else {
            reject("invalid credentials!");
          }
        } catch (err) {
          reject("something went wrong please try again!");
        }
      }
    });
  }, //end user login
  changePassword(email, code) {
    return new Promise((resolve, reject) => {
      if (email && code) {
        console.log(email, code);
      } else if (email) {
        let schema = joi.object().keys({
          email: joi.string().email().messages({
            "string.base": "Email must be a string.",
            "string.empty": "Email cannot be empty.",
            "string.email": "Email must be a valid email address.",
            "any.required": "Email is required.",
          }).required()
        })

        let isEmailValid = schema.validate({email})

        if(isEmailValid.error){
          reject(isEmailValid.error.details[0].message)
        }
        else{
          database.fetch().collection(collections.USER_COLLECTION).findOne({email: email}).then(data => {
            if(data){
              resolve(true)
            }
            else{
              reject('email not found!')
            }
          })
          .catch(err =>{
            reject('something went wrong please try again!')
          })
        }
      } else {
        reject("please enter the email address");
      }
    });
  }, //end change password
  doAdminLogin(adminData) {
    return new Promise(async (resolve, reject) => {
      let email = adminData.email ? adminData.email : null;
      let password = adminData.password ? adminData.password : null;
      let adminCredential = {
        email: email,
        password: password,
      };

      if (email && password) {
        //creating schema for input validation
        let schema = joi.object().keys({
          email: joi
            .string()
            .email()
            .messages({
              "string.base": "Email must be a string.",
              "string.empty": "Email cannot be empty.",
              "string.email": "Email must be a valid email address.",
              "any.required": "Email is required.",
            })
            .required(),
          password: joi
            .string()
            .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
            .messages({
              "string.base": "Password must be a string.",
              "string.empty": "Password cannot be empty.",
              "string.pattern.base": "Password must contain at least one uppercase letter, lowercase letter, one digit, and one special character.",
              "any.required": "Password is required.",
            })
            .required(),
        });

        const isAdminInputValid = schema.validate(adminCredential);
        if (isAdminInputValid.error) {
          reject(isAdminInputValid.error.details[0].message);
        } else {
          database
            .fetch()
            .collection(collections.ADMIN_COLLECTION)
            .findOne({ "adminCredential.email": adminCredential.email })
            .then((data) => {
              if (data) {
                bcrypt.compare(adminCredential.password, data.adminCredential.password, (err, login_status) => {
                  if (err) reject("invalid credential!");

                  if (login_status) {
                    resolve(data.adminCredential.email);
                  } else {
                    reject("invalid credential!");
                  }
                });
              } else {
                reject("invalid credential!");
              }
            })
            .catch((err) => {
              reject("something went wrong!");
            });
        }
      } else {
        reject("invalid credential!");
      }
    });
  }, //End adminlogin
  doChangeAdminDefault(adminData) {
    return new Promise((resolve, reject) => {
      let adminCredential = {
        email: adminData.email ? adminData.email : null,
        currentPassword: adminData.current_password ? adminData.current_password : null,
        newPassword: adminData.new_password ? adminData.new_password : null,
      };

      //creating schema for input validation
      let schema = joi.object().keys({
        email: joi
          .string()
          .email()
          .messages({
            "string.base": "Email must be a string.",
            "string.empty": "Email cannot be empty.",
            "string.email": "Email must be a valid email address.",
            "any.required": "Email is required.",
          })
          .required(),
        currentPassword: joi
          .string()
          .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
          .messages({
            "string.base": "Password must be a string.",
            "string.empty": "Password cannot be empty.",
            "string.pattern.base": "Password must contain at least one uppercase letter, lowercase letter, one digit, and one special character.",
            "any.required": "Password is required.",
          })
          .required(),
        newPassword: joi
          .string()
          .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
          .messages({
            "string.base": "Password must be a string.",
            "string.empty": "Password cannot be empty.",
            "string.pattern.base": "Password must contain at least one uppercase letter, lowercase letter, one digit, and one special character.",
            "any.required": "Password is required.",
          })
          .required(),
      });

      let isAdminInputValid = schema.validate(adminCredential);
      if (isAdminInputValid.error) {
        reject(isAdminInputValid.error.details[0].message);
      } else {
        database
          .fetch()
          .collection(collections.ADMIN_COLLECTION)
          .findOne({ "adminCredential.email": adminCredential.email })
          .then(async (data) => {
            let password = await bcrypt.compare(adminCredential.currentPassword, data.adminCredential.password);

            // database.fetch().collection(collections.ADMIN_COLLECTION).updateOne()
          })
          .catch((err) => {
            reject("something went wrong!");
          });
      }
    });
  },
};
