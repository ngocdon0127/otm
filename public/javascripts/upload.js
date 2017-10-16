var u = Math.floor(Math.random() * 1000000);
console.log(u);
$(document).ready(function(){
  $.ajax({
    // url: '/id',
    url: `http://192.168.29.121:8181/getcode?u=${u}`,
    type: 'GET',
    success: function (res) {
      // if (res.status == 'success') {
      //   $('#cid').val(res.id)
      // } else {
      //   console.log(res);
      //   alert('Có lỗi xảy ra')
      // }
      console.log(res);
      $('#cid').val(res)
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
  $('#file').attr('disabled', true);
  $('#radio-type-text').prop('checked', true);
});
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
  var fd = new FormData(document.getElementById('form-upload'));
  switch (type) {
    case 'text':
      fd.delete('file')
      break;
    case 'file':
      fd.delete('text');
      break;
    default:
      alert('cc');
      return;
  }
  console.log(`http://192.168.29.121:8181/data?u=${u}&c=${$('#cid').val()}&t=${type == 'text' ? 0 : 1}`);
  $('#circle-progress').circleProgress({
    value: 0,
    size: 80,
    fill: {
      gradient: ["green"]
    },
    animation: false
  });
  $('#circle-progress').fadeIn(10);
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
    //     $('#circle-progress').circleProgress('value', e.loaded / e.total)
    // }
  };
  xhr.upload.onprogress = function (e) {
    // For uploads
    if (e.lengthComputable) {
      $('#circle-progress').circleProgress('value', e.loaded / e.total)
    }
  };

  xhr.onreadystatechange = function () {
    if ((xhr.readyState == 4) && (xhr.status == 200)){
      // var disposition = xhr.getResponseHeader('Content-Disposition');
      // disposition = decodeURIComponent(disposition);
      // var fields = disposition.split([';']);
      // console.log(disposition);
      // console.log(fields);
      // var fileName = a.getAttribute('data-original-name');
      // fileName = fileName.replace(/[^a-zA-Z]+$/g, '');
      // var type = xhr.getResponseHeader('Content-Type');
      // // console.log(type);
      // var blob = new Blob([xhr.response], {type: type});
      // saveAs(blob, fileName);
      setTimeout(function () {
        $('#circle-progress').fadeOut(500);
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

  xhr.open('POST', `http://192.168.29.121:8181/data?u=${u}&c=${$('#cid').val()}&t=${type == 'text' ? 0 : 1}`, true);
  // xhr.open('POST', `/upload`, true);
  // xhr.responseType = 'arraybuffer';
  xhr.send(fd);
}