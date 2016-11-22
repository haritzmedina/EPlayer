'use strict';

var ExtensionsRunner = require('../extensions/ExtensionsRunner');
var ChromeStorage = require('../io/ChromeStorage');
var LibraryContainer = require('./LibraryContainer');
var Logger = require('../io/Logger');

var LocalLibrary = require('./model/LocalLibrary');

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
    this.init();
  }

  /**
   * Initialization of GCPlayer components
   */
  init(){
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
        this.libraryContainer.localLibraries[0].songs[0].src.retrievePlayableSource((dataURL)=>{
          let player = document.getElementById('player');
          player.src = dataURL;
          player.play();
        });
        // If libraries are empty, ask for one
        if(!this.libraryContainer.areLibrariesDefined()){
          this.libraryContainer.promptNewLocalLibraryForm(()=>{

          });
        }
      });
    });

    // Load playlists

    // Load player

    // Load interface

  }

  loadLibraries(){

  }
}

module.exports = GCPlayer;