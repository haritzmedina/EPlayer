var LastFM = {};

LastFM.apiKey = "";
LastFM.apiSecret = "";
LastFM.apiURI = "http://ws.audioscrobbler.com/2.0/";
LastFM.userAuthURI = "http://www.last.fm/api/auth/";

LastFM.init = function(){
    "use strict";
    // Load MD5 library
    window.GCPlayer.controller.extensions.loadScript("lastfm/md5.js");
};

LastFM.getToken = function(callback){
    "use strict";
    var api_sig = this.getApiSig(this.apiKey, "auth.getToken", this.apiSecret);
    var request = $.ajax({
        type: "POST",
        url: "http://ws.audioscrobbler.com/2.0/?method=auth.gettoken&api_key="+this.apiKey+"&format=json",
        data: {
            api_key: this.api_key,
            api_sig: api_sig
        }
    });

    request.done(function(result){
        callback(result);
    });
};

LastFM.getApiSig = function(api_key, method, secret){
    "use strict";
    var sig = api_key+"xxxxxxxx"+method+"xxxxxxx"+secret;
    return md5(sig);
};