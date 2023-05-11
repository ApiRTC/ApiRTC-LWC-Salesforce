import { LightningElement, api, track } from 'lwc';
import { loadScript } from "lightning/platformResourceLoader";
import apiCC from "@salesforce/resourceUrl/apirtcsio";

export default class HelloWorld extends LightningElement {
    @api name;

    @api
    get hasConversation() {
      return this.connectedConversation !== null;
    }

    @track microIsActivate = true;
    @track cameraIsActivate = true;
    @track recordIsActivate = false;

    ua = null;
    apiRTC = null;
    connectedSession = null;  
    connectedConversation = null;
    publishedStream = null;
    screensharingStream = null;
    conversationName = '';

    apiRTCisLoaded = false;

    start() {

        console.log("Hello ApiRTC start ! Conversation :", this.conversationName);

        if (this.conversationName === '') {
            console.error("Need to enter a conversation name");
            return;
        }
        
        if (this.apiRTCisLoaded === false ) {
            loadScript(this, apiCC).then(() => {

                this.apiRTCisLoaded = true;
                this.apiRTC = window.apiRTC;
                console.debug('apiRTC version :', apiRTC.version);
                let apiRTCInfoElt = this.template.querySelector(".apiRTCInfo");
                apiRTCInfoElt.replaceWith('You are using apiRTC version : ' + apiRTC.version);
                this.apiRTC.setLogLevel(10);

                this.joinConference(this.conversationName);

            }).catch(err => {
                console.error('Error when loading ApiRTC :', err)
            });

        } else {
            //apiRTC is already loaded
            this.joinConference(this.conversationName);
        }
    }

    joinConference(confname) {

        console.log("JoinConference");

        var cloudUrl = 'https://cloud.apizee.com';

        //==============================
        // 1/ CREATE USER AGENT
        //==============================
        this.ua = new this.apiRTC.UserAgent({

            //==============================
            // TODO Change with your apiKey
            //==============================
            uri: 'apzkey:myDemoApiKey'
        });

        //==============================
        // 2/ REGISTER
        //==============================
        this.ua.register({
            cloudUrl: cloudUrl
        }).then((session) => {

            console.log("register OK");
            // Save session
            this.connectedSession = session;

            //==============================
            // 3/ CREATE CONVERSATION
            //==============================
            this.connectedConversation = this.connectedSession.getOrCreateConversation(confname);

            //==========================================================
            // 4/ ADD EVENT LISTENER : WHEN NEW STREAM IS AVAILABLE IN CONVERSATION
            //==========================================================
            this.connectedConversation.on('streamListChanged', (streamInfo) => {

                console.debug("streamListChanged :", streamInfo);

                if (streamInfo.listEventType === 'added') {
                    if (streamInfo.isRemote === true) {
                        this.connectedConversation.subscribeToMedia(streamInfo.streamId)
                            .then( (stream) => {
                                console.log('subscribeToMedia success');
                            }).catch( (err) => {
                                console.error('subscribeToMedia error', err);
                            });
                    }
                }
            });

            //=====================================================
            // 4 BIS/ ADD EVENT LISTENER : WHEN STREAM IS ADDED/REMOVED FROM THE CONVERSATION
            //=====================================================
            this.connectedConversation.on('streamAdded', (stream) => {
                console.debug("StreamAdded");
                this.displayStreamInContainer('remote', stream);
            }).on('streamRemoved', (stream) => {
                console.debug("streamRemoved");
                this.removeStreamFromContainer('remote', stream);
            }).on('recordingAvailable', (recordingInfo) => {
                console.log('recordingInfo :', recordingInfo);
                console.log('recordingInfo.mediaURL :', recordingInfo.mediaURL);
                let recordingInfoElt = this.template.querySelector(".recordingInfo");
                recordingInfoElt.replaceWith('Your recording is available here: ' + recordingInfo.mediaURL);
            });

            //==============================
            // 5/ JOIN CONVERSATION
            //==============================
            this.connectedConversation.join()
                .then((response) => {
                    console.log('Conversation is joined');

                    let convInfoElt = this.template.querySelector(".convInfo");
                    convInfoElt.replaceWith('You are connected in conversation : ' + this.connectedConversation.getName());

                    //===================================
                    // 6/ CREATE OWN STREAM AND PUBLISH
                    //===================================
                    this.managePublishWithMicAndCameraState();

                }).catch((err) => {
                    console.error('Conversation join error', err);
                });
        });
    }

