const arrayToComplexListString = (array) => {
  return array.length <= 2
    ? array.join(" and ")
    : array.slice(0, array.length - 1).join(", ") +
        ", and " +
        array[array.length - 1];
};

const bodyMissingRequiredFields = (req, requiredBody) => {
  const missing = [];
  requiredBody.forEach((key) => {
    if (
      req.body[key] === undefined ||
      (typeof req.body[key] === "string" && req.body[key].length === 0)
    )
      missing.push(key);
  });
  if (missing.length > 0) {
    return {
      message: arrayToComplexListString(missing) + " cannot be empty",
    };
  }
  return false;
};

const urlParamsMissingRequiredFields = (req, requiredBody) => {
  const missing = [];
  requiredBody.forEach((key) => {
    if (
      req.params[key] === undefined ||
      (typeof req.params[key] === "string" && req.params[key].length === 0)
    )
      missing.push(key);
  });
  if (missing.length > 0) {
    return {
      message: arrayToComplexListString(missing) + " cannot be empty",
    };
  }
  return false;
};

const urlQueryMissingRequiredFields = (req, requiredBody) => {
  const missing = [];
  requiredBody.forEach((key) => {
    if (
      req.query[key] === undefined ||
      (typeof req.query[key] === "string" && req.query[key].length === 0)
    )
      missing.push(key);
  });
  if (missing.length > 0) {
    return {
      message: arrayToComplexListString(missing) + " cannot be empty",
    };
  }
  return false;
};

const generateRandomCode = (numOfBytes) =>
  require("crypto").randomBytes(numOfBytes).toString("base64url");

module.exports = {
  arrayToComplexListString,
  bodyMissingRequiredFields,
  urlParamsMissingRequiredFields,
  urlQueryMissingRequiredFields,
  generateRandomCode,
};
