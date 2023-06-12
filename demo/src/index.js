import * as mixpanel from '@0no-co/mixpanel-micro';

mixpanel.init('e4d3920c4225b591b21a375de593bc32');

mixpanel.track('test', {
  testParam: 'test',
});
