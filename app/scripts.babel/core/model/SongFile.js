'use strict';

const Song = require('./Song');
const LanguageUtils = require('../../utils/LanguageUtils');
const id3 = require('id3js');
const SongFileSource = require('./SongFileSource');

class SongFile extends Song{

  constructor(id, fileEntry, metadata){
    super(id, metadata.artist, metadata.title, metadata.album, new SongFileSource(fileEntry));
  }

  static readSongFileMetadata(fileEntry, callback){
    // Retrieve song data from fileEntry
    fileEntry.file((file)=>{
      try {
        id3(file, function (err, tags) {
          let metadata = {};
          if (tags.artist !== null) {
            metadata.artist = tags.artist;
          }
          if (tags.title !== null) {
            metadata.title = tags.title;
          }
          if (tags.album !== null) {
            metadata.album = tags.album;
          }
          if(LanguageUtils.isFunction(callback)){
            callback(err, metadata);
          }
        });
      } catch (err) {
        callback(err);
      }
    });
  }

}

module.exports = SongFile;