export enum ApiResponseStatus {
  SUCCESS,
  INFO,
  WARNING,
  ERROR,
}

export interface ApiResponseDto<T> {
  status: ApiResponseStatus;
  messageCode: string;
  data: T;
}
