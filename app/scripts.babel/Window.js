(function(){
    'use strict';
    window.GCPlayer = {};
    window.GCPlayer.view = new GCPlayerView();
    window.GCPlayer.model = new GCPlayerModel();
    window.GCPlayer.controller = new GCPlayerController();

    window.onload = function(){
        window.GCPlayer.controller.init();
    };
})();

