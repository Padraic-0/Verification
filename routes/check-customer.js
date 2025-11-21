// routes/check-customer.js
const express = require("express");
const router = express.Router();
const { getCustomerByEmail } = require("../utils/shopify");

router.post("/", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ allowed: false, message: "Missing email" });

    const customer = await getCustomerByEmail(email);

    if (!customer) {
      return res.json({
        allowed: false,
        message: "No account found. You must apply first.",
      });
    }

    // Example tags: ["pending-verification"], ["verified"], etc.
    const tags = customer.tags || [];

    if (tags.includes("pending-verification")) {
      return res.json({
        allowed: false,
        message: "Your account is awaiting approval.",
      });
    }

    if (!tags.includes("verified")) {
      return res.json({
        allowed: false,
        message: "Your account is not approved.",
      });
    }

    // All good → allow login
    return res.json({ allowed: true });
  } catch (err) {
    console.error("check-customer error:", err);
    return res.status(500).json({ allowed: false, message: "Server error" });
  }
});

module.exports = router;

