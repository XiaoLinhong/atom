title: 第四章 部署文档
---
@warning 工具是第一生产力

### 简介
ford基于代码中的文档和全局文档，自动生成静态网页（HTML）。这些网页最后需要部署在HTTP服务上，才能进行分享。

有两个部署静态网页的平台值得推荐。

- github pages
- Netlify

### github pages

打开一个仓，按照setting里面的步骤提示一步一步进行基本就可以完成配置。

1. 在设置(setting)里面, 找到pages，并开启
2. 设置要部署的分支；并设置目录，一般为```./docs```
3. 设置域名名称，一般产生的URL为```https://username.github.io/something```
4. 在代码仓中生成docs目录（Fortran里面用ford去做）
5. 把仓推送到GitHub，即可访问文档的URL

高级功能可以查看[GitHub Pages](https://docs.github.com/zh/pages)

### Netlify

[Netlify](https://app.netlify.com/)的部署也是比较简单，

可以使用github账户登录Netlify，有一个引导页面，一步一步操作即可

有以下几项需要注意

1. 用GitHub账号登录Netlify之后，GitHub上面会安装名为Netlify的Application。

2. 在引导页面中Netlify会要求获取账号下面的所有仓的只读访问权限，可以选择只给部分仓的权限。后面需要添加新仓的支持的时候，可以在GitHub上进行设置。也可以点击Netlify中的```Add new site ```中的导入一个新仓，这个操作会弹出一个引导页面，选择GitHub，然后添加账户名下的```Add another organization ```，这样会跳转到
GitHub的Application设置页面。

高级功能可以查看[Netlify 文档](https://docs.netlify.com/)
@note

1. [GitHub Pages](https://docs.github.com/zh/pages)

2. [Netlify 主页](https://app.netlify.com/)

@endnote
