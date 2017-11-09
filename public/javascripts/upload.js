let originalCL = console.log;
console.log = function (obj) {
  originalCL(obj)
  let t = $('#debug').text();
  t += '\n=====\n' + JSON.stringify(obj);
  $('#debug').text(t)
}

let originalCE = console.error;
console.error = function (obj) {
  originalCE(obj)
  let t = $('#debug').text();
  t += '\n== error ===\n' + JSON.stringify(obj);
  $('#debug').text(t)
}
var HOST = 'http://tesa.me:8181'
var u = Math.floor(Math.random() * 1000000);
console.log(u);
$(document).ready(function(){
  loadCid();
  $('#file').attr('disabled', true);
  $('#radio-type-text').prop('checked', true);
});

function loadCid() {
  try {
    var cookie = getCookie('tesaupload');
    cookie = JSON.parse(cookie);
    console.log(cookie);
    // if (cookie.upload) {
    //   cookie = cookie.upload;
    // } else {
    //   return false;
    // }
    if (cookie.cid && cookie.token) {
      $('#cid').val(cookie.cid)
      $('#token-upload').val(cookie.token)
      refreshCountDown(cookie.cid, cookie.token, 'upload');
      if (countDownData.upload.refreshInterval) {
          clearInterval(countDownData.upload.refreshInterval)
        }
        countDownData.upload.refreshInterval = setInterval(function () {
          // console.log('refreshCountDown upload');
          refreshCountDown(cookie.cid, cookie.token, 'upload');
        }, 5000)
      return true;
    }
    return false;
  } catch (e) {
    // console.log(e);
    // refreshCid();
    return false;
  }
}

function refreshCidHandler(evt) {
  refreshCid()
}

var countDownData = {
  upload: {
    remainingSecs: 0,
    interval: null,
    refreshInterval: null
  },
  download: {
    remainingSecs: 0,
    interval: null,
    refreshInterval: null
  }
};

function refreshCid() {
  $.ajax({
    // url: '/id',
    url: `${HOST}/getcode?u=${u}`,
    type: 'GET',
    success: function (res) {
      // if (res.status == 'success') {
      //   $('#cid').val(res.id)
      // } else {
      //   console.log(res);
      //   alert('Có lỗi xảy ra')
      // }
      try {
        res = JSON.parse(res);
        console.log(res);
        $('#cid').val(res.code);
        $('#token-upload').val(res.token);
        refreshCountDown(res.code, res.token, 'upload');
        if (countDownData.upload.refreshInterval) {
          clearInterval(countDownData.upload.refreshInterval)
        }
        countDownData.upload.refreshInterval = setInterval(function () {
          // console.log('refreshCountDown upload');
          refreshCountDown(res.code, res.token, 'upload');
        }, 5000)
      } catch (e) {
        console.log(e);
        alert('Có lỗi xảy ra')
      }
    },
    error: function (err) {
      console.log(err);
      try {
        var err = JSON.parse(err.responseText);
        alert(err.error)
      } catch (e) {
        alert('Có lỗi xảy ra.')
        console.log(e);
      }
    }
  })
}

function refreshCountDown(code, token, action) {
  if (['upload', 'download'].indexOf(action) < 0) {
    return console.log('invalid action', action);
  }
  // console.log('refreshCountDown ' + action);
  getRemainingSecs(token, function (secs) {
    secs = parseInt(secs);
    if (!Number.isInteger(secs) || (secs < 0)) {
      return;
    }
    countDownData[action].remainingSecs = secs;
    if (countDownData[action].interval) {
      clearInterval(countDownData[action].interval)
    }
    countDownData[action].interval = null;
    (action == 'upload') ? countDownUpload() : countDownDownload();
    countDownData[action].interval = setInterval((action == 'upload') ? countDownUpload : countDownDownload, 1000);
    if (action == 'upload') {
      // console.log('now set tesaupload');
      setCookie('tesaupload', JSON.stringify({cid: code, token: token}), (secs + 30) / 86400)
    } else {
      // console.log('now set tesadownload');
      setCookie('tesadownload', JSON.stringify({cid: code, token: token}), (secs + 30) / 86400)
    }
  })
}

function getRemainingSecs(token, cb) {
  // console.log('get secs ' + token);
  $.ajax({
    url: `${HOST}/check?u=1&o=${token}`,
    type: 'GET',
    success: function (secs) {
      // console.log(secs);
      secs = parseInt(secs);
      if (Number.isInteger(secs) && (secs > 0)) {
        cb(secs)
      }
    },
    error: function (err) {
      console.log(err);
    }
  })
}

function countDownUpload() {
  countDown('upload');
}

