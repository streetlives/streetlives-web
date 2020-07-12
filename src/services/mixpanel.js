import mixpanel from 'mixpanel-browser';

const mixpanelToken = process.env.REACT_APP_MIXPANEL_TOKEN;
mixpanel.init(mixpanelToken);

const Mixpanel = {
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

export default Mixpanel;
