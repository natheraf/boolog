const { bodyMissingRequiredFields } = require("../middleware/utils");

exports.addMultiple = (req, res) => {
  const userRequiredBody = ["data"];
  const missing = bodyMissingRequiredFields(req, userRequiredBody);
  if (missing) {
    return res?.status(400).send(missing);
  }
  const data = JSON.parse(req.body.data);
  if (Array.isArray(data) === false) {
    return res?.status(400).send({ message: "data is not array" });
  }
  const entryErrors = [];
  for (const entry of data) {
    if (
      entry.hasOwnProperty("shelves") === false ||
      Array.isArray(entry.shelves) === false
    ) {
      entryErrors.push({
        entry,
        error: "missing shelves property or is not array",
      });
      continue;
    }
  }
};
