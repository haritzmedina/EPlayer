'use strict';

const Song = require('./Song');
const LanguageUtils = require('../../utils/LanguageUtils');
const id3 = require('id3-parser');
const SongFileSource = require('./SongFileSource');
const path = require('path');
const fs = require('fs');


class SongFile extends Song{

  constructor(id, filepath, metadata){
    super(id, metadata.title, metadata.artist, metadata.album, new SongFileSource(filepath));
  }

  static readSongFileMetadata(filepath, callback){
    // Retrieve song data from file
    let buffer = fs.readFileSync(filepath);
    id3.parse(buffer).then((tags)=>{
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
        callback(metadata);
      }
    });
  }
}

module.exports = SongFile;