const errorHandler = (err, res, req, next) => {
  let { statusCode = 500, message = "Something went wrong" } = err;
  res.status(statusCode).send(message);
};
export { errorHandler };
