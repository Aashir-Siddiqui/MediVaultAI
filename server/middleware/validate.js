// middleware/validate.js - ULTRA FIX
import { ZodError } from "zod";

export const validate = (schema) => (req, res, next) => {
  try {
    // Parse and validate
    const parsed = schema.parse({
      body: req.body || {},
      params: req.params || {},
      query: req.query || {},
    });

    // FIXED: Only update body, don't touch params and query
    req.body = parsed.body || {};
    // Don't overwrite req.params and req.query as they're read-only in Express

    next();
  } catch (error) {
    if (error instanceof ZodError) {
      console.error("❌ Validation Error:", error.errors);

      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: error.errors.map((err) => ({
          field: err.path.slice(1).join("."),
          message: err.message,
        })),
      });
    }

    console.error("❌ Middleware error:", error);
    return res.status(500).json({
      success: false,
      message: "Validation error",
    });
  }
};
