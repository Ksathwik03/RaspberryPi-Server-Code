const v3 = require('node-hue-api').v3
  , discovery = v3.discovery
  , hueApi = v3.api 
;
const LightState = v3.lightStates.LightState;

const appName = 'node-hue-api';
const deviceName = 'example-code';

// async function discoverBridge() {
//   const discoveryResults = await discovery.nupnpSearch();

//   if (discoveryResults.length === 0) {
//     console.error('Failed to resolve any Hue Bridges');
//     return null;
//   } else {
//     // Ignoring that you could have more than one Hue Bridge on a network as this is unlikely in 99.9% of users situations
//     return discoveryResults[0].ipaddress;
//   }
// }

const discoverAndCreateUser = async () => {
  const ipAddress =  "192.168.1.103";

  // Create an unauthenticated instance of the Hue API so that we can create a new user
  const unauthenticatedApi = await hueApi.createLocal(ipAddress).connect();
  
  let createdUser;
  try {
    createdUser = await unauthenticatedApi.users.createUser(appName, deviceName);
    console.log('*******************************************************************************\n');
    console.log('User has been created on the Hue Bridge. The following username can be used to\n' +
                'authenticate with the Bridge and provide full local access to the Hue Bridge.\n' +
                'YOU SHOULD TREAT THIS LIKE A PASSWORD\n');
    console.log(`Hue Bridge User: ${createdUser.username}`);
    console.log(`Hue Bridge User Client Key: ${createdUser.clientkey}`);
    console.log('*******************************************************************************\n');

    // Create a new API instance that is authenticated with the new user we created
    const authenticatedApi = await hueApi.createLocal(ipAddress).connect(createdUser.username).then(api => {
      // Using a LightState object to build the desired state
      const state = new LightState()
        .on()
        .ct(200)
        .brightness(100)
      ;      
      return api.lights.setLightState(LIGHT_ID, state);
    })
    .then(result => {
      console.log(`Light state change was successful? ${result}`);
    })
  ;

    // Do something with the authenticated user/api
    const bridgeConfig = await authenticatedApi.configuration.getConfiguration();
    console.log(`Connected to Hue Bridge: ${bridgeConfig.name} :: ${bridgeConfig.ipaddress}`);

  } catch(err) {
    // if (err.getHueErrorType() === 101) {
    //   console.error('The Link button on the bridge was not pressed. Please press the Link button and try again.');
    // } else {
      console.error(`Unexpected Error: ${err.message}`);
    // }
  }
}

// Invoke the discovery and create user code
module.exports = {
    discoverAndCreateUser
}