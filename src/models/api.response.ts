export interface ApiResponseDto<T> {
  statusCode: number;
  errorMessage: string;
  data: T
}
