title: 第二章 包管理器
---

@warning 万丈高楼平地起

### 简介

[fpm（Fortran Package Manager）](https://github.com/fortran-lang/fpm)是一个专门为Fortran语言设计的包管理工具，旨在简化Fortran项目的依赖管理、构建和发布过程。

主要特点和优势：

1. 简化的依赖管理：fpm允许Fortran项目定义和管理依赖关系，可以轻松地引入和使用外部库和模块，而无需手动下载和配置。


2. fpm 鼓励采用现代化的项目结构，例如使用模块化的源代码组织方式，这有助于提高代码的可维护性和可扩展性。


3. 易于使用的命令行界面：fpm 提供了简单明了的命令行界面，使得项目的构建、测试和发布过程更加方便和高效。


4. fpm 支持集成测试，可以帮助开发者编写和运行测试用例，确保代码的质量和稳定性。

***

### 使用fpm的基本流程

***

* 初始化一个新项目

```bash
fpm new ppm
```

* 编辑项目描述文件

```toml
name = "ppm"
version = "0.1.0"
license = "license"
author = "xiaolh"
maintainer = "xiaolh@3clear.com"
copyright = "Copyright 2024, xiaolh"

[build]
auto-executables = true
auto-tests = true
auto-examples = true
module-naming = false

[install]
library = false

[fortran]
implicit-typing = false
implicit-external = false
source-form = "free"

[dependencies]
stdlib = "*"

[dev-dependencies]
test-drive.git = "https://github.com/fortran-lang/test-drive"
test-drive.tag = "v0.4.0"
```

* 构建和测试项目

```bash
fpm build
fpm test
```

@note

- [fpm手册](https://fpm.fortran-lang.org/)
@endnote
