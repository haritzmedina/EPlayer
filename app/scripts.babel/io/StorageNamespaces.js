/**
 * List of Chrome Storage Namespaces
 * @author Haritz Medina <me@haritzmedina.com>
 */


'use strict';


/**
 *
 */
class StorageNamespaces{

}

StorageNamespaces.library = {
  container: 'EPlayer.library.container',
  playlists: 'EPlayer.library.playlist',
  songs: 'EPlayer.library.songs'
};

StorageNamespaces.player = 'EPlayer.player';

module.exports = StorageNamespaces;