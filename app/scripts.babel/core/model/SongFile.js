'use strict';

const Song = require('./Song');
const LanguageUtils = require('../../utils/LanguageUtils');
const id3 = require('id3js');
const SongFileSource = require('./SongFileSource');
const path = require('path');


class SongFile extends Song{

  constructor(id, filepath, metadata){
    super(id, metadata.title, metadata.artist, metadata.album, new SongFileSource(filepath));
  }


  static readSongFileMetadata(filepath, callback){
    // Retrieve song data from file
    console.log('Reading: '+path.normalize(filepath));
    try{
      id3(path.normalize(filepath), (err, tags)=>{
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
    }
    catch(err){
      callback(err);
    }
  }
}

module.exports = SongFile;