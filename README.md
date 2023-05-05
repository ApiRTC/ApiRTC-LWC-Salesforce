# ApiRTC-LWC-Salesforce
Integration of apiRTC in Salesforce Lightning Web Components (LWC)

This sample demonstrate how to integrate apiRTC in a LWC and use it in your Salesforce environment.

This enables you to use WebRTC to communicate from your Salesforce organisation to a Web application by using [apiRTC](https://www.apirtc.com) platform.

We demonstrate the possibility to :
- Join a conversation.
- Publish your stream : audio only, video only, audio and video, in this conversation.
- Share your screen in this conversation.
- Record the conversation and access to the associated media files

Other apiRTC feature can also be implemented based on this tutorial.

Our sample is based on the "Hello World" Lightning Web Component creation in a scratch orgs documentation that you can find [here](https://developer.salesforce.com/docs/component-library/documentation/en/lwc/lwc.get_started_sfdx_hello_world).

You can use this reference to understand how to start your Salesforce development environment until the "Create a Lightning Web Component" step.

Then you will then find here the different necessary steps to start and allow apiRTC to run in Salesforce and use our LWC code sample.

## Steps to allow apiRTC to run in your Salesforce environment

### Load apiRTC as a static ressource

You will need to download apiRTC on our [CDN](https://dev.cdn.apizee.com/apiRTC/apiRTC-with-sio.min.js) (Use "Save as")

> **_NOTE:_**  Make sure to download this apiRTC version : apiRTC-with-sio as we did some adaptations to be able to run in Salesforce environment.

Then search for "static" in Salesforce to add apiRTC :

Load the apiRTC file as "apirtcsio" : this name is used in the source code for import :

```
import apiCC from "@salesforce/resourceUrl/apirtcsio";
```

![Load apiRTC as a static ressource!](/assets/images/static-ressources-1.png "Static ressources")

![Load apiRTC as a static ressource!](/assets/images/static-ressources-2.png "Static ressources")

### Add necessary apiRTC server URLs as CSP Trusted site

We need to add three URLs in the configuration:
- *.apizee.com : for access to our dashboard
- https://ccs6.apizee.com for https access to our Call Control Server
- wss://ccs6.apizee.com for wss access to our Call Control Server

Search for "trusted" in salesforce and apply the following configuration :

![apiRTC trusted sites!](/assets/images/trusted-sites.png "Trusted Sites")

### Make sure that Lightning Web Security is activated

Lightning Web security is required to enable a correct access to WebRTC features

![Lightning Web Security!](/assets/images/session-settings.png "Lightning Web Security")

## You are ready to load our LWC sample code in your Salesforce environement

Get the code with :

> git clone https://github.com/ApiRTC/ApiRTC-LWC-Salesforce.git

Use our component source code in the force-app/main/default/lwc folder instead of "Create Lightning web components" step in [documentation](https://developer.salesforce.com/docs/component-library/documentation/en/lwc/lwc.get_started_sfdx_hello_world).

You can then continue with [Salesforce documentation steps](https://developer.salesforce.com/docs/component-library/documentation/en/lwc/lwc.get_started_sfdx_hello_world).

- Push Source to the Scratch Org
- Open the Scratch Org
- Add the Component to a Lightning Page

## Start an apiRTC conversation

Our sample use our demo apiKey : myDemoApiKey

```
this.ua = new this.apiRTC.UserAgent({

    //==============================
    // TODO Change with your apiKey
    //==============================
    uri: 'apzkey:myDemoApiKey'
});
```

With this apiKey, you can use our [conferencing tutorial](https://apizee.github.io/ApiRTC-examples/conferencing_mute_screen/) for a first try.

Create your own count [here](https://cloud.apirtc.com/register)

## Some apiRTC restrictions in Salesforce environment

Some apiRTC feature are not available in Salesforce due to LWC restrictions.
Check [locker API viewer](https://developer.salesforce.com/docs/component-library/tools/locker-service-viewer) for more information.

- Background subtraction : blur, background image - applyVideoProcessor() is not available in LWC 

Worker is not supported in LWC

- Audio filters : noiseReduction - ApplyAudioProcessor() is not available in LWC 

Worklet / AudioWorklet / AudioWorkletNode are not supported in LWC

## Some development information

As you will see in our source code sample usage of loadScript() is mandatory to load library in LWC :

You can find informations about it on [Platform Resource Loader](https://developer.salesforce.com/docs/component-library/bundle/lightning-platform-resource-loader/documentation)
and [Use Third-Party JavaScript Libraries](https://developer.salesforce.com/docs/component-library/documentation/en/lwc/lwc.js_third_party_library)

```
loadScript(this, apiCC).then(() => {

    this.apiRTCisLoaded = true;
    this.apiRTC = window.apiRTC;
    console.debug('apiRTC version :', apiRTC.version);
    let apiRTCInfoElt = this.template.querySelector(".apiRTCInfo");
    apiRTCInfoElt.replaceWith('You are using apiRTC version : ' + apiRTC.version);
    this.apiRTC.setLogLevel(10);

}).catch(err => {
    console.error('Error when loading ApiRTC :', err)
});
```
