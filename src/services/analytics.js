import mixpanel from 'mixpanel-browser';

const token = process.env.REACT_APP_MIXPANEL_TOKEN;
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
