'use strict';

const ExtensionsRunner = require('../extensions/ExtensionsRunner');
const LibraryContainer = require('./LibraryContainer');
const Player = require('./Player');
const Menu = require('./Menu');
const PlaylistContainer = require('./PlaylistContainer');
const Logger = require('../io/Logger');

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

    // Load special events
    // TODO FIX this functions (handlers when app is closed and multimedia buttons)
    /*this.loadCloseEvents();
    this.loadChromeEvents();*/
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

  loadChromeEvents(){
    // Multimedia keys
    chrome.commands.onCommand.addListener((command)=>{
      if (command === 'playPause') {
        if(this.player.currentStatus===this.player.status.paused){
          this.player.play();
        }
        else if(this.player.currentStatus===this.player.status.playing){
          this.player.pause();
        }
      }
      if (command === 'nextSong') {
        this.player.nextSong();
      }
      if (command === 'previousSong') {
        this.player.previousSong();
      }
    });
  }
}

module.exports = GCPlayer;