'use strict';

const ExtensionsRunner = require('../extensions/ExtensionsRunner');
const ChromeStorage = require('../io/ChromeStorage');
const LibraryContainer = require('./LibraryContainer');
const Player = require('./Player');
const Menu = require('./Menu');
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
    this.menu = new Menu();
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

    // Load on close events
    this.loadCloseEvents();
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
      });
    });

    // Load playlists

    // Load player
    this.player.initPanelHandlers();


    // Load interface
    this.menu.init();

    // Testing

  }

  loadCloseEvents() {
    chrome.runtime.onSuspend.addListener(()=>{
      // Update library container chrome storage
      this.libraryContainer.updateChromeStorage();
    });

  }
}

module.exports = GCPlayer;