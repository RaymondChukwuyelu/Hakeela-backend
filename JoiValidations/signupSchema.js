const Joi = require("joi");

const signupSchema = Joi.object({
  email: Joi.string().email().required().lowercase().trim(),
  password: Joi.string().min(6).required(),

  profile: Joi.object({
    fullName: Joi.string().required(),
    gender: Joi.string().allow("", null),
    phoneNumber: Joi.string().allow("", null),

    country: Joi.string().allow("", null).default("Nigeria"),

    referralSource: Joi.string().allow("", null),
    lowIncomeBackground: Joi.string().allow("", null),
    specialNeeds: Joi.string().allow("", null),
    specialNeedsDetails: Joi.string().allow("", null),
  }).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required().lowercase().trim(),
  password: Joi.string().min(6).required(),
})
module.exports = signupSchema;