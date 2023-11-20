import axios from "axios";
axios.defaults.baseURL = "http://101.132.69.151:8100/fbm-wms-rdt/";
const service = axios.create({
  headers: {
    "API-Version": "1",
    "X-Mobile-Number": "",
  },
});
export const post = (url: string, requestParam: any) => {
  return new Promise((resolve, reject) => {
    service.post(url, requestParam).then(
      (res) => {
        resolve(res.data);
      },
      (err) => {
        reject(err);
      }
    );
  });
};

export const get = (params: string, sessionID?: number) => {
  const config = {
    headers: {
      "API-Version": "1",
      "X-Mobile-Number": sessionID,
    },
  };
  return new Promise((resolve, reject) => {
    service.get(params, config).then(
      (res) => {
        resolve(res.data);
      },
      (err) => {
        reject(err);
      }
    );
  });
};
