var fs = require('fs');
var md5 = require('crypto').createHash('md5');
var Buffer = require('buffer').Buffer;
var request = require('request');
var qs = require('querystring');
var path = require('path');

exports.getHash = function (file_path, callback) {
  fs.open(file_path, 'r', function (err, fd) {
    if (err) {
      console.log(err);
      return;
    }

    fs.stat(file_path, function (err, stats) {
      var size = stats.size;
      var readSize = 64 * 1024;
      var buffer = new Buffer(readSize);
      fs.read(fd, buffer, 0, readSize, 0, function (err, bytesRead, buffer) {
        md5.update(buffer);
        fs.read(fd, buffer, 0, readSize, size - readSize, function () {
          md5.update(buffer);
          var hash = md5.digest('hex');
          callback(hash);
        });
      });;
    });
  });
}

exports.download = function (file_path) {
  var dir = path.dirname(file_path);
  var filename = path.basename(file_path, path.extname(file_path));

  var options = {
    action: 'download',
    language: 'en'
  }

  // Get file hash.
  exports.getHash(file_path, function (hash) {
    if (hash) {
      options.hash = hash;

      // Make a call to the api to download the file.
      exports.call(options, function(error, response, body) {

        // Handle error.
        if (response.statusCode == 404) {
          return console.log('File not found. Remember that type is case sensitive.');
        }

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

exports.call = function(params, callback) {
  var options = {
    url: 'http://sandbox.thesubdb.com?',
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
