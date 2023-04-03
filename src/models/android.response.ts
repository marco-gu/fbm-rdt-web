export enum AndroidResponseStatus {
  SUCCESS = "SUCCESS",
  INFO = "INFO",
  WARNING = "WARNING",
  ERROR = "ERROR",
}

export interface AndroidResponse<T> {
  status: AndroidResponseStatus;
  messageCode: string;
  data: T;
}
