#!/bin/bash
# 아티팩트(미리보기)용 파일: 사이트 빌드 결과에서 광고만 뺌
set -e
python3 /home/claude/seedweb/tools/build_site.py >/dev/null
A=/home/claude/seedweb/artifact; P=/home/claude/seedjido-repo/public
rm -rf $A; mkdir -p $A/jigsaw
sed -e 's#<script async src="https://pagead2[^>]*></script>##' $P/index.html > $A/index.html
cp $P/app.js $P/style.css $P/seed.wasm $P/favicon.png $A/; cp $P/jigsaw/*.json $A/jigsaw/
ls $A $A/jigsaw
