const http = require('http');
const fs = require('fs');
const axios = require('axios');
const CacheableLookup = require('cacheable-lookup');

// Increase the number of max sockets to that thread
http.globalAgent.maxSockets = 100;

// Create a new instance of CacheableLookup
const cacheable = new CacheableLookup();

// Install cacheable-lookup on the global agent
cacheable.install(http.globalAgent);

const jsonData = require('./propertyphoto.json');

// Download a bunch of images using stream and parallel 
async function downloadImages(jsonData) {
  const downloadPromises = jsonData.map(async (item) => {
    const downloading = 0;
    const imageURL = item.url;
    const imageKey = item.image_key;
    const parentId = item['_parent._id'];
    const imageFileName = `image_key=${imageKey}_parentId=${parentId}.jpg`; // Adjust the file name as per your requirement
    console.log(`Downloading ${++downloading}`);

    // Create a folder to store the downloaded images
    if (!fs.existsSync('images')) {
      fs.mkdirSync('images');
    }

    const writer = fs.createWriteStream(`images/${imageFileName}`);
    const response = await axios({
      url: imageURL,
      method: 'GET',
      responseType: 'stream',
      lookup: cacheable.lookup, // Use cacheable-lookup for DNS lookup
    });

    response.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });

    console.log(`Downloaded image: ${imageFileName}`);
  });

  await Promise.all(downloadPromises);
}

downloadImages(jsonData)
  .then(() => {
    console.log('All images downloaded successfully!');
  })
  .catch((error) => {
    console.error('Error occurred while downloading images:', error);
  });
