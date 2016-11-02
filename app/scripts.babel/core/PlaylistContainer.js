'use strict';

/**
 * A container for the playlist defined by user
 * @author Haritz Medina <me@haritzmedina.com>
 */
class PlaylistContainer {

  /**
   * Constructor of the playlist container
   */
  constructor(){
    this.playlists = [];
  }

  static addPlaylist(playlist){
    if(typeof playlist!=='Playlist'){
      return null;
    }
    else{
      this.playlists.push(playlist);
    }
  }

  /**
   * Retrieve from chrome storage saved playlists
   */
  static populatePlaylist(){
    // TODO Retrieve playlists from chrome storage
  }

}

module.exports = PlaylistContainer;