class TimeUtils{

  static secondsToTimeFormat(seconds, opts){
    if(opts){
      if(opts.noDecimal){
        seconds = Math.floor(seconds);
      }
    }
    let time = '';
    let hours = Math.floor(seconds / 3600);
    if (hours > 0) {
      time += hours + ':';
    }
    seconds = seconds % 3600;
    let minutes = Math.floor(seconds / 60);
    let secs = seconds % 60;
    secs = secs >= 10 ? secs : '0' + secs;
    if (minutes < 10) {
      time += '0' + minutes + ':' + secs;
    } else {
      time += minutes + ':' + secs;
    }
    return time;
  }

}

module.exports = TimeUtils;