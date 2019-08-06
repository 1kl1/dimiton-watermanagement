const functions = require('firebase-functions');
const firebase = require('firebase-admin');
const express = require('express');
var url = require('url');
const querystring = require('querystring');

const app = express();

globalusage = {};
totalUsage= {
  F9ghp4qJ3Vgxl7MRaA9A4RBmAV63:0,
  zzbe4Ncc8XXcax72aOul8gpf4ID3:0,
  msWcpzXyXqdt5nCT6FRc2sqfT0s1:0
};

Date.prototype.yyyymmdd = function() {
  var mm = this.getMonth() + 1;
  var dd = this.getDate();

  return [this.getFullYear(),
          (mm>9 ? '' : '0') + mm,
          (dd>9 ? '' : '0') + dd
         ].join('');
};
Date.prototype.hhmm = function(){
  var hh = this.getHours();
  var mm = this.getMinutes();

  return [
      (hh>9 ? '' : '0') + hh+9,
      (mm>9 ? '' : '0') + mm
  ].join('');
}


const firebaseApp= firebase.initializeApp(
    functions.config().firebase
);
var database = firebaseApp.database();

function writeNewPost(hash,id,timestamp,time,usage) {
  if(globalusage.hasOwnProperty(time)){
    globalusage[time] += Number(usage);
  }
  else{
    globalusage = {0:0};
    globalusage[time] = 0;
    globalusage[time] += Number(usage);
  }
  // A post entry.
  totalUsage[hash]+=Number(usage);
     var postData = {
      data : globalusage[time]
    };
    var postdata2 = {
      data:totalUsage[hash]
    }
    

  // Get a key for a new Post.

  // Write the new post's data simultaneously in the posts list and the user's post list.
  var updates = {};
  updates['/users/' + hash + '/home/' + id + '/usage/'+timestamp+'/'+time] = postData;
  updates['/users/' + hash + '/home/' + id + '/totalusage'] = postdata2;

  return firebase.database().ref().update(updates);
}


app.get('/',(request,response)=>{
    var fullUrl = request.protocol + '://' + request.get('host') + request.originalUrl;
    parsedobj = url.parse(fullUrl);
    parsedobj = querystring.parse(parsedobj.query);
    //?id=showerhead1&usage=<DATA>
    d_ = new Date();
    var uidref = firebase.database().ref('usinginfo');
    uidref.on('value', function(snapshot) {
      writeNewPost(snapshot.val()[parsedobj.id],parsedobj.id,d_.yyyymmdd(),d_.hhmm(),parsedobj.usage);
      response.send('ACK');
    }); 
  
});

exports.app = functions.https.onRequest(app);
