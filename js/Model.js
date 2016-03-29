/**
 * Created by Haritz Medina on 14/01/2016.
 */

var GCPlayerModel = function (){};

GCPlayerModel.prototype.storage = {};

GCPlayerModel.prototype.storage.libraryFolder = "library.folders";
GCPlayerModel.prototype.storage.librarySongs = "library.songs";
GCPlayerModel.prototype.storage.configExtensions = "config.extensions";

/**
 * Initialization of model class (load configuration and prepare model environment)
 * @param view
 */
GCPlayerModel.prototype.init = function (view) {
    "use strict";
    // Create user configs if not exists
    this.setInitialModel();

    // Load user configs (library, etc.)
    this.loadSavedModel();

    // Start view
    window.GCPlayer.view.init();
};

GCPlayerModel.prototype.setInitialModel = function(){
    "use strict";
    // Library folders
    this.getParams(window.GCPlayer.model.storage.libraryFolder, function(result){
        if(jQuery.isEmptyObject(result)){
            window.GCPlayer.model.setParams({"library.folders" : []}, function(){}, false);
        }
    });

    // Library songs
    this.getParams(window.GCPlayer.model.storage.librarySongs, function(result){
        if(jQuery.isEmptyObject(result)){
            window.GCPlayer.model.setParams({"library.songs" : {}}, function(){}, false);
        }
    });

    // Extensions config
    this.getParams(window.GCPlayer.model.storage.configExtensions, function(result){
        if(jQuery.isEmptyObject(result)){
            window.GCPlayer.model.setParams({"config.extensions" : []}, function(){}, false);
        }
    });
};

/**
 * Load in javascript the configuration saved by user in last session.
 */
GCPlayerModel.prototype.loadSavedModel = function(){
    "use strict";
    // Load library folders with its songs
    this.getParams(window.GCPlayer.model.storage.libraryFolder, function(result){
        var folders = result[window.GCPlayer.model.storage.libraryFolder];
        if(!jQuery.isEmptyObject(folders)){
            // Load folders content and display songs on view
            for(var i=0;i<folders.length;i++){
                var folder = folders[i];
                console.log("Loading content folder for "+folder.absolutePath);
                window.GCPlayer.model.library.loadFolder(folder);
            }
            // TODO Display songs only once (when all folders are read) [ LOOK loadFolder promise ]
        }
        else{
            // TODO Show welcome message on screen
        }
    });
};

GCPlayerModel.prototype.playSong = function(song){
    "use strict";
    // Current song view update
    song.file.file(function(file){
        console.log(file);
        var reader = new FileReader();
        reader.onload = function(){
            var dataURL = reader.result;
            window.GCPlayer.model.currentSong = song;
            window.GCPlayer.view.playSong(song, dataURL);
        };
        reader.readAsDataURL(file);
    });
};


GCPlayerModel.prototype.library = {};

GCPlayerModel.prototype.library.songs = {};

/**
 * Library data smodel
 * @type {{Library}}
 */
GCPlayerModel.prototype.library.loadFolder = function(libraryFolder){
    "use strict";
    var folder = libraryFolder;
    chrome.fileSystem.restoreEntry(libraryFolder.folderPoint, function(entryFolder){
        var dirReader = entryFolder.createReader();
        var songs = [];
        var readEntries = function(){
            dirReader.readEntries(function(results){
                if(results.length){
                    var fileExtensionRegEx = /(?:\.([^.]+))?$/;
                    for(var i=0; i<results.length;i++){
                        var extension = fileExtensionRegEx.exec(results[i].name);
                        if(extension[0]===".mp3"){
                            songs.push(results[i]);
                        }
                    }
                    readEntries();
                }
                else{
                    console.log("Folder "+folder.absolutePath+" contains "+songs.length+" songs.");
                    var updateSongsPromise = new Promise(function(resolve, reject){
                        window.GCPlayer.model.library.updateSongs(songs, folder, function(){
                            resolve(true);
                        });
                    });
                    updateSongsPromise.then(function(){
                        // Display songs in library container
                        window.GCPlayer.view.displayLibrarySearchSongs(window.GCPlayer.model.library.getSongArray());
                    });


                }
            });
        };
        readEntries();
    });

};

