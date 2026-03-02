export class FSOperationError extends Error {
  constructor(message = "FS operation failed") {
    super(message);
  }
}
