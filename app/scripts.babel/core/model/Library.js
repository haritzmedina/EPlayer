'use strict';

const uuid = require('uuid');
const Logger = require('../../io/Logger');
const LanguageUtils = require('../../utils/LanguageUtils');

/**
 * Library interface. A library is a song list source.
 * @author Haritz Medina <me@haritzmedina.com>
 */
class Library{

  constructor(source, name){
    this.source = source;
    this.songs = [];
    this.id = uuid();
    this.name = name;
  }

  /**
   *
   * @returns {Array} Song list array
   */
  retrieveSongs(){
    return this.songs;
  }

  loadLibrary(callback){
    Logger.log('Loading library '+this.getId());
    callback();
  }

  /**
   * Returns if the library is syncable in multiple devices (only for cloud based libraries)
   * @returns {boolean}
   */
  isSyncable(){
    return false;
  }

  printLibrary(callback){
    // Retrieve container to print elements
    let container = document.getElementById('librarySearchResults');

    // Add header of library
    let template = document.querySelector('#library');
    let libraryWrapper = document.importNode(template.content, true);
    let titleWrapper = libraryWrapper.querySelector('.libraryTitleWrapper');
    titleWrapper.innerText = this.name;
    let librarySongContainer = libraryWrapper.querySelector('.librarySongContainer');
    container.appendChild(libraryWrapper);

    // Print songs of library
    for(let i=0;i<this.songs.length;i++){
      let song = this.songs[i];
      song.printLibrarySong(this.id, librarySongContainer);
    }
    if(LanguageUtils.isFunction(callback)){
      callback();
    }
  }

  getId(){
    return this.id;
  }

}

module.exports = Library;