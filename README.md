# ApiRTC-LWC-Salesforce
Integration of apiRTC in Salesforce Lightning Web Components (LWC)

This sample demonstrate how to integrate apiRTC in a LWC and use it in your Salesforce environment.

This enables you to use WebRTC to communicate from your Salesforce organisation to a Web application by using the [apiRTC](https://www.apirtc.com) platform

Our sample is based on the "Hello World" Lightning Web Component creation in a scratch orgs that you can find [here](https://developer.salesforce.com/docs/component-library/documentation/en/lwc/lwc.get_started_introduction).

You can use this reference to understand how to start your Salesforce development environment.

Then you will then find here the different necessary step to start / allow apiRTC to run in Salesforce and an LWC code sample.

We demonstrate the possibility to :
- join a conversation.
- publish your stream : audio only, video only, audio and video, in this conversation.
- share your screen in this conversation.
- record the conversation and access to the associated media files

Other apiRTC feature can also be implemented based on this tutorial.

## Steps to allow apiRTC to run in your salesforce environment

### Load apiRTC as a static ressource

You will need to download apiRTC on our [CDN](https://dev.cdn.apizee.com/apiRTC/v5.0/apiRTC-5.0.10.min.js)


<a href="https://dev.cdn.apizee.com/apiRTC/v5.0/apiRTC-5.0.10.min.js" download>Click to Download</a>


Make sure to download this apiRTC version : apiRTC-with-sio as we did some adpatation to be able in Salesforce environment.

![Load apiRTC as a static ressource!](/assets/images/static-ressources-1.png "Static ressources")

![Load apiRTC as a static ressource!](/assets/images/static-ressources-2.png "Static ressources")

