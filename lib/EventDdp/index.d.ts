const b = import( `EventDdp.${Meteor.isServer ? 'mjs' : 'js'}` );

import * as EventDdpServer from './EventDdp.server';

let serverMod: typeof ServerOnly;
if (Meteor.isServer) {
    serverMod = require('./top-secret');
}

if (Meteor.isServer) {
    console.log('topSecret:', serverMod.topSecret);
}