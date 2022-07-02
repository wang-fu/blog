#!/usr/bin/env sh

# 确保脚本抛出遇到的错误
set -e

# 生成静态文件
npm run dist

# 进入生成的文件夹
cd docs/.vuepress/dist

# 如果是发布到自定义域名
# echo 'www.example.com' > CNAME

git config --global user.email "wangfu@@foxmail.com"
git config --global user.name "fly"
git add -A
git commit -m 'deploy'

echo '文章推送到 github pages中...'

# git push origin `git subtree split --prefix=docs/.vuepress/dist master`:gh-pages --force

# 如果发布到 https://<USERNAME>.github.io/<REPO>
git push docs/.vuepress/dist gh-pages
cd -