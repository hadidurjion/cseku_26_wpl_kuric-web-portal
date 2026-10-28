const mongoose = require("mongoose");

const institutionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    shortName: { type: String, required: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    logo: { type: String, default: "" },
    primaryColor: { type: String, default: "#0E6E5C" },
    accentColor: { type: String, default: "#C89B3C" },
    tagline: { type: String, default: "" },
    directorEmail: { type: String, default: "" },
    status: { type: String, enum: ["Pending", "Active", "Suspended", "Rejected"], default: "Pending" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Institution", institutionSchema);
