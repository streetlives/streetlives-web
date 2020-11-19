import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { getLocation } from '../../../actions';
import { selectLocationData, selectLocationError } from '../../../selectors/location';
import { getCanonicalUrl } from '../../../services/seo';
import LocationDetails from './LocationDetails';

const getCanonicalWithoutCategory = () =>
  getCanonicalUrl(window.location.href).replace(/\/find\/[^/]+\/location\//, '/find/location/');

const mapDispatchToProps = (dispatch, ownProps) => ({
  goBack: () => ownProps.history.goBack(),
  getCanonicalUrl: getCanonicalWithoutCategory,
  fetchLocation: () => dispatch(getLocation(ownProps.match.params.locationId)),
});

const mapStateToProps = (state, ownProps) => ({
  location: selectLocationData(state, ownProps),
  locationError: selectLocationError(state, ownProps),
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(LocationDetails));
