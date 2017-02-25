'use strict';

const ExtensionsRunner = require('../extensions/ExtensionsRunner');
const LibraryContainer = require('./LibraryContainer');
const Player = require('./Player');
const Menu = require('./Menu');
const PlaylistContainer = require('./PlaylistContainer');
const Logger = require('../io/Logger');

const {globalShortcut} = window.require('electron').remote;

/**
 * The main file of EPlayer
 * @author Haritz Medina <me@haritzmedina.com>
 */
class EPlayer{
  /**
   * The constructor of EPlayer
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
   * Initialization of EPlayer components
   */
  init(){
    // Add global reference to EPlayer
    window.EPlayer = this;

    // Load core components
    this.loadCoreComponents();

    // Load extensions
    this.extensionsRunner.init();

    // Load special events
    // TODO FIX this functions (handlers when app is closed and multimedia buttons)
    this.loadCloseEvents();
    this.loadMultimediaEvents();

    /*this.loadChromeEvents();*/
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
    window.onbeforeunload = ()=>{
      // Update library container chrome storage
      this.libraryContainer.updateLocalStorage();
    };
  }

  loadMultimediaEvents(){
    // TODO based on settings defined by the user
    // Play/pause shortcut
    globalShortcut.register('Control+Shift+6', () => {
      if(this.player.currentStatus===this.player.status.paused){
        this.player.play();
      }
      else if(this.player.currentStatus===this.player.status.playing){
        this.player.pause();
      }
    });
    // Previous song shortcut
    globalShortcut.register('Control+Shift+5', () => {
      this.player.previousSong();
    });
    // Next song shortcut
    globalShortcut.register('Control+Shift+7', () => {
      this.player.nextSong();
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

module.exports = EPlayer;