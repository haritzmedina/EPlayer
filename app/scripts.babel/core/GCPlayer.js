'use strict';

const ExtensionsRunner = require('../extensions/ExtensionsRunner');
const ChromeStorage = require('../io/ChromeStorage');
const LibraryContainer = require('./LibraryContainer');
const Player = require('./Player');
const PlaylistContainer = require('./PlaylistContainer');
const Logger = require('../io/Logger');

const LocalLibrary = require('./model/LocalLibrary');

/**
 * The main file of GCPlayer
 * @author Haritz Medina <me@haritzmedina.com>
 */
class GCPlayer{
  /**
   * The constructor of GCPlayer
   */
  constructor(){
    this.extensionsRunner = new ExtensionsRunner();
    this.libraryContainer = new LibraryContainer();
    this.playlistContainer = new PlaylistContainer();
    this.player = new Player();
    this.init();
  }

  /**
   * Initialization of GCPlayer components
   */
  init(){
    // Add global reference to GCPlayer
    window.GCPlayer = this;

    // Load core components
    this.loadCoreComponents();

    // Load extensions
    this.extensionsRunner.init();
  }

  loadCoreComponents(){
    // Load libraries
    this.libraryContainer.init(()=>{
      // Add library
      this.libraryContainer.loadLibraries(()=>{
        // If libraries are empty, ask for one
        if(!this.libraryContainer.areLibrariesDefined()){
          this.libraryContainer.promptNewLocalLibraryForm(()=>{

          });
        }
        /*else{
          let playlistExample = new Playlist('Example', this.libraryContainer.retrieveAllSongs());
          playlistExample.start();
          playlistExample.currentSong.src.retrievePlayableSource((source) => {
            let player = document.querySelector('#player');
            player.src = source;
            //player.play();
          });
        }*/
      });
    });

    // Load playlists

    // Load player
    this.player.initPanelHandlers();


    // Load interface

    // Testing

    //this.libraryContainer.removeLocalLibrary({id: 'c7b53f1c-cc97-4a28-8e87-88c0f1d97de7'});

  }

}

module.exports = GCPlayer;