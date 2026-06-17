const unitTestRun = process.argv.some(arg => arg.includes('src/utils'));

if (!unitTestRun) {
  // eslint-disable-next-line global-require
  const { configure } = require('enzyme');
  // eslint-disable-next-line global-require
  const Adapter = require('enzyme-adapter-react-16');

  configure({ adapter: new Adapter() });
}
