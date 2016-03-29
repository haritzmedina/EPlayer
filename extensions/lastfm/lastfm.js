var LastFM = {};

LastFM.apiKey = "";
LastFM.apiSecret = "";
LastFM.apiURI = "http://ws.audioscrobbler.com/2.0/";
LastFM.userAuthURI = "http://www.last.fm/api/auth/";

LastFM.init = function(apiKey, apiSecret){
    "use strict";
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
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

LastFM.requestUserAuthURL = function(token){
    "use strict";
    return this.userAuthURI+"?api_key="+this.apiKey+"&token="+token;
};

LastFM.retrieveWebServiceSession = function(token, callback){
    "use strict";
    var api_sig = this.getApiSig(
        {
            api_key: this.apiKey,
            method: "auth.getSession",
            token: token
        }, this.apiSecret);

    var request = $.ajax({
        type: "POST",
        url: "http://ws.audioscrobbler.com/2.0/?method=auth.getSession&api_key="+this.apiKey+"&format=json",
        data: {
            api_key: this.api_key, // TODO revise if needed
            token: token,
            api_sig: api_sig
        }
    });

    request.done(function(result){
        callback(result);
    });
};

LastFM.scrobble = function(artist, track, timestamp, sessionKey, callback){
    "use strict";
    var properties = {
        api_key: this.apiKey,
        "artist[0]" : artist,
        method: "track.scrobble",
        sk: sessionKey,
        "timestamp[0]" : timestamp,
        "track[0]" : track
    };

    var api_sig = this.getApiSig(properties, this.apiSecret);

    var request = $.ajax({
        type: "POST",
        url: "http://ws.audioscrobbler.com/2.0/?format=json",
        data: {
            "artist[0]" : artist,
            "track[0]" : track,
            "timestamp[0]" : timestamp,
            api_key : this.apiKey,
            sk : sessionKey,
            method: "track.scrobble",
            api_sig: api_sig
        },
        success: function(result){
            callback(result);
        }
    });

};

LastFM.getApiSig = function(properties, secret){
    "use strict";
    var sig = "";
    for(var key in properties){
        sig += key+properties[key];
    }
    sig += secret;
    console.log(sig);
    return md5(sig);
};