// middleware/validate.js
import { ZodError } from "zod";

export const validate = (schema) => (req, res, next) => {
  try {
    // Log the incoming data for debugging
    console.log("Validating request:", {
      body: req.body,
      params: req.params,
      query: req.query,
    });

    schema.parse({
      body: req.body,
      params: req.params,
      query: req.query,
    });

    next();
  } catch (error) {
    if (error instanceof ZodError) {
      console.error("Zod Validation Error:", error.errors);

      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: error.errors.map((err) => ({
          field: err.path.slice(1).join("."), // Remove 'body' from path
          message: err.message,
          code: err.code,
        })),
      });
    }

    console.error("Validation middleware error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong during validation",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
