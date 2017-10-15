var express = require('express');
var router = express.Router();
const fs = require('fs');
const fsE = require('fs-extra');
const path = require('path');
const CryptoJS = require('crypto-js');
const multer               = require('multer');
const UPLOAD_DESTINATION   = 'public/uploads';
var upload               = multer({dest: UPLOAD_DESTINATION});

/* GET home page. */
router.get('/', function(req, res, next) {
  let data = JSON.parse(fs.readFileSync(path.join(__dirname, '../db.json')));
  res.render('index', { title: 'Express', records: data });
});

router.get('/upload', (req, res) => {
  return res.render('upload')
})

router.get('/download', (req, res) => {
  return res.render('download')
})

router.get('/download/:id', (req, res) => {
  let data = JSON.parse(fs.readFileSync(path.join(__dirname, '../db.json')));
  if (!(req.params.id in data)) {
    return res.status(400).json({
      status: 'error',
      error: 'Invalid ID'
    })
  }
  return res.render('download', {id: req.params.id});
})

router.get('/id', (req, res, next) => {
  let str = (new Date()).getTime() + '_' + Math.random() * 1000000;
  return res.status(200).json({
    status: 'success',
    id: CryptoJS.MD5(str).toString()
  })
})

router.post('/upload', upload.fields([{name: 'attachments'}]), (req, res) => {
  console.log(req.body);
  console.log(req.files);
  let data = JSON.parse(fs.readFileSync(path.join(__dirname, '../db.json')));
  if (req.body.id in data) {
    return res.status(400).json({
      status: 'error',
      error: 'This id is taken'
    })
  }
  let element = {
    text: req.body.text,
    attachments: req.files.attachments
  }
  data[req.body.id] = element;
  fs.writeFileSync(path.join(__dirname, '../db.json'), JSON.stringify(data, null, 4))
  return res.status(200).json({
    status: 'success',
    element: element
  })
})

router.get('/record/:id', (req, res) => {
  let data = JSON.parse(fs.readFileSync(path.join(__dirname, '../db.json')));
  if (req.params.id in data) {
    return res.status(200).json({
      status: 'success',
      text: data[req.params.id].text,
      attachments: data[req.params.id].attachments,
    })
  } else {
    return res.status(400).json({
      status: 'error',
      error: 'invalid id'
    })
  }
})

router.get('/dl/:filename', (req, res) => {
  if (fs.existsSync(path.join(__dirname, '../public/uploads', req.params.filename))) {
    return res.download(path.join(__dirname, '../public/uploads', req.params.filename))
  }
  return res.status(404).json({
    status: 'error',
    error: 'File not found'
  })
})



module.exports = router;
