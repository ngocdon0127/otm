
// function downloadAll() {
//   console.log(1)
// }

function loadHandler(input) {
  load(input.value);
}
function load(id) {
  // console.log(id);
  // console.log(`http://192.168.29.121:8181/data?u=1&o=${id}`);
  $.ajax({
    // url: `/record/${id}`,
    url: `${HOST}/data?u=1&o=${id}`,
    type: 'GET',
    success: function (res) {
      // console.log(res)
      res = JSON.parse(res);
      $('#download-text').val(res.text)
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
        a.setAttribute('data-download-url', `http://192.168.29.121:8181/static?u=1&o=${id}&f=${res.fileName}`);
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
  });
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
      var disposition = xhr.getResponseHeader('Content-Disposition');
      disposition = decodeURIComponent(disposition);
      var fields = disposition.split([';']);
      console.log(disposition);
      console.log(fields);
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

  xhr.open('GET', a.getAttribute('data-download-url'), true);
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
      $('#id').val(res);
      load(res)
      setInterval(function () {
        // console.log(`loading ${res}`);
        load(res)
      }, 2000)
    },
    error: function (err) {
      console.log(err);
      // alert('error')
    }
  })
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