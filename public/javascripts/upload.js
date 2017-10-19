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
var HOST = 'http://139.59.109.25:8181'
var u = Math.floor(Math.random() * 1000000);
console.log(u);
$(document).ready(function(){
  loadCid();
  $('#file').attr('disabled', true);
  $('#radio-type-text').prop('checked', true);
});

function loadCid() {
  try {
    var cookie = getCookie('tesa');
    cookie = JSON.parse(cookie);
    console.log(cookie);
    if (cookie.cid && cookie.token) {
      $('#cid').val(cookie.cid)
      $('#token-upload').val(cookie.token)
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
        setCookie('tesa', JSON.stringify({cid: res.code, token: res.token}), 7)
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
    if ((xhr.readyState == 4) && (xhr.status == 200)){
      // var disposition = xhr.getResponseHeader('Content-Disposition');
      // disposition = decodeURIComponent(disposition);
      console.log('uploaded');
      setTimeout(function () {
        $('#circle-progress-upload').fadeOut(500);
      }, 500)
    } else if (xhr.readyState == 4) {
      console.log(xhr.status);
    }
  }

  xhr.open('POST', urlUpload, true);
  // xhr.open('POST', `/upload`, true);
  // xhr.responseType = 'arraybuffer';
  xhr.send(fd);
}