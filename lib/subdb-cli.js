var fs = require('fs')
  , md5 = require('crypto').createHash('md5')
  , Buffer = require('buffer').Buffer
  , request = require('request')
  , qs = require('querystring')
  , path = require('path')
  ;

/**
 * Downloads a subtitle for a video file.
 *
 * @param file_path
 *  The path to the video file.
 * @param language
 *  The language of the subtitle.
 */
exports.download = function (file_path, language) {
  var dir = path.dirname(file_path);
  var filename = path.basename(file_path, path.extname(file_path));

  var options = {
    action: 'download',
    language: language
  }

  // Get file hash.
  exports.getHash(file_path, function (hash) {
    if (hash) {
      options.hash = hash;

      // Make a call to the api to download the file.
      exports.call(options, function(error, response, body) {

        // Handle error.
        if (response.statusCode == 404) {
          return console.log('Error: Subtitle not found.');
        }

        // Write to a file if success.
        if (!error && response.statusCode == 200) {
          fs.writeFile(dir + '/' + filename + '.srt', body, 'utf8', function (err) {
            if (err) return console.log(err);

            // Show a success message.
            console.log('Successfully downloaded subtitle for ' + filename + '.');
          });
        }
      });
    }
  })
}

/**
 * Returns an md5 hash for a file.
 *
 * Reads the first and last 64k of a video file and creates an md5 hash.
 *
 * @param file_path
 *  The path to the file.
 * @param callback
 *  Callback.
 */
exports.getHash = function (file_path, callback) {
  fs.open(file_path, 'r', function (err, fd) {
    if (err) {
      console.log(err);
      return;
    }

    fs.stat(file_path, function (err, stats) {
      // Get file size.
      var size = stats.size;

      // Set readSize to 64kb.
      var readSize = 64 * 1024;

      // Create a buffer.
      var buffer = new Buffer(readSize);

      // Read the first 64k of the video file.
      fs.read(fd, buffer, 0, readSize, 0, function (err, bytesRead, buffer) {
        md5.update(buffer);

        // Read the last 64kb.
        fs.read(fd, buffer, 0, readSize, size - readSize, function () {

          // Create a hash.
          md5.update(buffer);
          var hash = md5.digest('hex');

          callback(hash);
        });
      });;
    });
  });
}

/**
 * Helper function for api calls.
 *
 * @param params
 *  Params to pass to the api url.
 * @param callback
 */
exports.call = function(params, callback) {
  var options = {
    url: 'http://api.thesubdb.com?',
    headers: {
      'User-Agent': 'SubDB/1.0 (Subdb/0.1.0; http://github.com/arshad/subdb)'
    }
  };

  // Add params to url.
  options.url += qs.stringify(params);

  request(options, function(error, response, body) {
    callback(error, response, body);
  });
}
