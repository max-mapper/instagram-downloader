var ig = require('instagram-node')
var async = require('async')
var request = require('request')
var fs = require('fs')
var mkdirp = require('mkdirp')

module.exports = Downloader

function Downloader(opts) {
  var self = this
  var config = {
    "auth": {
      "client_id":"", 
      "client_secret":"", 
      "access_token":""
    }
  }
  
  this.ig = ig.instagram()
  this.output = 'backup'
  
  this.ig.use({ access_token: config.auth.access_token });
  this.ig.use({ client_id: config.auth.client_id,
           client_secret: config.auth.client_secret });
  
  
  if (opts.tag) {
    mkdirp(this.output, function() {
      self.fetchTaggedPhotos(opts.term)
    }) 
  }  
}

Downloader.prototype.fetchTaggedPhotos = function(tag, cb) {
  var self = this
  var q = async.queue(fetch)
  var opts = {}
  
  q.drain = function() {
    if (opts) getPhotos()
    else console.log('all done')
  }

  getPhotos()

  function getPhotos() {
    self.ig.tag_media_recent(tag.replace('#', ''), opts, function(err, medias, pagination, limit) {
      medias.map(function(m) { q.push(m) })
      if (!pagination.next_max_id) {
        opts = false
        return
      }
      opts = {
        max_tag_id: pagination.next_max_id
      }
    })
  }
  function fetch(img, done) {
    var writeStream = fs.createWriteStream(self.output + '/' + img.id + '.jpg')
    request(img.images.standard_resolution.url).pipe(writeStream)
    writeStream.on('error', done)
    writeStream.on('close', done)
  }
}