import axios from "axios";
axios.defaults.baseURL = process.env.VUE_APP_BASE_URL;
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

export const get = (params: string) => {
  return new Promise((resolve, reject) => {
    service.get(params).then(
      (res) => {
        resolve(res.data);
      },
      (err) => {
        reject(err);
      }
    );
  });
};
