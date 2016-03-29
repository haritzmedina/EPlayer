(function(){
    "use strict";
    window.GCPlayer.controller.extensions.loadScript("lastfm/cjs.js");

    function waitForLastfmLoaded(resolve, reject){
        setTimeout(function(){
            if(typeof LastFM === 'undefined') {
                waitForLastfmLoaded(resolve, reject);
                console.log("LastFM library not loaded yet.");
            }
            else{
                console.log("LastFM library loaded");
                resolve(true);
            }
        },500);
    }

    var promise = new Promise(function(resolve, reject){
        
        window.GCPlayer.controller.extensions.loadScript("lastfm/lastfm.js");
        // Load MD5 library
        window.GCPlayer.controller.extensions.loadScript("lastfm/md5.js");
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