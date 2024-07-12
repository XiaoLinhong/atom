var tipuesearch = {"pages":[{"title":" atom ","text":"atom 工程化编程思想发展得很快，现在已经进入工具就是一切的时代。 没有现代化的工具去维护一个大型项目越发的变得难以忍受。 FORTRAN作为一个最老的高级语言，被创造的时候只是为了解决一些逻辑相对简单的科学计算问题。作为一编译型语言，FORTRAN的语法非常简单，很容易学习。由于上手容易，解决的问题又很纯粹，FORTRAN程序员从入门开始就很少关注工程化相关工具的使用（早期的时候，根本就没有这些工具），这使得整个社区在使用FORTRAN时，往往不会像传统的软件开发一样注重软件工程相关的问题。经历了快一个世纪的时间，FORTRAN的遗产非常庞大，代码之间的复用也变得很困难。 到目前为止（2024年） 社区仍然没有形成好用的标准库 （比如时间操作、字符串操作、系统相关操作、标记语言操作等，以及常用的数据结构：链表、哈希表等），如果去阅读哪些古老的代码，会发现这些代码的可读性非常低（差不多古老的C语言也存在一样的问题，但是发展除了C++来改善相关处境）。 同时，缺乏标准的单元测试框架，测试只能使用原始的print，这使得代码变得越发的臃肿难看。 现代化的编程活动（思想）包括对 依赖的管理 ， 编辑器环境的配置 （如VSCODE），文档自动生成（ford），单元测试，版本管理（git），持续集成（github: workflow）， 撰写此文档的目标是展示在写FORTRAN代码的时候，如何使用好现代化的工具。 文档涉及到的工具包括： MAKEFILE FORTRAN包管理器 FORTRAN文档生成工具 FORTRAN单元测试框架 基于GITHUB的FORTRAN项目持续集成 文档将以 平流模块（空气污染数值模式）为例 ，将所有工具的实践串联起来，中间将会穿插讲解FORTRAN的高级特征，基于GDB的调试，VSCODE的配置，以及 FORTRAN标准库的使用 Todo 使用CMAKE； 如何优雅的引入MPI； 如何管理异构代码（CUDA，DCU等） 如何解决兼容性问题（centos7太老了） Developer Info Linhong Xiao","tags":"home","loc":"index.html"},{"title":"ppm – atom","text":"public  subroutine ppm(dt, dx, nn, area, areav, v, conc, flux) 一维平流函数 Arguments Type Intent Optional Attributes Name real, intent(in) :: dt 时间间隔: s real, intent(in) :: dx 网格分辨率: m integer, intent(in) :: nn 网格数 real :: area real :: areav real, intent(in) :: v (nn) 风速: m/s real, intent(inout) :: conc (nn) 网格浓度: umol/m3 real, intent(out) :: flux (nn) Conc change from interfacial mass flux: umol/m3","tags":"","loc":"proc\\ppm.html"},{"title":"routines – atom","text":"performs advection using the one-dimensional implementation \n of the piecewise parabolic method (分段抛物型方法) of Colella and Woodward (1984).\n A piecewise continuous parabola is used as the intepolation polynomial.\n The slope of the parabola at cell edges is computed from a cumulative\n function of the advected quantity. These slopes are further modified\n so that the interpolation function is monotone. Subroutines public  subroutine ppm (dt, dx, nn, area, areav, v, conc, flux) 一维平流函数 Arguments Type Intent Optional Attributes Name real, intent(in) :: dt 时间间隔: s real, intent(in) :: dx 网格分辨率: m integer, intent(in) :: nn 网格数 real :: area real :: areav real, intent(in) :: v (nn) 风速: m/s real, intent(inout) :: conc (nn) 网格浓度: umol/m3 real, intent(out) :: flux (nn) Conc change from interfacial mass flux: umol/m3","tags":"","loc":"module\\routines.html"},{"title":"main – atom","text":"Uses routines This is our program Variables Type Attributes Name Initial integer, parameter :: nx = 100 integer, parameter :: ny = 50 integer, parameter :: nt = 60 real, parameter :: dt = 1.0 real :: dx real :: dy real, dimension(nx, ny) :: u real, dimension(nx, ny) :: v real, dimension(nx, ny) :: conc integer :: i integer :: j","tags":"","loc":"program\\main.html"},{"title":"main.f90 – atom","text":"Source Code program main !! This is our program use routines , only : xyadv implicit none integer , parameter :: nx = 100 integer , parameter :: ny = 50 integer , parameter :: nt = 60 real , parameter :: dt = 1.0 real :: dx , dy real , dimension ( nx , ny ) :: u , v , conc integer :: i , j dx = 10 dy = 10 ! Set initial condition (e.g., Gaussian distribution) do i = 1 , nx do j = 1 , ny conc ( i , j ) = exp ( - (( i * dx - 0.5 ) ** 2 + ( j * dy - 0.5 ) ** 2 ) / 0.01 ) end do end do u = 1 v = 1 do i = 1 , nt call xyadv ( u , v , conc , dt , dx , dy ) end do end program main","tags":"","loc":"sourcefile\\main.f90.html"},{"title":"module_routine.f90 – atom","text":"Source Code module routines !* performs advection using the one-dimensional implementation !  of the piecewise parabolic method (分段抛物型方法) of Colella and Woodward (1984). !  A piecewise continuous parabola is used as the intepolation polynomial. !  The slope of the parabola at cell edges is computed from a cumulative !  function of the advected quantity. These slopes are further modified !  so that the interpolation function is monotone. implicit none contains subroutine ppm ( dt , dx , nn , area , areav , v , conc , flux ) !! 一维平流函数 implicit none ! args real , intent ( in ) :: dt !! 时间间隔: s real , intent ( in ) :: dx !! 网格分辨率: m integer , intent ( in ) :: nn !! 网格数 real , intent ( in ) :: area_of_cell ( nn ) !! Cell area adjustment vector: 1/m2 real , intent ( in ) :: area_of_face ( nn ) !! Interfacial area adjustment vector: m2 real , intent ( in ) :: v ( nn ) !! 风速: m/s real , intent ( inout ) :: conc ( nn ) !! 网格浓度: umol/m3 real , intent ( out ) :: flux ( nn ) !! Conc change from interfacial mass flux: umol/m3 ! local real , parameter :: TWO3RDS = 2. / 3. real :: fm ( nn + 1 ) real :: fp ( nn + 1 ) real :: cm ( nn + 1 ) ! 格子和格子之间的边界处的浓度 real :: cl ( nn + 1 ) ! 网格的左边界处的浓度 real :: cr ( nn + 1 ) ! 网格的右边界处的浓度 real :: dc ( nn + 1 ) ! 两个格子之间的浓度差 real :: c6 ( nn + 1 ) ! 这个物理意义是啥？ integer :: i real :: x ! 公式1.12 ! Set all fluxes to zero. Either positive or negative flux ! will remain zero depending on the sign of the velocity fm = 0. fp = 0. ! handle boundary case: Zero order polynomial at the boundary cells cm ( 2 ) = conc ( 2 ) cm ( nn ) = conc ( nn - 1 ) ! First order polynomial at the next cells cm ( 3 ) = ( conc ( 3 ) + conc ( 2 )) / 2. cm ( nn - 1 ) = ( conc ( nn - 1 ) + conc ( nn - 2 )) / 2. ! Second order polynomial inside the domain do i = 3 , nn - 2 dc ( i ) = 0.5 * ( conc ( i + 1 ) - conc ( i - 1 )) ! 公式1.7 ! Guarantee that CM lies between CON(I) and CON(I+1)：公式 1.8 if (( conc ( i + 1 ) - conc ( i )) * ( conc ( i ) - conc ( i - 1 )) > 0. ) then dc ( i ) = sign ( 1. , dc ( i )) * & min ( abs ( dc ( i )), 2. * abs ( conc ( i + 1 ) - conc ( i )), 2. * abs ( conc ( i ) - conc ( i - 1 ))) else dc ( i ) = 0. ! ? end if end do ! 公式1.6 do i = 3 , nn - 3 cm ( i + 1 ) = conc ( i ) + 0.5 * ( conc ( i + 1 ) - conc ( i )) + ( dc ( i ) - dc ( i + 1 )) / 6. end do do i = 2 , nn - 1 cr ( i ) = cm ( i + 1 ) cl ( i ) = cm ( i ) end do ! Generate piecewise parabolic distributions do i = 2 , nn - 1 ! 单调性 if (( cr ( i ) - conc ( i )) * ( conc ( i ) - cl ( i )) > 0. ) then dc ( i ) = cr ( i ) - cl ( i ) ! 公式1.5 c6 ( i ) = 6. * ( conc ( i ) - 0.5 * ( cl ( i ) + cr ( i ))) ! 公式 1.5 ! Overshoot cases if ( dc ( i ) * c6 ( i ) > dc ( i ) * dc ( i )) then cl ( i ) = 3. * conc ( i ) - 2. * cr ( i ) elseif ( - dc ( i ) * dc ( i ) > dc ( i ) * c6 ( i )) then cr ( i ) = 3. * conc ( i ) - 2. * cl ( i ) endif else cl ( i ) = conc ( i ) cr ( i ) = conc ( i ) endif dc ( i ) = cr ( i ) - cl ( i ) ! 公式 1.5 c6 ( i ) = 6. * ( conc ( i ) - 0.5 * ( cl ( i ) + cr ( i ))) end do ! Compute fluxes from the parabolic distribution do i = 2 , nn - 1 x = max ( 0. , - v ( i - 1 ) * dt / dx ) ! m/m fm ( i ) = x * ( cl ( i ) + 0.5 * x * ( dc ( i ) + c6 ( i ) * ( 1. - TWO3RDS * x ))) ! 公式1.12 x = max ( 0. , v ( i ) * dt / dx ) fp ( i ) = x * ( cr ( i ) - 0.5 * x * ( dc ( i ) - c6 ( i ) * ( 1. - TWO3RDS * x ))) end do ! Compute fluxes from boundary cells assuming uniform distribution if ( v ( 1 ) > . 0. ) then x = v ( 1 ) * dt / dx fp ( 1 ) = x * conc ( 1 ) end if if ( v ( nn - 1 ). lt . 0. ) then x = - v ( nn - 1 ) * dt / dx fm ( nn ) = x * conc ( nn ) end if flux ( 1 ) = ( fp ( 1 ) - fm ( 2 )) ! ug/m&#94;3? do i = 2 , nn - 1 flux ( i ) = ( fp ( i ) - fm ( i + 1 )) conc ( i ) = conc ( i ) - ( flux ( i ) - flux ( i - 1 )) ! 公式1.13 ! conc(i) = conc(i) - area_of_cell(i)*(area_of_face(i)*flux(i) - area_of_face(i-1)*flux(i-1)) end do end subroutine xyadv end module routines","tags":"","loc":"sourcefile\\module_routine.f90.html"},{"title":"FORTRAN工程化实践 – atom","text":"FORTRAN的工程化实践涉及到一系列的最佳实践和方法，以确保代码的可维护性、可靠性和可扩展性。 尽管FORTRAN是一种古老的编程语言，但在工程化方面仍然可以采取一些现代化的方法和工具。以下是一些推荐的实践： 模块化设计：使用模块化的程序设计风格，将程序分解为较小的模块或子程序。这有助于提高代码的结构化程度，使得各部分更易于理解和维护。 良好的命名规范：使用清晰、描述性的变量名和函数名，遵循一致的命名规范。这有助于他人更容易理解代码的功能和用途。 版本控制：使用版本控制系统（如Git）来管理代码的版本和变更。这不仅可以帮助团队协作开发，还能够跟踪代码的演变过程，方便回溯和修复bug。 自动化测试：编写自动化测试用例来验证关键功能和边界条件。虽然FORTRAN在测试工具方面可能不如一些现代语言那么成熟，但可以编写简单的测试程序或者集成一些第三方的测试框架来辅助测试工作。 文档化：编写清晰的代码注释和文档，说明代码的功能、输入输出以及关键算法的实现。这对于后续维护和团队协作非常重要。 性能优化：考虑到FORTRAN在科学计算和高性能计算中的应用，性能优化是一个重要的方面。合理选择数据结构和算法，避免不必要的计算和内存访问，可以显著提升程序的效率。 集成开发环境（IDE）和工具链：使用现代化的集成开发环境（IDE），如Visual Studio Code等，配合FORTRAN的插件或者集成工具链，可以提升开发效率和代码质量。 代码审查和质量控制：定期进行代码审查，确保代码符合规范，并且没有潜在的逻辑错误或者性能瓶颈。 持续集成和持续交付（CI/CD）：尽管FORTRAN的应用场景不太常见于持续集成和持续交付中，但可以考虑结合适当的构建脚本和自动化流程，简化开发、测试","tags":"","loc":"page\\index.html"},{"title":"第一章 平流输送 – atom","text":"平流输送过程 平流输送对与大气中惰性气体的再分配有着支配性作用，\n是空气质量数值模式(CTM)中非常重要的过程。 平流过程的方程通过大气连续性方程得到（对于空气密度就是连续性方程） 其中 表示污染物的浓度（质量浓度，如 ） 三维平流过程就是在已知风场（大尺度风场）的情况下，求解大气连续性方程。 当然给定的风场是离散的，同时我们也需要通过数值的方式来解这个方程 我们通过一个简单推导来理解如何对平流过程进行数值求解。 首先把散度符号展开 我们考虑一维的平流输送方程 一维的平流输送方程有两个需要离散化处理的变量 和 。在离散化过程中，我们假定空间分辨率为定值。 先对其进行空间上的离散处理。 那么公式可以改写为 其中 为格子 和格子 之间的边界( ) 处的通量。 将公式\\ref{1.5}带入到公式\\ref{1.4}中 WRF等数值模式一般采用荒川网格计算风场，因此 和 为已知量（如果是插值得到，那么可能会存在误差）。 再对时间进行离散化，如果采用简单的显示欧拉方法，则公式变为： 整理一下： 由以上公式可知，平流方案最关键的步骤就是如何获得边界处（stag网格）的浓度（当然最简单的方案就是插值）。 似乎这个公式就能较好的求解出平流对浓度的影响，如果仔细想想，我们会面对四个额外的问题。 首先，我们观察等号右边的中间项（把括号展开, 并稍加整理） 我们需要意识到，公式\\ref{1.9}中存在一个假设，该公司计算的浓度增量是从格子 吹到格子 ，注意这个增量会最终叠加在格子 中，公式1.8中只涉及到 的计算，那么有没有一种可能。风速太大了，吹出了格子 呢！ 当然有可能，所以我们要对数值求解方案施加限制 这就是 Courant-Friedrichs-Lewy（CFL） 条件。 我们在设置 的时候，应该尽量保证这个条件，这样积分才具有稳定性。 另外一个我们需要关注的问题是数值扩散，由于充分混合的假设，很容易使得平流方案计算的扩散速度大于物理上的实际扩散速度，想像一下一个格子很大，比如 ，从西边界吹入一个高浓度的值，这个高浓度值会瞬间在整个格子里面混合，也就是说这个增量一下就会吹到东边界，肯定比实际扩散的要快一些（因此如何获得边界上的值，是一个比较有挑战的事情，好的方案可以减缓数值扩散）。 然后我们需要关注的事情是质量的一致性，空气质量模式往往采用离线模拟的方式（气象场先模拟，再模拟CTM），并且CTM的网格和原始的气象网格存在差异，不同的离散方案(时间和空间)和插值都会导致质量一致性的出现问题。 为什么空气密度的误差，会影响浓度平流过程计算的质量一致性问题呢？ 如果用质量混合比来表示平流方程\n设 那么(链式法则 => 带入公式\\ref{1.1} => 带入C的定义 => 链式法则) 注意最终的结论是 要满足质量守恒，公式\\ref{1.12}只有唯一的一个解，就是 ，其中 为常数，也就是说，污染物浓度的变化要和密度变化协调一致（其实很好理解，浓度和空气密度都是同样的方程支配这平流，变化的步调应该是协调一致的）。 最后我们需要关注的事情是质量守恒性，不能因为平流过程的计算，增加或者减少了物质，平流只是把物质从一个地方输送到另一个地方。质量不守恒一般是怎么引发的呢？ Note camx手册 Sportisse B. Fundamentals in air pollution: from processes to modelling[M]. Springer Science & Business Media, 2009.","tags":"","loc":"page\\ppm.html"},{"title":"第二章 包管理器 – atom","text":"fpm（Fortran Package Manager） 是一个专门为Fortran语言设计的包管理工具，旨在简化Fortran项目的依赖管理、构建和发布过程。 主要特点和优势： 简化的依赖管理：fpm允许Fortran项目定义和管理依赖关系，可以轻松地引入和使用外部库和模块，而无需手动下载和配置。 fpm 鼓励采用现代化的项目结构，例如使用模块化的源代码组织方式，这有助于提高代码的可维护性和可扩展性。 易于使用的命令行界面：fpm 提供了简单明了的命令行界面，使得项目的构建、测试和发布过程更加方便和高效。 fpm 支持集成测试，可以帮助开发者编写和运行测试用例，确保代码的质量和稳定性。 使用fpm的基本流程 初始化一个新项目 fpm new ppm 编辑项目描述文件 name = \"ppm\" version = \"0.1.0\" license = \"license\" author = \"xiaolh\" maintainer = \"xiaolh@3clear.com\" copyright = \"Copyright 2024, xiaolh\" [build] auto-executables = true auto-tests = true auto-examples = true module-naming = false [install] library = false [fortran] implicit-typing = false implicit-external = false source-form = \"free\" [dependencies] stdlib = \"*\" [dev-dependencies] test-drive . git = \"https://github.com/fortran-lang/test-drive\" test-drive . tag = \"v0.4.0\" 构建和测试项目 fpm build\nfpm test Note cargo fpm手册","tags":"","loc":"page\\fpm.html"},{"title":"第三章 文档生成 – atom","text":"简介 写文档一直都是程序员的噩梦，特别是在word文档里面编辑。 代码总是确定性的描述，而文字则是充满了歧义。当时看代码总是痛苦的，因为代码是给编译器看的，所以我们一定是需要文档的。 如何减少写文档的痛苦，当前的最佳文档实践方式是在实现代码的同时，在代码的相同位置，以注释的方式去进行文档的编写。 这样就引申出一个需求，如何把代码文件（一般为文本文件）中的以注释编辑的文档，以更加漂亮可读的方式呈现出来。 这就是文档自动生成工具的由来，而目前最好的为fortran而生的文档生成工具就是 ford ford采用 Markdown 来编写纯文本格式的文档。 ford的使用非常简单，只需要在代码仓的主目录中输入 ford proj.md 即可在当前目录产生HTML格式的文档，简单来说，ford会从 proj.md （命名方式并不固定）读取一些代码仓的元数据信息（比如作者名称，简洁等等，也包含ford的一些配置信息），同时会解析代码仓主目录下的 src/*[fF]90 代码文件，会形成相关的链接结构（方便进行跳转）。当然ford也会额外的抽取一些特殊的注释文档，在后续会详细介绍。 在代码中编写文档 如果在写Fortran时，不写专门的文档注释，那么ford只是简单的把源代码（ *.f90 ）、代码中的模块（ Module ）和模块中的过程体（ Module ）和模块中的一些独立单元（ subroutine, function, type ）和入口函数（ program ）解析出来，并形成链接。如果我们要告诉ford，对于某个对象，你应该额外的抽出一些注释，我们应该怎么做呢？ 用双感叹号 !! 来告诉ford（这个符号可以改变，但是一般来说没有必要），这是文档注释。而ford会忽略掉普通的感叹号 ! 注释。 文档注释应该在标注代码之后（有些人喜欢在函数定义的前面写函数的注释，通过特殊的标注 !> 也是可以支持的，不过不建议这样去做）。 subroutine demo ( cats , dogs , food , angry ) !! Feeds your cats and dogs, if enough food is available. If not enough !! food is available, some of your pets will get angry. ! Arguments integer , intent ( in ) :: cats !! The number of cats to keep track of. integer , intent ( in ) :: dogs !! The number of dogs to keep track of. real , intent ( inout ) :: food !! The ammount of pet food (in kilograms) which you have on hand. integer , intent ( out ) :: angry !! The number of pets angry because they weren't fed. return end subroutine demo 对于比较长的文档块，可以使用 !* 作为第一条文档的注释。 注意实现 在用ford生成静态网页时，加上-o选项，指定输出的目录 ford atom.md -o docs Note ford手册","tags":"","loc":"page\\ford.html"},{"title":"第四章 部署文档 – atom","text":"通过ford，可以以静态网页（HTML）的方式组织文档。 有两个部署静态网页的平台值得推荐。\n- github pages\n- Netlify github pages Note github手册 fpm手册","tags":"","loc":"page\\docs.html"}]}