    createStreamAndPublish(type) {

        console.log("createStreamAndPublish with type :", type)

        var createStreamOptions = {};

        createStreamOptions.constraints = {
            audio: true,
            video: true
        };
        if (type === 'audio') {
            createStreamOptions.constraints.video = false;
        }
        if (type === 'videoOnly') {
            createStreamOptions.constraints.audio = false;
        }

        this.ua.createStream(createStreamOptions)
            .then((stream) => {

                console.log('createStream :', stream);
                let call = null;

                if (this.publishedStream !== null) {
                    call = this.connectedConversation.getConversationCall(this.publishedStream);
                    console.debug('call :', call);
                }

                if (call !== null) {

                    let callbacks = {};
                    callbacks.getStream = () => {
                        return new Promise((resolve, reject) => {
                             return resolve(stream);
                        });
                    };

                    //==============================
                    // 7/ REPLACE STREAM IF THERE IS A PUBLISH
                    //==============================
                    //Replace stream if call is ongoing
                    call.replacePublishedStream(null, callbacks)
                        .then( (stream) => {
                            console.debug('replacePublishedStream OK');
                        })
                        .catch( (err) => {
                            console.error('replacePublishedStream NOK');
                        });
                } else {

                    console.log('Before publish');
                    //==============================
                    // 7/ PUBLISH OWN STREAM
                    //==============================
                    this.connectedConversation.publish(stream, null);
                }

                if(this.publishedStream){
                    this.publishedStream.release();
                }

                this.publishedStream = stream;

                this.removeStreamFromContainer('local', stream);
                this.displayStreamInContainer('local', stream);

            }).catch( (err) => {
                console.error('create stream error', err);
            });
    }

    managePublishWithMicAndCameraState() {

        console.log('managePublishWithMicAndCameraState');
        console.log('microIsActivate :', this.microIsActivate);
        console.log('cameraIsActivate :', this.cameraIsActivate);

        this.unPublish();
                 
        if(this.microIsActivate === true && this.cameraIsActivate  === true) {
            //Publish audio and video
            console.debug('Publish audio and video');
            this.pubAudioAndVideo();
        } else if (this.microIsActivate === false && this.cameraIsActivate === true) {
            //Publish video only
            console.debug('Publish video only');
            this.pubVideoOnly();
        } else if (this.microIsActivate  === true && this.cameraIsActivate === false) {
            //Publish audio
            console.debug('Publish audio only');
            this.pubAudio();
        } else if (this.microIsActivate === false && this.cameraIsActivate === false) {
            console.debug('No publish');
        }
    }

    pubAudio() {
        console.log("Publish audio only");
        if(window.apiRTC !== undefined) {
            this.createStreamAndPublish('audio');
        } else {
            console.error('Need to first click on start to load apiRTC');
        }
    }

    pubAudioAndVideo() {
        console.log("Publish audio and video");
        if(window.apiRTC !== undefined) {
            this.createStreamAndPublish('video');
        } else {
            console.error('Need to first click on start to load apiRTC');
        }
    }

    pubVideoOnly() {
        console.log("Publish video only");
        if(window.apiRTC !== undefined) {
            this.createStreamAndPublish('videoOnly');
        } else {
            console.error('Need to first click on start to load apiRTC');
        }
    }

    unPublish() {
        console.log("UnPublish");

        if(window.apiRTC !== undefined) {

            if(this.publishedStream) {
                this.connectedConversation.unpublish(this.publishedStream, null);
                this.removeStreamFromContainer('local', this.publishedStream);
                this.publishedStream.release();
                this.publishedStream = null;
            } else {
                console.log("this.publishedStream is not correct :", this.publishedStream);
            }
        } else {
            console.log('Need to first click on start to load apiRTC');
        }
    }

    leave() {
        console.log("Leave");

        if(window.apiRTC !== undefined) {

            //Leave Conversation
            if (this.connectedConversation !== null) {
                //Leaving actual conversation
                this.connectedConversation.destroy();
                this.connectedConversation.leave()
                    .then(() => {
                        console.debug('Conversation leave OK');
                    }).catch( (err) => {
                        console.error('Conversation leave error', err);
                    });
                this.connectedConversation = null;
            }
            //Release localStream
            if (this.publishedStream !== null) {
                //Releasing publishedStream
                this.publishedStream.release();
            }
            //Release screensharingStream
            if (this.screensharingStream !== null) {
                //Releasing screensharingStream
                this.screensharingStream.release();
            }
            //Unregister
            this.ua.unregister();
            this.ua = null;

        } else {
            console.log('Need to first click on start to load apiRTC');
        }
    }

    convNameInputChange(event){
        this.conversationName = event.target.value;
    }

