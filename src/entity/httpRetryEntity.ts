export class HttpRetryEntity {
  retryFlag: boolean;
  retryCount: number;
  retryLoginOk: boolean;
  constructor() {
    this.retryFlag = false;
    this.retryCount = 0;
    this.retryLoginOk = false;
  }
}
