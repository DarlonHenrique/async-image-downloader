const http = require('http')
const fs = require('fs')
// increase the num of max sockets to that thread
http.globalAgent.maxSockets = 100

const jsonData = require('./propertyphoto.json')

// download a bunch of images using stream and parallel 
async function downloadImages(jsonData) {
  const downloadPromises = jsonData.map(async (item) => {
    const imageURL = item.url;
    const imageKey = item.image_key;
    const parentId = item["_parent._id"]
    const imageFileName = `image_key=${imageKey}_parentId=${parentId}.jpg`; // Adjust the file name as per your requirement

    const writer = fs.createWriteStream(imageFileName);
    const response = await axios({
      url: imageURL,
      method: 'GET',
      responseType: 'stream',
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