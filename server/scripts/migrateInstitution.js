require("dotenv").config();
const mongoose = require("mongoose");
const Institution = require("../models/Institution");

(async () => {
  await mongoose.connect(process.env.MONGO_URI);

  let ku = await Institution.findOne({ slug: "ku" });
  if (!ku) {
    ku = await Institution.create({
      name: "Khulna University Research and Innovation Center",
      shortName: "KU",
      slug: "ku",
      status: "Active",
    });
    console.log("Created institution KU:", ku._id.toString());
  }

  const db = mongoose.connection.db;
  const cols = await db.listCollections().toArray();
  for (const c of cols) {
    if (c.name === "institutions" || c.name.startsWith("system.")) continue;
    const r = await db
      .collection(c.name)
      .updateMany({ institutionId: { $exists: false } }, { $set: { institutionId: ku._id } });
    console.log(c.name, "->", r.modifiedCount, "updated");
  }

  await mongoose.disconnect();
  console.log("Done");
})();