function countDown(action) {
  if (['upload', 'download'].indexOf(action) < 0) {
    return console.log('invalid action', action);
  }
  var secs = countDownData[action].remainingSecs;
  if (Number.isInteger(secs) && (secs > 0)) {
    $(`#remaining-time-${action}`).fadeIn(0);
    $(`#remaining-time-${action}`).text(secs);
    countDownData[action].remainingSecs--;
  } else {
    countDownData[action].remainingSecs = 0;
    $(`#remaining-time-${action}`).fadeOut(0);
    $(`#remaining-time-${action}`).text(0);
  }
}

var type = 'text';
function selectType(radio) {
  var val = radio.value;
  switch (val) {
    case 'text':
      $('#text').attr('disabled', false);
      $('#file').attr('disabled', true);
      $('#wrap-file').fadeOut(1);
      $('#wrap-text').fadeIn(200);
      type = 'text'
      break;
    case 'file':
      $('#text').attr('disabled', true);
      $('#file').attr('disabled', false);
      $('#wrap-text').fadeOut(1);
      $('#wrap-file').fadeIn(200);
      type = 'file';
      break;
    default: 
      alert('Đừng nghịch')
      return;
  }
}

function submitForm() {
  if (!$('#token-upload').val()) {
    return alert('Invalid code')
  }
  console.log('btn clicked');
  var fd = new FormData(document.getElementById('form-upload'));
  switch (type) {
    case 'text':
      try {
        fd.delete('file')
      } catch (e) {
        console.error(e);
      }
      break;
    case 'file':
      try {
        fd.delete('text')
      } catch (e) {
        console.error(e);
      }
      break;
    default:
      alert('cc');
      return;
  }
  var urlUpload = `${HOST}/data?u=${u}&o=${$('#token-upload').val()}&t=${type == 'text' ? 0 : 1}`;
  // var urlUpload = '/debug';
  console.log(urlUpload);
  $('#circle-progress-upload').circleProgress({
    value: 0,
    size: 80,
    fill: {
      gradient: ["green"]
    },
    animation: false
  })
  $('#circle-progress-upload').fadeIn(10);
  // $.ajax({
  //   // url: '/upload',
  //   url: `http://192.168.29.121:8181/data?u=${u}&c=${$('#cid').val()}&t=${type == 'text' ? 0 : 1}`,
  //   type: 'POST',
  //   contentType: false,
  //   mimeType: 'multipart/form-data',
  //   data: fd,
  //   processData: false,
  //   success: function (res) {
  //     console.log(res);
  //     alert('success')
  //   },
  //   error: function (err) {
  //     console.log(err)
  //     alert('error')
  //   }
  // })

  var xhr = new XMLHttpRequest();
  // var xhr = $.ajaxSettings.xhr();
  xhr.onprogress = function (e) {
    // For downloads
    // if (e.lengthComputable) {
    //     $('#circle-progress-upload').circleProgress('value', e.loaded / e.total)
    // }
  };
  xhr.upload.onprogress = function (e) {
    // For uploads
    if (e.lengthComputable) {
      $('#circle-progress-upload').circleProgress('value', e.loaded / e.total)
    }
  };

  xhr.onreadystatechange = function () {
    console.log('readyState ' + xhr.readyState);
    console.log('status ' + xhr.status);
    if ((xhr.readyState == 4) && (xhr.status == 200)){
      // var disposition = xhr.getResponseHeader('Content-Disposition');
      // disposition = decodeURIComponent(disposition);
      console.log('uploaded');
      setTimeout(function () {
        $('#circle-progress-upload').fadeOut(500);
      }, 500)
      try {
        var cookie = getCookie('tesaupload');
        cookie = JSON.parse(cookie);
        console.log(cookie);
        // if (cookie.upload) {
        //   cookie = cookie.upload;
        // } else {
        //   return false;
        // }
        if (cookie.cid && cookie.token) {
          $('#cid').val(cookie.cid)
          $('#token-upload').val(cookie.token)
          refreshCountDown(cookie.cid, cookie.token, 'upload');
          if (countDownData.upload.refreshInterval) {
              clearInterval(countDownData.upload.refreshInterval)
            }
            countDownData.upload.refreshInterval = setInterval(function () {
              // console.log('refreshCountDown upload');
              refreshCountDown(cookie.cid, cookie.token, 'upload');
            }, 5000)
          return true;
        }
      } catch (e) {
        console.log(e);
      }
    } else if (xhr.readyState == 4) {
      console.log(xhr.status);
    }
  }

  xhr.open('POST', urlUpload, true);
  console.log('POST opened');
  if (type == 'text') {
    console.log('set text');
    // xhr.setRequestHeader('Content-Type', 'application/www-x-form-urlencoded')
    xhr.setRequestHeader('Content-Type', 'text/plain')
    // console.log(xhr);
    console.log(fd.get('text'));
    xhr.send(fd.get('text'));
  } else {
    console.log('set file');
    xhr.send(fd);
  }
  // xhr.open('POST', `/upload`, true);
  // xhr.responseType = 'arraybuffer';
  
}