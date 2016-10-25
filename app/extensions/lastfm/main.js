(function(){
    "use strict";

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

    // Load scrobbling libraries
    var promise = new Promise(function(resolve, reject){
        
        window.GCPlayer.controller.extensions.loadScript("lastfm/lastfm.js");
        // Load MD5 library
        window.GCPlayer.controller.extensions.loadScript("lastfm/md5.js");
        waitForLastfmLoaded(resolve, reject);
    });

    var lastfmInitializedPromise = promise.then(function(){
        // Init LastFM library
        window.LastFM.init("cc69fb7a84e1cfe0e612624890995945", "c1f81580d71489e277e83982ed88578c");

        console.log("Loaded lastFM scrobbler");
    });

    // Add lastfm custom stylesheet
    window.GCPlayer.controller.extensions.loadCss("lastfm/lastfm.css");

    // Add menu button for extension
    var menu = document.querySelector("#menu");
    var lastfmMenuButton = document.createElement("span");
    lastfmMenuButton.id = "lastfmSelector";
    lastfmMenuButton.className += " menuElement";
    lastfmMenuButton.className += " menuSelector";
    lastfmMenuButton.dataset.associatedContainer = "lastfmContainer";
    lastfmMenuButton.title = "LastFM";
    menu.appendChild(lastfmMenuButton);

    // Add container for extension config options
    var container = document.querySelector("#content");
    var lastfmMenuContainer = document.createElement("div");
    lastfmMenuContainer.id = "lastfmContainer";
    lastfmMenuContainer.className += " contentContainer";
    lastfmMenuContainer.dataset.enabled = "false";
    container.appendChild(lastfmMenuContainer);

    window.GCPlayer.model.extensions.data.lastfm = {};

    // Load content to container
    $(lastfmMenuContainer).load("extensions/lastfm/lastfm.html", function(){
        // Load user previous config
        window.GCPlayer.model.getParams(window.GCPlayer.model.storage.extensions+"lastfm", function(result){
            // Check if user is logged in lastfm
            if(jQuery.isEmptyObject(result)){
                // Disable logged menu
                var loggedContainer = document.getElementById("lastfm-loggedContainer");
                loggedContainer.dataset.enabled = false;
                // Request a token to permit login
                lastfmInitializedPromise.then(function(){
                    window.LastFM.getToken(function(result){
                        // Save the token
                        window.GCPlayer.model.extensions.data.lastfm.token = result.token;
                        // Add token to url
                        var loginButton = document.getElementById("lastfm-loginButton");
                        loginButton.href = window.LastFM.requestUserAuthURL(result.token);
                    });
                });

            }
            else{
                // Disable login menu
                var loginContainer = document.getElementById("lastfm-loginContainer");
                loginContainer.dataset.enabled = false;
                // Load session id
                var info = result[window.GCPlayer.model.storage.extensions+"lastfm"];
                window.GCPlayer.model.extensions.data.lastfm.sessionId = info.sessionId;
            }
        }, true);

        // Buttons context
        var loginButton = document.getElementById("lastfm-loginButton");
        loginButton.addEventListener("click", function(){
            // Hide login container
            var loginContainer = document.getElementById("lastfm-loginContainer");
            loginContainer.dataset.enabled = false;
            // Show question
            var questionContainer = document.getElementById("lastfm-loginQuestion");
            questionContainer.dataset.enabled = true;
        });

        var loginYesButton = document.getElementById("lastfm-loginYes");
        loginYesButton.addEventListener("click", function(){
            window.LastFM.retrieveWebServiceSession(window.GCPlayer.model.extensions.data.lastfm.token, function(session){
                window.GCPlayer.model.extensions.data.lastfm.sessionId = session;
                // TODO Verify that LastFM is connected properly
                console.log('LastFM connected');
            });
        });
        var loginNoButton = document.getElementById("lastfm-loginNo");
        var loginInfoButton = document.getElementById("lastfm-loginInfo");
        loginInfoButton.addEventListener("click", function(){
            $("#lastfm-authentication-help").show();
        });
    });



    // Song change event
    GCPlayer.view.player.playerInstance.addEventListener("currentSongChanged", function(result){
        // TODO Ensure that 30 seconds of the song were played before scrobble
      console.log('Song changed received by lastfm');
      console.log(GCPlayer.model.currentSong);
      var song = GCPlayer.model.currentSong;
      var timestamp = parseInt((result.detail.time / 1000).toFixed(0));

      LastFM.scrobble(
        song.artist,
        song.title,
        timestamp,
        window.GCPlayer.model.extensions.data.lastfm.sessionId,
        (result)=>{
          console.log(result);
        }
        );
    });
})();