'use strict';

var Library = require('Library');

/**
 * Google Play Music Remote Library, contains a library hosted in Google Music
 * @author Haritz Medina <me@haritzmedina.com>
 */
class GoogleMusicLibrary extends Library {
  constructor(){
    super();
  }

  isSyncable(){
    return true;
  }
}

module.exports = GoogleMusicLibrary;