const getAvcBitrate = require('./bitrate');
const assets = require('./assets.json');

report(assets);

async function report(list) {
  try {
    await reportList(list);
  } catch (err) {
    console.error(err.stack);
  }
}

async function reportList(list) {
  for (const asset of list) {
    await reportAsset(asset);
  }
}

function reportAsset(asset) {
  return getAvcBitrate(asset)
  .then(bitrate => {
    if (bitrate > 0 && bitrate < 1000) {
      console.log(`${asset} : Bit_rate => ${bitrate} kbps`);
    }
  });
}
