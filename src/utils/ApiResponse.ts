export class ApiResponse {
  public statusCode: number;
  public data: any;
  public success: boolean;
  public message: string;

  constructor(statusCode: number, data: any, message: string = "Success") {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400;
  }
}