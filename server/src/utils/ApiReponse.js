class ApiResponse {
  constructor(statusCode = 500, message = "Something went wrong", data) {
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
  }
}
export { ApiResponse };
