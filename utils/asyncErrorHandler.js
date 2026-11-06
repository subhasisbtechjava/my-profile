module.exports = (func) => {
  return (req, res, next) => {
    func(req, res, next).catch((error) => {
      console.error("[AsyncError]", error);
      next(error);
    });
  };
};
