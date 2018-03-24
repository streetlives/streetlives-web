import { configure } from "@storybook/react";

const stories = require.context("../src", true, /\.story\.(jsx|js)$/);

function loadStories() {
  stories.keys().forEach(stories);
}

configure(loadStories, module);
