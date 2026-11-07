export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: { field: string; message: string }[]
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}
