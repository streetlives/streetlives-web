import { configure } from '@storybook/react';
import 'bootstrap/dist/css/bootstrap.min.css';

import '../src/index.css';

const stories = require.context('../src', true, /\.story\.(jsx|js)$/);

function loadStories() {
  stories.keys().forEach(stories);
}

configure(loadStories, module);
