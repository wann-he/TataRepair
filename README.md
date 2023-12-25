# 项目说明
逛github时发现[原项目](https://github.com/Minori-ty/mp4To4K-rust)，但下载发现无法使用，故自己在原项目基础上做了优化再开发  
项目基于 ffmpeg 和 Real-ESRGAN 模型，将动漫视频转成4K视频，也可以单独修复低清图片  
## 技术栈
- tauri
- rust
- vue3
- typescript
## 计划工作
- 长视频分割为短视频再进行修复、合并

# 开发相关
## 开发
1. 下载or克隆代码  
2. 下载`ffmpeg` 的可执行文件放在 `src-tauri/bin/ffmpeg`目录下  
3. 下载`realesrgan`训练好的模型放在 `src-tauri/bin/realesrgan`目录下  
4. 导入依赖：`npm install`  
5. 运行：`npm run tauri:dev`
## 打包
运行 `npm run tauri:build`  
打包完成后可以`src-tauri/target`目录下找到相关文件：
- `release/`目录下有可行的.exe文件
- `release/bundle/msi/`目录下有windows系统下的.msi安装程序  
  

# 其他
- *当前只配置了windows系统下的打包配置，更多配置及相关技术资料参见 [tauri官方文档](https://tauri.app/zh-cn/)*  
- *realesrgan 相关模型适用于动漫动画相关的画面修复，在其他类型视频上可能表现不尽如意*  
- *如果不知道相关配置含义，使用默认选项就可以*  
- *视频任务比较依赖硬件环境，在另一个项目的readme中其作者写到5秒的视频放大4倍，运行时间在5-8分钟，具体配置未知*  
- *视频任务比较依赖硬件环境，如果电脑配置一般请谨慎选择“多线程”执行，容易造成电脑死机* 
- *实测在6核16G的win11电脑上，2倍放大一个5s、360P视频，多线程数5，需要2min+*

# 开源说明
本软件使用了基于GPL协议的 [ffmpeg](https://github.com/FFmpeg/FFmpeg) 和基于BSD协议的 [Real-ESRGAN](https://github.com/xinntao/Real-ESRGAN),两个均是开源可商用协议。本软件开源免费、非商用, 仅供学习和日常使用。软件没有任何联网程序, 没有任何读取隐私的程序。

