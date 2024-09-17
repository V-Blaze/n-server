import { body } from "../utils/validationUtils";

export const registerValidation = [
  body("username")
    .isString()
    .isLength({ min: 3, max: 20 })
    .withMessage("Username must be between 3 and 20 characters long.")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage(
      "Username can only contain letters, numbers, and underscores."
    ),
  body("password")
    .isString()
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long."),
];

export const loginValidation = [
  body("username").isString().notEmpty().withMessage("Username is required."),
  body("password").isString().notEmpty().withMessage("Password is required."),
];
