import axios from "axios";

const callApi = async (apiConfig: any) => {
  let apiUrl = apiConfig.url;
  let apiRequest = apiConfig.request;
  let headers = apiConfig.headers;
  let apiStatusId = 0;
  let response = {};
  let result;
  const apiResponse = await axios
    .post(apiUrl, apiRequest, { headers })
    .then((resp) => {
      apiStatusId = 1;
      result = Object.assign(response, {
        apiStatusId: apiStatusId,
        result: resp.data,
      });
      return result;
    })
    .catch((error) => {
      apiStatusId = 2;
      result = Object.assign(response, {
        apiStatusId: apiStatusId,
        result: error.response.data,
      });
      return result;
    });
  return apiResponse;
};

export default callApi;
