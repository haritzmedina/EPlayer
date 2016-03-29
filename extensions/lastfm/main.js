(function(){
    "use strict";
    window.GCPlayer.controller.extensions.loadScript("lastfm/cjs.js");

    function waitForLastfmLoaded(resolve, reject){
        if(typeof LastFM !== 'undefined'){
            console.log("LastFM library not loaded yet");
            setTimeout(function(){
                waitForLastfmLoaded(resolve, reject);
            },500);
        }
        else{
            console.log("LastFM library loaded");
            setTimeout(function(){
                resolve(true);
            }, 500);
        }
    }
    var promise = new Promise(function(resolve, reject){
        window.GCPlayer.controller.extensions.loadScript("lastfm/lastfm.js");
        waitForLastfmLoaded(resolve, reject);
    });

    promise.then(function(){
        window.LastFM.apiKey = "cc69fb7a84e1cfe0e612624890995945";
        window.LastFM.apiSecret = "c1f81580d71489e277e83982ed88578c";

        window.LastFM.init();

        console.log("Loaded lastFM scrobbler");
    });



    window.GCPlayer.lastfm = {};

    window.GCPlayer.lastfm.apiKey = "";
    window.GCPlayer.lastfm.secret = "";

})();