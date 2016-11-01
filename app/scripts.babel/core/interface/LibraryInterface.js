class LibraryInterface{
  constructor(){
    this.librarySongTemplate = document.querySelector('#librarySongElement');
  }

  static displaySong(song, container){
    let content = document.importNode(this.librarySongTemplate.content, true);

    let songDiv = content.querySelector('.librarySongElement');
    songDiv.dataset.songId = song.folder + '#' + song.filename;
    let artistDiv = content.querySelector('.librarySongElementArtist');
    artistDiv.innerText = song.artist;
    let albumDiv = content.querySelector('.librarySongElementAlbum');
    albumDiv.innerText = song.album;
    let titleDiv = content.querySelector('.librarySongElementTitle');
    titleDiv.innerText = song.title;
    container.appendChild(content);
  }
}

export default {LibraryInterface};