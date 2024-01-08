import { EngineRequset } from "@/entity/request.entity";
import axios from "axios";
import _ from "lodash";
axios.defaults.baseURL = process.env.VUE_APP_BASE_URL;
const service = axios.create({
  headers: {
    "API-Version": "2",
  },
});
export const post = (request: EngineRequset) => {
  request.countryAbbreviatedName = localStorage.getItem("country") as string;
  const prefix = process.env.VUE_APP_PREFIX_URL;
  if (_.isUndefined(request.sessionId)) {
    request.sessionId = localStorage.getItem("sessionId") as string;
  }
  return new Promise((resolve, reject) => {
    service.post(prefix, request).then(
      (res) => {
        localStorage.setItem("sessionId", res.data.sessionId);
        resolve(res.data);
      },
      (err) => {
        reject(err);
      }
    );
  });
};

export const get = (params: string) => {
  const config = {};
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
