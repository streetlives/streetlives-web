import { fetchUserAttributes } from 'aws-amplify/auth';

const checkContact = changeState => fetchUserAttributes()
  .then((attributes) => {
    const hasUnverifiedContact = (
      (attributes.email && attributes.email_verified !== 'true')
      || (attributes.phone_number && attributes.phone_number_verified !== 'true')
    );

    changeState(hasUnverifiedContact ? 'verifyContact' : 'signedIn');
  })
  .catch(() => changeState('signedIn'));

export default checkContact;
