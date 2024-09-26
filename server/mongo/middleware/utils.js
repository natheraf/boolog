const bodyMissingRequiredFields = (req, requiredBody) => {
  const missing = [];
  requiredBody.forEach((key) => {
    if (req.body[key] === undefined) missing.push(key);
  });
  if (missing.length > 0) {
    return {
      message:
        (missing.length <= 2
          ? missing.join(" and ")
          : missing.slice(0, missing.length - 1).join(", ") +
            ", and " +
            missing[missing.length - 1]) + " cannot be empty",
    };
  }
  return false;
};

module.exports = {
  bodyMissingRequiredFields,
};
