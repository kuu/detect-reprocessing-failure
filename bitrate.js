const {exec} = require('child_process');
const fetch = require('node-fetch');

function getAvcBitrate(embedCode) {
  return new Promise((resolve, reject) => {
    console.log(`start: ${embedCode}`);

    exec(`casperjs workflow.js 'http://ots-wfe-dashboard.us-east-1.ooyala.com/movie_lookup?embed_code=${embedCode}&environment=prod'`, (err, stdout, stderr) => {
      if (err) {
        console.error(err);
        return resolve(-1);
      }
      if (stdout === '') {
        console.error('Failed to retrieve workflow id');
        return resolve(-1);
      }
      const id = stdout.replace('\n', '');
      // console.log(`Fetch: ${id}`);
      fetch(`http://ots-wfe-dashboard.us-east-1.ooyala.com/workflows/${id}/details?environment=prod`)
      .then(response => {
        return response.text();
      })
      .then(text => {
        const startsAt = text.indexOf('<pre>') + 5;
        const endsAt = text.indexOf('</pre>');
        const jsonText = text.slice(startsAt, endsAt);
        return JSON.parse(jsonText);
      })
      .then(encoderInfo => {
        return(encoderInfo.params.mediainfo);
      })
      .then(mediaInfo => {
        return mediaInfo.File.track;
      })
      .then(tracks => {
        if (tracks instanceof Array === false) {
          console.log('No track info');
          return resolve(-1);
        }
        for (const track of tracks) {
          // console.log(`track.Format=${track.Format}`);
          if (track.Format === 'AVC' || track.Format === 'MPEG Video') {
            if (!track.Bit_rate) {
              console.log('No bitrate info');
              return resolve(-1);
            }
            const br = getBitrate(track.Bit_rate);
            // console.log('resolve' + br);
            return resolve(br);
          }
        }
        console.log('No video track');
        return resolve(-1);
      });
    });
  });
}

function getBitrate(string) {
  let str = string.toLowerCase();
  const idx = str.indexOf('kbps');
  str = str.slice(0, idx);
  str = removeSpace(str);
  return parseFloat(str);
}

function removeSpace(str) {
  const list = [];
  for (const ch of str) {
    if (ch !== ' ') {
      list.push(ch);
    }
  }
  return list.join('');
}

module.exports = getAvcBitrate;
