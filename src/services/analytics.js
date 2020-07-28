import mixpanel from 'mixpanel-browser';
import config from '../config';

const token = config.mixpanelToken;
mixpanel.init(token);

const analytics = {
  identify: (id) => {
    mixpanel.identify(id);
  },
  alias: (id) => {
    mixpanel.alias(id);
  },
  track: (name, props) => {
    mixpanel.track(name, props);
  },
  people: {
    set: (props) => {
      mixpanel.people.set(props);
    },
  },
};

export default analytics;
