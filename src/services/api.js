import axios from "axios";
import Amplify from 'aws-amplify';

const baseUrl = 'https://w6pkliozjh.execute-api.us-east-1.amazonaws.com/prod';

export const getLocations = ({ latitude, longitude, radius, searchString }) =>
  Amplify.Auth.currentAuthenticatedUser().then((user) => {
    const idJwtToken = user.signInUserSession.getIdToken().getJwtToken();

    return axios.request({
        url : `${baseUrl}/locations`,
        method : 'get',
        params: { latitude, longitude, radius, searchString },
        headers : {
          Authorization : idJwtToken
        }
      })
      .then((result) => result.data);
  });
