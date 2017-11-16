
// function downloadAll() {
//   console.log(1)
// }

var loadInterval = null;

function loadHandler(input) {
  load(input.value);
}

function loadFromCookie() {
  try {
    var cookie = getCookie('tesadownload');
    cookie = JSON.parse(cookie);
    console.log(cookie);
    if (cookie.cid && cookie.token) {
      load(cookie.token);
      try {
        clearInterval(loadInterval);
      } catch (e) {
        console.log(e);
      }
      loadInterval = setInterval(function () {
        // console.log(`loading ${res}`);
        load(cookie.token)
      }, 2000)
      $('#c').val(cookie.cid)
      // $('#token-upload').val(cookie.token)
      refreshCountDown(cookie.cid, cookie.token, 'download');
      if (countDownData.download.refreshInterval) {
          clearInterval(countDownData.download.refreshInterval)
        }
        countDownData.download.refreshInterval = setInterval(function () {
          // console.log('refreshCountDown download');
          refreshCountDown(cookie.cid, cookie.token, 'download');
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

loadFromCookie();

function load(id) {
  // console.log('load ' + id);
  // console.log(`http://192.168.29.121:8181/data?u=1&o=${id}`);
  $.ajax({
    // url: `/record/${id}`,
    url: `${HOST}/data?u=1&o=${id}`,
    type: 'GET',
    success: function (res) {
      // console.log(res)
      res = JSON.parse(res);
      var oldText = $('#download-text').val()
      // console.log(oldText);
      if (!oldText || oldText.localeCompare(res.text)) {
        $('#download-text').val(res.text)
        $('#download-text').text(res.text)
      }
      
      if (dtextResizeHandler) {
        dtextResizeHandler();
      }
      document.getElementById('list-attachments').innerHTML = ''
      // if (res.attachments instanceof Array) {
      //   for(var i = 0; i < res.attachments.length; i++) {
      //     var a = document.createElement('a');
      //     a.href = '#';
      //     a.setAttribute('class', 'list-group-item');
      //     a.setAttribute('data-download-url', '/dl/' + res.attachments[i].filename);
      //     a.setAttribute('data-original-name', res.attachments[i].originalname);
      //     a.addEventListener('click', downloadHandler);
      //     a.innerHTML = res.attachments[i].originalname;
      //     document.getElementById('list-attachments').appendChild(a)
      //   }
      // }
      if (res.fileName) {
        var a = document.createElement('a');
        a.href = '#';
        a.setAttribute('class', 'list-group-item');
        a.setAttribute('data-download-url', `${HOST}/static?u=1&o=${id}&f=${res.fileName}`);
        a.setAttribute('data-static-url', `${HOST}/${id}/${res.fileName}`);
        a.setAttribute('data-original-name', res.fileName);
        a.addEventListener('click', downloadHandler);
        a.innerHTML = (res.fileName.length < 50) ? res.fileName : (res.fileName.substring(0, 50) + '... ' + res.fileName.substring(res.fileName.lastIndexOf('.')));
        document.getElementById('list-attachments').appendChild(a)
        console.log('inserted');
      }
    },
    error: function (err) {
      console.log(err);
      try {
        var err = JSON.parse(err.responseText);
        console.log(err);
        // alert(err.error)
      } catch (e) {
        // alert('Có lỗi xảy ra.')
        console.log(e);
      }
    }
  })
}

function downloadHandler(evt) {
  console.log(evt.target);
  var iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  return window.open(evt.target.getAttribute('data-static-url')) // waiting for Spark to allow Content-Length in reponse static files
  if (iOS) {
    return window.open(evt.target.getAttribute('data-static-url'))
  }
  download(evt.target)

}

function download(a) {
  $('#circle-progress-download').circleProgress({
    value: 0,
    size: 80,
    fill: {
      gradient: ["green"]
    },
    animation: false
  })
  $('#circle-progress-download').fadeIn(10);
  var xhr = new XMLHttpRequest();
  // var xhr = $.ajaxSettings.xhr();
  xhr.onprogress = function (e) {
    // For downloads
    if (e.lengthComputable) {
        $('#circle-progress-download').circleProgress('value', e.loaded / e.total)
    }
  };
  xhr.upload.onprogress = function (e) {
    // For uploads
    if (e.lengthComputable) {
    }
  };

  xhr.onreadystatechange = function () {
    if ((xhr.readyState == 4) && (xhr.status == 200)){
      // var disposition = xhr.getResponseHeader('Content-Disposition');
      // disposition = decodeURIComponent(disposition);
      // var fields = disposition.split([';']);
      // console.log(disposition);
      // console.log(fields);
      var fileName = a.getAttribute('data-original-name');
      fileName = fileName.replace(/[^a-zA-Z]+$/g, '');
      var type = xhr.getResponseHeader('Content-Type');
      // console.log(type);
      var blob = new Blob([xhr.response], {type: type});
      saveAs(blob, fileName);
      setTimeout(function () {
        $('#circle-progress-download').fadeOut(500);
      }, 500)
      // arr[index].checked = false;
      // progressBar.style.width = (index + 1) / totalFile * 100 + '%';
      // progressBar.innerHTML = (index + 1) + ' / ' + totalFile;
      // progressBar.setAttribute('aria-valuenow', index);
      // if (index >= totalFile - 1){
      //   setTimeout(function () {
      //     $(progressBarContainer).fadeOut(1000);
      //   }, 500)
      // }
      // setTimeout(function () {
      //   download(index + 1, fields_form);
      // }, 100);
    }
  }

  xhr.open('GET', a.getAttribute('data-static-url'), true);
  xhr.responseType = 'arraybuffer';
  xhr.send();
}

function connectHandler(btn) {
  connect(btn.value);
}

function connect(c) {
  // console.log(`http://192.168.29.121:8181/connect?u=1&c=${c}`);
  $.ajax({
    url: `${HOST}/connect?u=1&c=${c}`,
    type: 'GET',
    success: function (res) {
      // console.log(res);
      setCookie('tesadownload', JSON.stringify({cid: c, token: res}), 1)
      // refreshCountDown(c, res, 'download');
      // $('#glyphicon-ok').removeClass('text-danger')
      $('#btn-connect').removeClass('btn-danger')
      $('#btn-connect').html('<span>Connected</span>')
      $('#c').css('border', '');
      $('#err-msg').fadeOut(0)
        // $('#glyphicon-ok').addClass('text-success')
      $('#btn-connect').addClass('btn-success')
      $('#id').val(res);
      load(res)
      try {
        clearInterval(loadInterval);
      } catch (e) {
        console.log(e);
      }
      loadInterval = setInterval(function () {
        // console.log(`loading ${res}`);
        load(res)
      }, 2000)
      try {
        var cookie = getCookie('tesadownload');
        // console.log(cookie);
        cookie = JSON.parse(cookie);
        if (!cookie.token) {
          return;
        }
        // console.log(cookie.token, 'now countDown');
        // getRemainingSecs(cookie.token, function (secs) {
        //   countDownData.download.remainingSecs = secs;
        //   if (countDownData.download.interval) {
        //     clearInterval(countDownData.download.interval)
        //   }
        //   countDownData.download.interval = null;
        //   countDownDownload();
        //   countDownData.download.interval = setInterval(countDownDownload, 1000);
        // })
        refreshCountDown(cookie.cid, cookie.token, 'download');
        if (countDownData.download.refreshInterval) {
          clearInterval(countDownData.download.refreshInterval)
        }
        // console.log('set interval download');
        countDownData.download.refreshInterval = setInterval(function () {
          // console.log('refreshCountDown download');
          refreshCountDown(cookie.cid, cookie.token, 'download');
        }, 5000)
      } catch (e) {
        console.log(e);
      }
    },
    error: function (err) {
      // $('#glyphicon-ok').removeClass('text-success')
      $('#btn-connect').removeClass('btn-success')
      $('#btn-connect').html('<span>Connect</span>')
      $('#err-msg').fadeIn(0)
      $('#err-msg').text(err.responseText);
      $('#c').css('border', '1px solid #a94442');
      // $('#glyphicon-ok').addClass('text-danger')
      $('#btn-connect').addClass('btn-danger')
      console.log(err);
      try {
        clearInterval(loadInterval);
      } catch (e) {
        console.log(e);
      }
      // alert('error')
    }
  })
}

function countDownDownload() {
  countDown('download');
}

// $('#circle-progress-download').circleProgress({
//     value: 0,
//     size: 80,
//     fill: {
//       gradient: ["green"]
//     },
//     animation: false
//   });
//   $('#circle-progress-download').fadeIn(10);