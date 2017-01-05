'use strict';

const uuid = require('uuid');
const Logger = require('../../io/Logger');
const LanguageUtils = require('../../utils/LanguageUtils');
const Notification = require('../../io/Notification');
const Playlist = require('./Playlist');

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

    let removeButton = libraryWrapper.querySelector('.libraryRemove');
    removeButton.addEventListener('click', ()=>{
      window.GCPlayer.libraryContainer.removeLibrary({id: this.id}, ()=>{
        Notification.createTextNotification(
          Notification.predefinedId.other,
          'Library removed',
          'Library '+this.name+' was removed.'
        );
      });
    });

    let playButton = libraryWrapper.querySelector('.libraryPlay');
    playButton.addEventListener('click', ()=>{
      window.GCPlayer.playlistContainer.changeCurrentPlaylist(new Playlist('temp', this.songs), true);
      // TODO Notify user that new playlist is loaded
    });

    // Print songs of library
    for(let i=0;i<this.songs.length;i++){
      let song = this.songs[i];
      song.printLibrarySong(this.id, librarySongContainer);
    }

    // Add library to the library container
    container.appendChild(libraryWrapper);

    if(LanguageUtils.isFunction(callback)){
      callback();
    }
  }

  getId(){
    return this.id;
  }

}

module.exports = Library;