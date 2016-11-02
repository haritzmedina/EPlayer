'use strict';

var ExtensionsRunner = require('../extensions/ExtensionsRunner');

/**
 * The main file
 * @author Haritz Medina <me@haritzmedina.com>
 */
class GCPlayer{
  /**
   * The constructor of GCPlayer
   */
  constructor(){
    this.extensionsRunner = new ExtensionsRunner();
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

  }
}

module.exports = GCPlayer;