GCPlayerModel.prototype.library.addFolder = function(libraryFolder, libraryPath){
    "use strict";
    var folderPoint = libraryFolder, folderPath = libraryPath;
    window.GCPlayer.model.getParams("library.folders", function(result){
        // Check if folder already is added
        var storedFolders = result["library.folders"];
        if(jQuery.isEmptyObject(storedFolders)){
            storedFolders = [];
        }
        for(var i=0;i<storedFolders.length;i++){
            var folder = storedFolders[i];
            if(folder.absolutePath===folderPath){
                return;
            }
        }
        // If folder is not added, add and save it to chrome storage
        storedFolders.push(new Folder(folderPoint, folderPath));
        window.GCPlayer.model.setParams({"library.folders" : storedFolders}, function(){}, false);
    }, false);
};

GCPlayerModel.prototype.library.updateSongs = function(songs, libraryFolder, callback){
    "use strict";
    var songList = songs, folder = libraryFolder;
    window.GCPlayer.model.getParams(window.GCPlayer.model.storage.librarySongs, function(result){
        window.GCPlayer.model.library.songs = result[window.GCPlayer.model.storage.librarySongs];
        if(jQuery.isEmptyObject(window.GCPlayer.model.library.songs)){
            window.GCPlayer.model.library.songs = {};
        }
        // Check if a song is updated
        var promises = [];
        for(var i=0; i<songList.length;i++){
            var songEntry = songList[i];
            var promise = new Promise(function(resolve, reject){
                window.GCPlayer.model.library.updateSong(songEntry, folder, function(){
                    resolve(songEntry.filename);
                });
            });
            promises.push(promise);
        }
        Promise.all(promises).then(function(result){
            var storedSongs = window.GCPlayer.model.library.songs;
            window.GCPlayer.model.setParams({"library.songs": storedSongs}, function(){}, false);
            console.log("Songs from "+ folder.absolutePath +" updated.");
            callback();
        }).catch(function(result){
            console.log("Error detected",result);
        });
        // TODO Check if a song is missing in every library folder


    }, false);
};

GCPlayerModel.prototype.library.updateSong = function(songEntry, folder, callback){
    "use strict";
    var songId = folder.absolutePath+"#"+songEntry.name;
    // TODO Check if file is updated or not
    // If song does not exists, add to database
    if(window.GCPlayer.model.library.songs[songId]===undefined){
        // Song metadata
        var song = new Song();
        song.filename = songEntry.name;
        song.folder = folder.absolutePath;
        song.file = songEntry;
        song.lastUpdatedDate = songEntry.lastUpdatedDate;
        window.GCPlayer.model.library.setSong(songId, song);
        songEntry.file(function(file) {
            try{
                id3(file, function (err, tags) {
                    if(tags.artist!==null){
                        window.GCPlayer.model.library.setSongParam(songId, "artist", tags.artist);
                    }
                    if(tags.title!==null){
                        window.GCPlayer.model.library.setSongParam(songId, "title", tags.title);
                    }
                    if(tags.album!==null){
                        window.GCPlayer.model.library.setSongParam(songId, "album", tags.album);
                    }
                    callback();
                });
            }
            catch(err){
                console.log(err);
                callback();
            }
        });
    }
    else{
        // Add pointer to file
        window.GCPlayer.model.library.songs[songId].file = songEntry;
        callback();
    }
};

GCPlayerModel.prototype.library.setSong = function(songId, song){
    "use strict";
    // Check if song object exists
    if(jQuery.isEmptyObject(this.songs)){
        this.songs = {};
    }
    this.songs[songId] = song;
};

