import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { getLocation } from '../../../actions';
import { selectLocationData, selectLocationError } from '../../../selectors/location';
import LocationDetails from './LocationDetails';

const mapDispatchToProps = (dispatch, ownProps) => ({
  goBack: () => ownProps.history.goBack(),
  fetchLocation: () => dispatch(getLocation(ownProps.match.params.locationId)),
});

const mapStateToProps = (state, ownProps) => ({
  location: selectLocationData(state, ownProps),
  locationError: selectLocationError(state, ownProps),
  searchCategory: ownProps.match.params.categoryName,
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(LocationDetails));
