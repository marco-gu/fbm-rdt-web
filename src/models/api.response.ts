export enum ApiResponseStatus {
  SUCCESS = "SUCCESS",
  INFO = "INFO",
  WARNING = "WARNING",
  ERROR = "ERROR",
}

export interface ApiResponseDto<T> {
  status: ApiResponseStatus;
  messageCode: string;
  data: T;
}