    /**
     * Add stream in container
     */
    displayStreamInContainer(streamType, stream) {
        console.info('displayStreamInContainer for streamType :', streamType);

        let container = null;
        let mediaElement = null;
        mediaElement = document.createElement('video');

        if (streamType === 'local') {
            container = this.template.querySelector(".local-container");
            mediaElement.className = 'local-media-' + stream.streamId;
            mediaElement.autoplay = true;
            mediaElement.muted = true;
        } else if (streamType === 'remote') {
            container = this.template.querySelector(".remote-container");
            mediaElement.className = 'remote-media-' + stream.streamId;
            mediaElement.autoplay = true;
        } else {
            console.error('streamType is not correct :', streamType);
        } 

        if (container) {
            container.appendChild(mediaElement);
            stream.attachToElement(mediaElement);
        } else {
            console.error('No container found :', streamType);
        }
    }

    /**
     * Remove stream from container
     */
    removeStreamFromContainer(streamType, stream) {

        console.info('removeStreamFromContainer for streamType :', streamType);

        let container = null;
        let classNameToFind = null;

        if (streamType === 'local') {
            container = this.template.querySelector(".local-container");
            classNameToFind = 'local-media-' + stream.streamId;
        } else if (streamType === 'remote') {  
            container = this.template.querySelector('.remote-container');
            classNameToFind = 'remote-media-' + stream.streamId;
        } else {
            console.error('streamType is not correct :', streamType);
        }    

        if (container && container.childNodes.length > 0) {
            for (let i = 0; i < container.childNodes.length; i++) {
                if(container.childNodes[i].className === classNameToFind) {
                    console.info("Removing element :", container.childNodes[i].className);
                    container.removeChild(container.childNodes[i]);
                }
            }
        }
    }

    /**
     * Handle toggle micro
     */
    handleToggleMicro(event) {
        console.debug("handleToggleMicro");
        this.microIsActivate = !this.microIsActivate;
        this.managePublishWithMicAndCameraState();
    }

    /**
     * Handle toggle camera
     * @param {*} event 
     */
    handleToggleCamera(event) {
        console.debug("handleToggleCamera");
        this.cameraIsActivate = !this.cameraIsActivate;
        this.managePublishWithMicAndCameraState();
    }

    /**
     * Handle toggle screen
     * @param {*} event 
     */
    handleToggleScreen(event) {
        console.debug("handleToggleScreen");

        if(window.apiRTC === undefined || this.connectedConversation === null) {
            console.error('Need to first join a conference');
            return;
        }

        if (this.screensharingStream === null) {

            const displayMediaStreamConstraints = {
                video: {
                    cursor: "always"
                },
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    sampleRate: 44100
                }
            };

            apiRTC.Stream.createDisplayMediaStream(displayMediaStreamConstraints, false)
                .then((stream) => {

                    this.screensharingStream = stream;
                    this.screensharingStream.on('stopped', function() {
                        //Used to detect when user stop the screenSharing with Chrome DesktopCapture UI
                        console.log("stopped event on stream");
                        this.removeStreamFromContainer('local', this.screensharingStream);
                        this.screensharingStream = null;
                    });
                    this.connectedConversation.publish(this.screensharingStream);
                    this.displayStreamInContainer('local', this.screensharingStream);

                })
                .catch(function(err) {
                    console.error('Error on create screensharing stream :', err);
                });
        } else {
            this.connectedConversation.unpublish(this.screensharingStream);
            this.removeStreamFromContainer('local', this.screensharingStream);

            //Release screensharingStream
            if (this.screensharingStream !== null) {
                //Releasing screensharingStream
                this.screensharingStream.release();
            }
            this.screensharingStream = null;
        }
    }

    /**
     * Handle toggle record
     * @param {*} event 
     */
    handleToggleRecord(event) {
        console.log("handleToggleRecord");
        console.log("this.recordIsActivate :", this.recordIsActivate);

        if (this.recordIsActivate) {
            //Need to stop record
            console.log("stopCompositeRecording");

            this.connectedConversation.stopRecording()
                .then((recordingInfo) => {
                    console.info('stopRecording', recordingInfo);
                })
                .catch((err) => {
                    console.error('stopRecording', err);
                });

        } else {
            //Need to start record
            console.log("startCompositeRecording");

            this.connectedConversation.startRecording()
                .then((recordingInfo) => {
                    console.log('startRecording', recordingInfo);
                    console.log('startRecording mediaURL', recordingInfo.mediaURL);
                    let recordingInfoElt = this.template.querySelector(".recordingInfo");
                    recordingInfoElt.append('When ready, your recording will be available here: ' + recordingInfo.mediaURL);
                    recordingInfoElt.append(link);
                })
                .catch((err) => {
                    console.error('startRecording', err);
                });
        }
        this.recordIsActivate = !this.recordIsActivate;
    }
}