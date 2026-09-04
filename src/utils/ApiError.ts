export class ApiError {
  public statusCode: number;
  public data: any;
  public message: string;
  public success: boolean;

  constructor(statusCode: number, message: string = "Something went wrong", data: any = null) {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = false;
  }
}