GCPlayerModel.prototype.library.setSongParam = function(songId, param, value){
    "use strict";
    // Check if song object exists
    if(jQuery.isEmptyObject(this.songs)){
        this.songs = {};
    }
    if(!jQuery.isEmptyObject(this.songs[songId])){
        this.songs[songId][param] = value;
    }
};

GCPlayerModel.prototype.library.getSongArray = function(){
    "use strict";
    var arr = [];
    for (var key in this.songs) {
        arr.push(this.songs[key]);
    }
    return arr;
};

GCPlayerModel.prototype.library.getSongById = function(songId){
    "use strict";
    if(!jQuery.isEmptyObject(this.songs[songId])){
        return this.songs[songId];
    }
    else{
        return null;
    }
};

GCPlayerModel.prototype.fileSystem = {};
GCPlayerModel.prototype.fileSystem.id3tags = function(fileEntry, callback){
    "use strict";

};

// Chrome storage functions
GCPlayerModel.prototype.setParams = function (x, callback, wantSync) {
    var storageArea = wantSync ? chrome.storage.sync : chrome.storage.local;
    storageArea.set(x,
        function () {
            if (chrome.runtime.lastError){
                console.log(chrome.runtime.lastError);
            }
            else{
                callback();
            }
        }
    );
};

GCPlayerModel.prototype.getParams = function (x, callback, wantSync) {
    var storageArea = wantSync ? chrome.storage.sync : chrome.storage.local;
    storageArea.get(x,
        function (items) {
            if (chrome.runtime.lastError){
                console.log(chrome.runtime.lastError);
            }
            else{
                callback(items);
            }
        }
    );
};


/* Playlist manager */
GCPlayerModel.prototype.playlist = {};

GCPlayerModel.prototype.playlist.songs = [];
GCPlayerModel.prototype.playlist.current = -1; // Playing song index
GCPlayerModel.prototype.playlist.repeatMode = 0; // 0: none, 1: playlist


GCPlayerModel.prototype.playlist.playNextSong = function(){
    "use strict";
    var song = this.nextSong(); // Retrieve the next song
    window.GCPlayer.model.playSong(song); // Play the song
    this.nextSongIndex(); // Update the index
};

GCPlayerModel.prototype.playlist.nextSongIndex = function(){
    "use strict";
    if(this.songs.length===0){
        this.current = -1;
    }
    else{
        if(this.current<this.songs.length-1){
            this.current += 1;
        }
        else{
            if(this.repeatMode===0){
                this.current = -1;
            }
            else{
                this.current = 0;
            }
        }
    }
};

GCPlayerModel.prototype.playlist.nextSong = function(){
    "use strict";
    var nextSongIndex = this.current+1;
    if(typeof this.songs[nextSongIndex] === 'undefined') { // Is the last song or empty playlist
        if(this.repeatMode===0) {
            return null;
        }
        else {
            if (this.songs.length === 0) {
                return null;
            }
            else {
                return this.songs[0];
            }
        }
    }
    else {
        return this.songs[nextSongIndex];
    }
};

GCPlayerModel.prototype.playlist.hasNextSong = function(){
    "use strict";
    var nextSongIndex = this.current+1;
    if(this.repeatMode===0){
        return typeof this.songs[nextSongIndex] !== 'undefined';
    }
    else{
        return true;
    }
};

GCPlayerModel.prototype.playlist.playPreviousSong = function(){
    "use strict";
    var song = this.previousSong(); // Retrieve the previous song
    window.GCPlayer.model.playSong(song); // Play the song
    this.previousSongIndex(); // Update the index
};

GCPlayerModel.prototype.playlist.hasPreviousSong = function(){
    "use strict";
    var previousSongIndex = this.current-1;
    if(this.repeatMode===0){
        return typeof this.songs[previousSongIndex] !== 'undefined';
    }
    else{
        return true;
    }
};

