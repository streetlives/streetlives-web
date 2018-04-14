import axios from "axios";
import Amplify from 'aws-amplify';
import urls from "../constants/urls";

export const getLocations = ({ latitude, longitude, radius, searchString }) =>
  Amplify.Auth.currentAuthenticatedUser().then((user) => {
    const idJwtToken = user.signInUserSession.getIdToken().getJwtToken();

    return axios.request({
        url : `${urls.baseApi}/locations`,
        method : 'get',
        params: { latitude, longitude, radius, searchString },
        headers : {
          Authorization : idJwtToken
        }
      })
      .then((result) => result.data);
  });
