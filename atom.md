---
project: atom
summary: 一个FORTRAN现代化开发的模板仓，展示如何使用软件工程工具进行科学计算开发
author: Linhong Xiao
project_github: https://github.com/XiaoLinhong/atom
page_dir: pages
---

工程化编程思想发展得很快，现在已经进入工具就是一切的时代。

没有现代化的工具去维护一个大型项目越发的变得难以忍受。

FORTRAN作为一个最老的高级语言，被创造的时候只是为了解决一些逻辑相对简单的科学计算问题。作为一编译型语言，FORTRAN的语法非常简单，很容易学习。由于上手容易，解决的问题又很纯粹，FORTRAN程序员从入门开始就很少关注工程化相关工具的使用（早期的时候，根本就没有这些工具），这使得整个社区在使用FORTRAN时，往往不会像传统的软件开发一样注重软件工程相关的问题。经历了快一个世纪的时间，FORTRAN的遗产非常庞大，代码之间的复用也变得很困难。

到目前为止（2024年）**社区仍然没有形成好用的标准库**（比如时间操作、字符串操作、系统相关操作、标记语言操作等，以及常用的数据结构：链表、哈希表等），如果去阅读哪些古老的代码，会发现这些代码的可读性非常低（差不多古老的C语言也存在一样的问题，但是发展除了C++来改善相关处境）。

同时，缺乏标准的单元测试框架，测试只能使用原始的print，这使得代码变得越发的臃肿难看。

现代化的编程活动（思想）包括对**依赖的管理**，**编辑器环境的配置**（如VSCODE），文档自动生成（ford），单元测试，版本管理（git），持续集成（github: workflow），

撰写此文档的目标是展示在写FORTRAN代码的时候，如何使用好现代化的工具。

文档涉及到的工具包括：

- [MAKEFILE](https://fortran-lang.org/learn/building_programs/project_make/)
- [FORTRAN包管理器](https://github.com/fortran-lang/fpm)
- [FORTRAN文档生成工具](https://github.com/Fortran-FOSS-Programmers/ford/wiki)
- [FORTRAN单元测试框架](https://github.com/fortran-lang/test-drive)
- [基于GITHUB的FORTRAN项目持续集成](https://github.com/fortran-lang/test-drive/actions)

文档将以**平流模块（空气污染数值模式）为例**，将所有工具的实践串联起来，中间将会穿插讲解FORTRAN的高级特征，基于GDB的调试，VSCODE的配置，以及[FORTRAN标准库的使用](https://github.com/fortran-lang/stdlib)

@todo
- 使用CMAKE；
- 如何优雅的引入MPI；
- 如何管理异构代码（CUDA，DCU等）
- 如何解决兼容性问题（centos7太老了）
