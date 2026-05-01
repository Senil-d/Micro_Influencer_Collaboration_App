export const errorHandler = (err, req, res, next) => {
  const statusCode =
    err.statusCode || (res.statusCode !== 200 ? res.statusCode : 500);

  console.error(err); // swap with a real logger in production

  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};
