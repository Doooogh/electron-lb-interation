const path = require('path')
const fs = require('fs')
const request = require('request');
const os = require('os'); 

var StreamDownload = {
  downloadCallback:null,
  showProgress:function (received, total) {
    const percentage = (received * 100) / total;
    // 用回调显示到界面上
    StreamDownload.downloadCallback('progress', percentage);
  },
  downloadFile:function (patchUrl, baseDir,fileName, callback) {
    StreamDownload.downloadCallback = callback; // 注册回调函数
    const downloadFile = fileName; // 下载文件名称，也可以从外部传进来
    let receivedBytes = 0;
    let totalBytes = 0;

    const req = request({
      method: 'GET',
      uri: patchUrl
    });

    const out = fs.createWriteStream(path.join(baseDir, downloadFile));
    req.pipe(out);

    req.on('response', (data) => {
      // 更新总文件字节大小
      totalBytes = parseInt(data.headers['content-length'], 10);
    });

    req.on('data', (chunk) => {
      // 更新下载的文件块字节大小
      receivedBytes += chunk.length;
      StreamDownload.showProgress(receivedBytes, totalBytes);
    });

    req.on('end', () => {
      console.log('下载已完成，等待处理');
      // TODO: 检查文件，部署文件，删除文件
      StreamDownload.downloadCallback('finished', 100);
    });
  }
}


module.exports = StreamDownload