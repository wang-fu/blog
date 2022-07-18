
const fs = require('fs');
const path = require('path');
module.exports = (options, ctx) => {
  const fileMap = {}
  return {
    async generated(pagePaths) {
      // url 已经全部变成 yaer-month-xx 的形式。
      // 每次构建同时生成一份兼容旧 url 的文件，防止外链 404 
      pagePaths.forEach(element => {
        const filename = path.basename(element);
        if (fileMap[filename]) {
          const oldpath = fileMap[filename].old + filename;
          const absolutePath = path.resolve('./docs/.vuepress/dist', '.' + oldpath)
          ensureDirectoryExistence(absolutePath);
          console.log('copy: ' + element + '  to->' + absolutePath);
          fs.copyFile(element, absolutePath, (err) => {
            if (err) {
              console.error(err);
            }
          })
        }
      });
    },
    extendPageData($page) {
      const {
        regularPath,         // 当前页面遵循文件层次结构的默认链接
      } = $page
      const filename = path.basename(regularPath);
      if (filename) {
        const folder = regularPath.split(filename)[0];
        fileMap[filename] = {
          old: folder
        }
      }
    }
  }
}


function ensureDirectoryExistence(filePath) {
  var dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) {
    return true;
  }
  ensureDirectoryExistence(dirname);
  fs.mkdirSync(dirname);
}