GCPlayerModel.prototype.playlist.previousSong = function(){
    "use strict";
    var previousSongIndex = this.current-1;
    if(typeof this.songs[previousSongIndex] === 'undefined') { // Is the last song or empty playlist
        if(this.repeatMode===0) {
            return null;
        }
        else {
            if (this.songs.length === 0) {
                return null;
            }
            else {
                return this.songs[this.songs.length-1];
            }
        }
    }
    else {
        return this.songs[previousSongIndex];
    }
};

GCPlayerModel.prototype.playlist.previousSongIndex = function(){
    "use strict";
    if(this.songs.length===0){
        this.current = -1;
    }
    else{
        if(this.current>0){
            this.current -= 1;
        }
        else{
            if(this.repeatMode===0){
                this.current = -1;
            }
            else{
                this.current = this.songs.length-1;
            }
        }
    }
};

GCPlayerModel.prototype.playlist.createRandom = function(songs, autoplay){
    "use strict";
    autoplay = autoplay || false;

    // Create a shuffle songs array
    var shuffleSongs = Array.apply(undefined,songs);
    var i, j, temp;
    for (i = shuffleSongs.length - 1; i > 0; i -= 1) {
        j = Math.floor(Math.random() * (i + 1));
        temp = shuffleSongs[i];
        shuffleSongs[i] = shuffleSongs[j];
        shuffleSongs[j] = temp;
    }
    // Create a new playlist
    if(autoplay === null){
        autoplay = false;
    }
    this.create(shuffleSongs, autoplay);
};

/**
 * Create a new playlist with the given songs
 * @param songs Given songs of the new
 * @param autoplay
 */
GCPlayerModel.prototype.playlist.create = function(songs, autoplay){
    "use strict";
    autoplay = autoplay || false;
    if(songs instanceof Array){
        if(songs.length>0){
            this.songs = songs;
            this.current = 0;
            if(autoplay){
                window.GCPlayer.model.playSong(this.songs[this.current]);
            }
        }
    }
};

GCPlayerModel.prototype.extensions = {};

GCPlayerModel.prototype.extensions.updateModel = function(extensions, callback){
    "use strict";
    // Save model
    window.GCPlayer.model.extensions.data = extensions;
    // TODO Retrieve config in sync storage
    window.GCPlayer.model.getParams(window.GCPlayer.model.storage.configExtensions, function(result){
        var storedExtensions = result["config.extensions"];
        // Find if previous config of extension is set
        for(var i=0;i<extensions.length;i++){
            for(var j=0;j<storedExtensions.length;j++){
                if(extensions[i].id===storedExtensions[j].id){
                    extensions[i].enabled = storedExtensions.enabled;
                }
            }
            // If previous value of extension is not found, set it to enabled
            if(jQuery.isEmptyObject(extensions[i].enabled)){
                extensions[i].enabled = true;
            }
        }
        window.GCPlayer.model.extensions.data = extensions;
        window.GCPlayer.model.setParams({"config.extensions": extensions}, function(){
            callback(window.GCPlayer.model.extensions.data); // TODO callback when data is stored
        }, true);
    });

    // Display in settings
    window.GCPlayer.view.configuration.displayExtensions(window.GCPlayer.model.extensions.data);
};

GCPlayerModel.prototype.extensions.getExtensions = function(extensions){
    "use strict";

};

GCPlayerModel.prototype.extensions.enableExtension = function(id){
    "use strict";

};

GCPlayerModel.prototype.extensions.disableExtension = function(id){
    "use strict";

};



var Song = function(filename, folder, file, title, artist, album, updatedDate){
    "use strict";
    this.file = file;
    this.filename = filename;
    this.folder = folder;
    this.artist = artist;
    this.album = album;
    this.title = title;
    this.lastUpdatedDate = updatedDate;
};

var Folder = function(folderPoint, absolutePath){
    "use strict";
    this.folderPoint = folderPoint;
    this.absolutePath = absolutePath;
};