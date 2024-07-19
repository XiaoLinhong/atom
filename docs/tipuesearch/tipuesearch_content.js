var tipuesearch = {"pages":[{"title":" atom ","text":"atom 工程化编程思想发展得很快，现在已经进入工具就是一切的时代。 没有现代化的工具去维护一个大型项目越发的变得难以忍受。 FORTRAN作为一个最老的高级语言，被创造的时候只是为了解决一些逻辑相对简单的科学计算问题。作为一编译型语言，FORTRAN的语法非常简单，很容易学习。由于上手容易，解决的问题又很纯粹，FORTRAN程序员从入门开始就很少关注工程化相关工具的使用（早期的时候，根本就没有这些工具），这使得整个社区在使用FORTRAN时，往往不会像传统的软件开发一样注重软件工程相关的问题。经历了快一个世纪的时间，FORTRAN的遗产非常庞大，代码之间的复用也变得很困难。 到目前为止（2024年） 社区仍然没有形成好用的标准库 （比如时间操作、字符串操作、系统相关操作、标记语言操作等，以及常用的数据结构：链表、哈希表等），如果去阅读哪些古老的代码，会发现这些代码的可读性非常低（差不多古老的C语言也存在一样的问题，但是发展除了C++来改善相关处境）。 同时，缺乏标准的单元测试框架，测试只能使用原始的print，这使得代码变得越发的臃肿难看。 现代化的编程活动（思想）包括对 依赖的管理 ， 编辑器环境的配置 （如VSCODE），文档自动生成（ford），单元测试，版本管理（git），持续集成（github: workflow）， 撰写此文档的目标是展示在写FORTRAN代码的时候，如何使用好现代化的工具。 文档涉及到的工具包括： MAKEFILE FORTRAN包管理器 FORTRAN文档生成工具 FORTRAN单元测试框架 基于GITHUB的FORTRAN项目持续集成 文档将以 平流模块（空气污染数值模式）为例 ，将所有工具的实践串联起来，中间将会穿插讲解FORTRAN的高级特征，基于GDB的调试，VSCODE的配置，以及 FORTRAN标准库的使用 Todo 使用CMAKE； 如何优雅的引入MPI； 如何管理异构代码（CUDA，DCU等） 如何解决兼容性问题（centos7太老了） Developer Info Linhong Xiao","tags":"home","loc":"index.html"},{"title":"adv_by_ppm – atom","text":"public  subroutine adv_by_ppm(dt, dx, n, u, c, increment, volume) 基于PPM方法实现的一维平流函数 Arguments Type Intent Optional Attributes Name real, intent(in) :: dt 时间间隔: s real, intent(in) :: dx 网格分辨率: m integer, intent(in) :: n 网格数: 2~n-1 参与平流计算 real, intent(in) :: u (n) 风速: m/s，网格可以比n少一个 real, intent(inout) :: c (n) 网格浓度: umol/m3，包含两个边界浓度 real, intent(out) :: increment (n) 浓度变化: umol/m3，只有2~n-1有效 real, intent(in), optional :: volume (n) 每个网格的体积校正因子: dx dy dz;","tags":"","loc":"proc/adv_by_ppm.html"},{"title":"mod_ppm – atom","text":"The one-dimensional implementation of the PPM\n （piecewise parabolic method, 分段抛物线法） 假设1：等距网格 假设2：第一个网格和最后一个网格为区域边界网格，为外部约束。 Step 1 : 计算2~n-1个网格的平均坡度(slopC) 为了让浓度不连续的地方模拟得更好，\n  同时，确保网格边界处浓度在左右格子平均浓度之间，\n  对 进行约束。 Step 2 : 每个网格边界处的浓度 Step 3 : 计算抛物线参数，并对边界处浓度进行约束 Step 4 : 计算边界处传输的平均浓度，及其通量 其中 Step 5 : 用前向欧拉法进行时间积分 网格设计 | Boundary |<----------------- Domain ----------------->| Boundary | | c ( 1 ) | c ( 2 ) |-----------------------| c ( n - 1 ) | c ( n ) | | u ( 1 ) u ( 2 ) -> u ( n - 1 ) u ( n ) | | slopC ( 2 ) | | | deltaC ( 2 ) | | | c6 ( 2 ) | leftC ( 1 ) leftC ( 2 ) rightC ( 1 ) rightC ( 2 ) egdeC ( 0 ) egdeC ( 1 ) egdeC ( 2 ) transC ( 1 ) transC ( 2 ) flux ( 1 ) flux ( 2 ) -> flux ( n - 1 ) Subroutines public  subroutine adv_by_ppm (dt, dx, n, u, c, increment, volume) 基于PPM方法实现的一维平流函数 Arguments Type Intent Optional Attributes Name real, intent(in) :: dt 时间间隔: s real, intent(in) :: dx 网格分辨率: m integer, intent(in) :: n 网格数: 2~n-1 参与平流计算 real, intent(in) :: u (n) 风速: m/s，网格可以比n少一个 real, intent(inout) :: c (n) 网格浓度: umol/m3，包含两个边界浓度 real, intent(out) :: increment (n) 浓度变化: umol/m3，只有2~n-1有效 real, intent(in), optional :: volume (n) 每个网格的体积校正因子: dx dy dz;","tags":"","loc":"module/mod_ppm.html"},{"title":"module_ppm.f90 – atom","text":"Source Code module mod_ppm !* The **one-dimensional implementation** of the PPM ! （piecewise parabolic method, 分段抛物线法） ! ! - 假设1：等距网格 ! - 假设2：第一个网格和最后一个网格为区域边界网格，为外部约束。 ! !  **Step 1**: 计算2~n-1个网格的平均坡度(slopC) ! !  \\delta c_{i} = 0.5(c_{i+1} - c_{i-1}) ! !  为了让浓度不连续的地方模拟得更好， !  同时，确保网格边界处浓度在左右格子平均浓度之间， !  对\\delta c_{i}进行约束。 !  !    \\delta_m c_{i} = !    \\begin{cases} !    min(|\\delta c_{i}|, 2|c_{i+1} - c_{i}|, 2|c_{i} - c_{i-1}|)*sign(\\delta c_{i}) !    &\\quad {\\text{if } (c_{i+1} - c_{i})(c_{i} - c_{i-1}) \\gt 0 }\\\\ !    \\text{0,} &\\quad \\text{else} \\\\ !    \\end{cases} !    \\tag {2.9} \\label {2.9} !  ! !  **Step 2**: 每个网格边界处的浓度 !  !    c_{x_{i+1/2}} = !    c_i + 0.5(c_{i+1}-c_i) + !    \\frac{1}{6}(\\delta_m c_{i} - \\delta_m c_{i+1}) !    \\tag {2.8} \\label {2.8} !  !  **Step 3**: 计算抛物线参数，并对边界处浓度进行约束 !  ! c_{6,i} = 6(c_i- \\frac{1}{2}(c_{x_{i+1/2}} + c_{x_{i-1/2}}) ) ! \\tag {2.5} \\label {2.5} !  ! \\begin{align*} ! c_{x_{i-1/2}} &= c_{x_{i+1/2}} = c_{i} \\quad \\text{if } ! (c_{x_{i+1/2}}-c_{i}) (c_{i}-c_{x_{i-1/2}}) \\le 0 \\\\ ! c_{x_{i-1/2}} &= 3c_{i} - 2c_{x_{i+1/2}}  \\quad \\text{if }  \\Delta c_i c_{6,i} > (\\Delta c_i)&#94;2 \\\\ ! c_{x_{i+1/2}} &= 3c_{i} - 2c_{x_{i-1/2}}  \\quad \\text{if } - \\Delta c_i c_{6,i} > (\\Delta c_i)&#94;2 ! \\tag {2.10} \\label {2.10} ! \\end{align*} ! ! **Step 4**: 计算边界处传输的平均浓度，及其通量 ! \\begin{align*} !    c_{i+1/2, L}(y) &= c_{x_{i+1/2}} - \\frac{y}{2\\Delta x} !    (c_{x_{i+1/2}} - c_{x_{i-1/2}} -(1-\\frac{2y}{3\\Delta x})c_{6,i}) \\\\ !    c_{i+1/2, R}(y) &= c_{x_{i+1-1/2}} - \\frac{y}{2\\Delta x} !    (c_{x_{i+1+1/2}} - c_{x_{i+1-1/2}} -(1-\\frac{2y}{3\\Delta x})c_{6,i+1}) !    \\tag {2.12} \\label {2.12} ! \\end{align*} ! 其中y=|u\\Delta t| !  !   f_{i+1/2} = !   \\begin{cases} !   u_{x_{i+1/2}} \\times c_{i+1/2, L}  &\\quad {\\text{if } u_{x_{i+1/2}} \\ge 0 }\\\\ !   u_{x_{i+1/2}} \\times c_{i+1/2, R}  &\\quad {\\text{if } u_{x_{i+1/2}} \\le 0 } \\\\ !   \\end{cases} !   \\tag {2.14} \\label {2.14} !  ! **Step 5**: 用前向欧拉法进行时间积分 !  !    c_i&#94;{n+1} = c_i&#94;{n} + \\frac{\\Delta t}{\\Delta x}(f_{i-1/2}-f_{i+1/2}) !    \\tag {2.13} \\label {2.13} !  ! 网格设计 !``` !     |Boundary|<-----------------Domain----------------->|Boundary| !     |  c(1)  |   c(2)  |-----------------------| c(n-1) |  c(n)  | !     |       u(1)      u(2) ->                         u(n-1)    u(n) !     |        | slopC(2)| !     |        |deltaC(2)| !     |        |  c6(2)  | !  leftC(1) leftC(2) !           rightC(1) rightC(2) !  egdeC(0) egdeC(1)  egdeC(2) !           transC(1) transC(2) !           flux(1)    flux(2) ->                     flux(n-1) !``` implicit none contains subroutine adv_by_ppm ( dt , dx , n , u , c , increment , volume ) !! 基于PPM方法实现的一维平流函数 ! input args real , intent ( in ) :: dt !! 时间间隔: s real , intent ( in ) :: dx !! 网格分辨率: m integer , intent ( in ) :: n !! 网格数: 2~n-1 参与平流计算 real , intent ( in ) :: u ( n ) !! 风速: m/s，网格可以比n少一个 ! output args real , intent ( inout ) :: c ( n ) !! 网格浓度: umol/m3，包含两个边界浓度 real , intent ( out ) :: increment ( n ) !! 浓度变化: umol/m3，只有2~n-1有效 ! optional args real , optional , intent ( in ) :: volume ( n ) !! 每个网格的体积校正因子: dx*dy*dz; ! local variables ! mass grid real :: c6 ( n ) ! 决定了抛物线的凸凹特征 real :: slopC ( n ) ! average slop: \\delta c or \\delta_m c real :: deltaC ( n ) ! rightC - leftC \\Delta c ! stag grid: 第i个mass网格的右边为stag网格的i real :: egdeC ( 0 : n ) ! 格子和格子之间的边界处的浓度 real :: leftC ( n ) ! 网格的左边界处的浓度 leftC = (0:n-1) real :: rightC ( n ) ! 网格的右边界处的浓度 rightC = (1:n) real :: transC ( n ) ! 边界处的浓度随着风场输出(一小段距离)的平均浓度 transport real :: flux ( n ) ! 边界处的通量 real :: CFL ! Courant-Friedrichs-Lewy条件：u*dt/dx real :: fL , fR ! 一个网格的左右通量 integer :: i ! step 1: do i = 2 , n - 1 ! Compute average slope in the i'th cell slopC ( i ) = 0.5 * ( c ( i + 1 ) - c ( i - 1 )) ! Constraint: 确保梯度不要太大 if (( c ( i + 1 ) - c ( i )) * ( c ( i ) - c ( i - 1 )) > 0. ) then slopC ( i ) = sign ( 1. , slopC ( i )) * & min ( abs ( slopC ( i )), & 2. * abs ( c ( i + 1 ) - c ( i )), & 2. * abs ( c ( i ) - c ( i - 1 ))) else ! 局地极值情况 slopC ( i ) = 0 end if end do ! step 2: Compute concentrations at cell boundaries ! Zero order polynomial egdeC ( 0 ) = c ( 1 ) egdeC ( n ) = c ( n ) ! First order polynomial egdeC ( 1 ) = ( c ( 2 ) - c ( 1 )) / 2 egdeC ( n - 1 ) = ( c ( n ) - c ( n - 1 )) / 2 ! 求边界处的值 do i = 2 , n - 2 egdeC ( i ) = c ( i ) + ( c ( i + 1 ) - c ( i )) / 2 + ( slopC ( i ) - slopC ( i + 1 )) / 6. end do leftC = egdeC ( 0 : n - 1 ) rightC = egdeC ( 1 : n ) ! step 3: 对边界处浓度进行约束 do i = 2 , n - 2 ! 更新边界处浓度 if (( rightC ( i ) - c ( i )) * ( c ( i ) - leftC ( i )) > 0. ) then deltaC ( i ) = rightC ( i ) - leftC ( i ) c6 ( i ) = 6. * ( c ( i ) - ( rightC ( i ) + leftC ( i )) / 2. ) ! Overshoot cases if ( deltaC ( i ) * c6 ( i ) > deltaC ( i ) * deltaC ( i )) then leftC ( i ) = 3. * c ( i ) - 2. * rightC ( i ) else if ( - deltaC ( i ) * deltaC ( i ) > deltaC ( i ) * c6 ( i )) then rightC ( i ) = 3. * c ( i ) - 2. * leftC ( i ) endif else ! 局地极值 leftC ( i ) = c ( i ) rightC ( i ) = c ( i ) end if ! 确定每个格子抛物线参数：rightC, leftC, c6; deltaC ( i ) = rightC ( i ) - leftC ( i ) c6 ( i ) = 6. * ( c ( i ) - ( rightC ( i ) + leftC ( i )) / 2. ) end do ! 第四步: Compute fluxes ! fluxes from boundary cells if ( u ( 1 ) > 0. ) flux ( 1 ) = u ( 1 ) * leftC ( 1 ) ! assuming uniform distribution if ( u ( 1 ) < 0. ) flux ( 1 ) = u ( 1 ) * leftC ( 1 + 1 ) ! First order polynomial if ( u ( n - 1 ) > 0. ) flux ( n - 1 ) = u ( n - 1 ) * rightC ( n - 1 ) ! First order polynomial if ( u ( n - 1 ) < 0. ) flux ( n - 1 ) = u ( n - 1 ) * rightC ( n ) ! fluxes from the parabolic distribution do i = 2 , n - 2 CFL = abs (( u ( i ) * dt ) / dx ) ! Guarantee y = u(i)*dt > 0 if ( u ( i ) > 0. ) then ! 公式 2.12 transC ( i ) = rightC ( i ) - CFL / 2 * ( deltaC ( i ) - ( 1. - CFL * 2. / 3. ) * c6 ( i )) else transC ( i ) = leftC ( i + 1 ) - CFL / 2 * ( deltaC ( i + 1 ) - ( 1. - CFL * 2. / 3. ) * c6 ( i + 1 )) end if flux ( i ) = u ( i ) * transC ( i ) ! 公式2.14 end do ! 第5步: 时间积分 do i = 2 , n - 1 fR = flux ( i ) fL = flux ( i - 1 ) if ( present ( volume )) then ! 进行校正体积校正，保证质量守恒 if ( fL > 0 ) fL = fL * volume ( i - 1 ) / volume ( i ) if ( fR < 0 ) fR = fR * volume ( i + 1 ) / volume ( i ) end if ! 公式2.13 increment ( i ) = dt / dx * ( fL - fR ) c ( i ) = c ( i ) + increment ( i ) end do end subroutine adv_by_ppm end module mod_ppm","tags":"","loc":"sourcefile/module_ppm.f90.html"},{"title":"FORTRAN工程化实践 – atom","text":"FORTRAN的工程化实践涉及到一系列的最佳实践和方法，以确保代码的可维护性、可靠性和可扩展性。 尽管FORTRAN是一种古老的编程语言，但在工程化方面仍然可以采取一些现代化的方法和工具。以下是一些推荐的实践： 模块化设计：使用模块化的程序设计风格，将程序分解为较小的模块或子程序。这有助于提高代码的结构化程度，使得各部分更易于理解和维护。 良好的命名规范：使用清晰、描述性的变量名和函数名，遵循一致的命名规范。这有助于他人更容易理解代码的功能和用途。 版本控制：使用版本控制系统（如Git）来管理代码的版本和变更。这不仅可以帮助团队协作开发，还能够跟踪代码的演变过程，方便回溯和修复bug。 自动化测试：编写自动化测试用例来验证关键功能和边界条件。虽然FORTRAN在测试工具方面可能不如一些现代语言那么成熟，但可以编写简单的测试程序或者集成一些第三方的测试框架来辅助测试工作。 文档化：编写清晰的代码注释和文档，说明代码的功能、输入输出以及关键算法的实现。这对于后续维护和团队协作非常重要。 性能优化：考虑到FORTRAN在科学计算和高性能计算中的应用，性能优化是一个重要的方面。合理选择数据结构和算法，避免不必要的计算和内存访问，可以显著提升程序的效率。 集成开发环境（IDE）和工具链：使用现代化的集成开发环境（IDE），如Visual Studio Code等，配合FORTRAN的插件或者集成工具链，可以提升开发效率和代码质量。 代码审查和质量控制：定期进行代码审查，确保代码符合规范，并且没有潜在的逻辑错误或者性能瓶颈。 持续集成和持续交付（CI/CD）：尽管FORTRAN的应用场景不太常见于持续集成和持续交付中，但可以考虑结合适当的构建脚本和自动化流程，简化开发、测试","tags":"","loc":"page/index.html"},{"title":"第一章 平流输送 – atom","text":"Warning 吾尝终日而思矣，不如须臾之所学也 1. 理解平流输送 平流输送（Advection）是指在流体中，物质随着流体的流动而传输的过程。平流输送是空气质量数值模式(CTM)中最基本的过程之一。而平流方程只是连续性方程的特殊情况。 连续性方程（continuity equation）是描述守恒量传输行为的偏微分方程。在流体力学里，连续性方程表明，在任何稳定态过程中，质量进入物理系统的速率等于离开的速率。质量连续性方程的微分形式为 其中 表示污染物的浓度（质量浓度，如 ）， 为速度向量场， 为通量。 数值模式中的平流过程，就是在已知速度向量场的情况下，求解大气连续性方程。 通常给定的风场是离散的，同时，我们也需要通过数值方式来求解该方程。 我们通过一个简单推导来理解如何对平流过程进行数值求解。 首先把散度符号展开 我们考虑一维的平流输送方程 一维的平流输送方程有两个需要离散化处理的变量，分别为 和 。 我们首先对公式\\ref{1.3} 进行空间上的离散处理。在离散化过程中，我们假定空间离散式均匀的（既等网格）。 那么公式可以改写为 其中 为格子 和格子 之间的边界( ) 处的通量（单位时间，单位面积通过的物质量的： ），其物理含义为该格子浓度的变化等于流入流出的量。其中通量的公式为 将公式\\ref{1.5}带入到公式\\ref{1.4}中 Note WRF等数值模式采用 Arakawa Staggered C-Grid 计算风场，因此 和 为已知量（注意此时是指网格边界处的风矢量，如果是插值得到，那么可能会存在误差）。 再对公式\\ref{1.6} 时间进行离散化，如果采用简单的显示欧拉方法，即可得到 其中 为时间索引，整理一下（ Godunov's scheme ）： 由以上公式可知，计算平流过程最关键的步骤就是如何 获得边界处的通量 （边界处的浓度是关键）。 2. 需要考虑的问题 似乎根据公式\\ref{1.8} 就能较好的求解出平流对浓度的影响。\n如果仔细想想，我们会面对四个额外的问题。 首先，我们观察等号右边的中间项（把括号展开, 并稍加整理） 我们需要意识到，公式\\ref{1.9} 中存在一个假设，该公式计算的浓度增量是从格子 输送到格子 ，注意这个增量会最终叠加在格子 中，公式\\ref{1.8} 中只涉及对 的更新，那么有没有一种可能。风速太大了，吹出了格子 呢！ 当然有可能，所以我们要对数值求解方案施加限制 这就是 Courant-Friedrichs-Lewy（CFL） 条件。 我们在设置 和 的时候，应该尽量保证这个条件，这样积分才具有稳定性。 另外一个我们需要关注的问题是数值扩散，由于充分混合的假设，很容易使得平流方案计算的扩散速度大于物理上的实际扩散速度。 想像一下，如果一个格子很大，比如 ，从西边界吹入一个高浓度的值，这个高浓度值会瞬间在整个格子里面混合，也就是说这个增量一下就会吹到东边界，肯定比实际扩散的要快一些（因此如何获得边界上的值，是一个比较有挑战的事情，好的方案可以减缓数值扩散）。 然后我们需要关注的事情是质量的一致性（污染物浓度的行为和空气密度的行为不一致，模拟空气通量的风场和模拟污染物通量的风场不一致），空气质量模式往往采用离线模拟的方式（气象场先模拟，再模拟CTM），并且CTM的网格和原始的气象网格存在差异，不同的离散方案(时间和空间)和插值都会导致质量一致性的出现问题。 如果用质量混合比来表示平流方程，设 。 那么（链式法则 => 带入公式\\ref{1.1} => 带入C的定义 => 链式法则） 注意，最终的结论是 要满足质量守恒，公式\\ref{1.12}只有唯一的一个解，就是 ，其中 为常数，也就是说，污染物浓度的变化要和密度变化协调一致（其实很好理解，浓度和空气密度都是同样的方程支配平流输送，变化的步调应该是协调一致的）。 最后我们需要关注的事情是质量守恒性，不能因为平流过程的计算，增加或者减少了物质，平流只是把物质从一个地方输送到另一个地方。质量不守恒一般是怎么引发的呢？ 其中一个非常重要的因数就是网格的size不一样大（体积、面积、长度）。在实际的数值模式中，网格不一致的原因有很多种，包括 1）非均一网格；2）气压垂直层；3）地图投影的形变。 那么为什么网格不一致，会导致质量不守恒呢，仔细观察公式\\ref{1.8} 就可以方向，物质从左边的格子输送到右边，是以浓度增量的方式更新网格浓度，浓度是强度量，如果左边的格子远小于右边，比如左边为 ，右边为 ，如果左边网格损失 ，物质的量损失了 。按照公式，右边的网格增加 ，但是物种的量却增加了 。 Todo 还有其他情况会导致质量不守恒吗？ 3. 分段多项式平流方案 分段多项式平流方案（Piecewise Parabolic Method，PPM）是一种用于求解流体动力学方程的数值方法，特别是在处理高分辨率、具有激波等间断的流体问题时表现出色。 PPM具有三阶精度，广泛用于主流的空气质量模式中（CMAQ、CAMx 等）。该方案适用于 非结构化网格 （结构化网格只是非结构化网格的特例），为了思路更加、简单清楚，在本文档的推导过程中，只采用等网格间距的设定，且只考虑一维的情况。 在浓度的离散表示中，网格浓度为该网格的平均浓度。根据定义，我们得到以下公式 其中， 表示第 个格子在 时刻的浓度。 为 时刻浓度在空间的分布函数，当然 函数是未知的，也是无法精确给出的。 可以针对某个时刻 Note 注意 变为 暗含了一层意思，不同时间的浓度的空间分布可以用不同的函数表示( )，相当于把 离散了。 公式\\ref{2.2} 暗含了一种检查方案，我们假定已知 (函数形式可以随意给定，比如 )，且速度确定并已知，那么可以算出每个网格在任意时间的精确值(函数的形态不变，只是沿着x轴随时间平移) 要进行通量计算，需要知道每个时刻的 ，不同方案对 的函数形式给出了不同的假设。 比如零阶精度假定格子内的浓度均匀分布（分布函数为常数，格子边界处浓度等于平均浓度），一阶精度假定函数形式为线性的（两个格子的线性插值），而PPM假定该函数为多项式。 PPM方案采用分段连续的二次多项式方案来表示每个格子在不同时间的 。为了方便，在后续过程中，省略时间的角标，也就是只考虑某个时次的情况，在每个网格中的二次多项式为（假定左右边界的浓度值已知，该值在后续的推导过程中确认） 其中 Note 作业：已知左右边界的浓度值，已知函数形式为二次多项式，如何推导出该函数形式。 从公式\\ref{2.4} 中很容易看出，构造的多项式在左右边界是连续（带入 ，或者带入 ），公式\\ref{2.4}中只有一个未知参数 。 如何计算 ，我们需要考虑其他已知条件，我们知道该网格的平均浓度 。 对公式\\ref{2.4} 两边进行积分求，并带入公式\\ref{2.2} ，可到 的表达式 可以采用 sympy 进行公式推导，并且进行验证。 from sympy import * init_printing () ci = symbols ( 'c_i' , real = true , constant = true ) # 网格平均浓度 cL = symbols ( 'cL_i' , real = true , constant = true ) # 左边界浓度 cR = symbols ( 'cR_i' , real = true , constant = true ) # 右边界浓度 x = symbols ( 'x' ) xL = symbols ( 'xL_i' , real = true , constant = true ) # 左边界位置 xR = symbols ( 'xR_i' , real = true , constant = true ) # 右边界位置 c6 = symbols ( 'c6_i' , real = true , constant = true ) # 参数c6 f = cL + ( x - xL ) / ( xR - xL ) * ( cR - cL + c6 * (( xR - x ) / ( xR - xL ))) # 公式2.4 fR = integrate ( f , ( x , xL , xR )) / ( xR - xL ) # 公式2.2的左边, factor(fR) solveset ( Eq ( fR , ci ), c6 ) # 公式2.2 我们在推导公式\\ref{2.4}，假定了网格之间边界处的浓度已知，但目前并不知道该值。那么，该如何获得 呢？ 在PPM中，通过四次多项式（quartic polynomial）描述浓度在空间的积分函数，从而来求解 的分布。 Note 为什么是四次多项式，而不是三次多项式呢？ 因为 在 上的分布是分段抛物线，抛物线的积分是三次，而分段抛物线的积分是四次（边界处的浓度，相当于是三次多项式）！ 我们首先定义浓度在空间的积分函数： 而网格边界处的浓度 从公式\\ref{2.6} 可知 在边界处的值是已知，现在要求边界处的浓度值，我们需要知道C(x)的函数形式，在PPM中，用5个点（ ）来构建一个四次多项式（获得参数，5个未知数，5个方程）。 from sympy import * init_printing () # 更好的打印 # 四次多项式 x , y = symbols ( 'x y' , real = true ) a1 , a2 , a3 , a4 , a5 = symbols ( 'a1:6' ) # 参数 f = a1 * x ** 4 + a2 * x ** 3 + a3 * x ** 2 + a4 * x + a5 - y # 线性方程: 已知5个点，确定多项式的参数 dx = symbols ( 'dx' ) # x3 = symbols ( 'x_3' ) # 中心边界点的位置 y3 = symbols ( 'y_3' ) # 中心边界点处C的值 c1 , c2 , c3 , c4 = symbols ( 'c1:5' ) # 网格平均浓度 # 方程组 f1 = f . subs ([( x , x3 - 2 * dx ), ( y , y3 - c1 * dx - c2 * dx )]) f2 = f . subs ([( x , x3 - dx ), ( y , y3 - c2 * dx )]) f3 = f . subs ([( x , x3 ), ( y , y3 )]) f4 = f . subs ([( x , x3 + dx ), ( y , y3 + c3 * dx )]) f5 = f . subs ([( x , x3 + 2 * dx ), ( y , y3 - c4 * dx + c3 * dx )]) # 解线性方程组 args = linsolve ([ f1 , f2 , f3 , f4 , f5 ], [ a1 , a2 , a3 , a4 , a5 ]) # 带入多项式 a1 , a2 , a3 , a4 , a5 = tuple ( * args ) f = a1 * x ** 4 + a2 * x ** 3 + a3 * x ** 2 + a4 * x + a5 - y df = Derivative ( f , x ) . doit () simplify ( df . subs ( x , x3 )) 通过代数求解，可以获得 通过该公式，基于网格平均浓度即可计算边界处浓度的值。理论上基于以上公式，就可以进行通量计算了。 对于公式\\ref{2.7} ，需要稍加整理。 其中 为第 个格子的平均斜率（三个网格连续变化的斜率？）。 为了让浓度不连续的地方模拟得更好（steeper representation），同时保证了边界浓度在两个格子平均浓度之间（ 条件1，不人为创造极值，比如可能出现负数 ），用 来替换 。 该替换标准是如何获得的呢？ 我们把 的约束条件（浓度值在左右两个格子的平均值之间）带入公式\\ref{2.8}，可以得到一个约束 。 更强的一个约束是 ，那么如果 ，且 ，约束条件一定会被满足（为什么PPM的条件会更强一些？）。 注意，替换之后，网格按照 积分计算的平均值就与给定的平均值不相等了（不需要一定相等，而且也破坏了边界处的连续性）。 为了避免在间断处出现非物理的振荡（过冲和欠冲，出现这种情况，通量的计算就会变得比较极端，不知道是对是错），在PPM方案中， 还有一个约束条件，在一个网格内，浓度的分布是单调的 ，避免人造极值，破坏物理的合理性，比如负数（网格平均浓度很低，边界浓度差异很大，为了保持抛物线的形态，并且平均值固定，那么就可能出现负值）。 按照之前的公式，得到的 不一定在 和 之间。 情况1: 关注格子的浓度 本身就是局地极值。插值函数设置为常数（就是在格子 中浓度均为 ）。 情况2: 格子 位于浓度梯度很大的地方，比如左边界比右边界浓度大很多，但是该格子的平均浓度与左边界接近，那么二次多项式的曲线会形成比边界浓度更大的值（为了抵消右边比平均值低很多的情况），破坏了在一个格子里面的单调性。这种现象被称为 overshoot （过充，或者超调，是指信号或者函数超过了预期值），发生overshoot时，网格左边界和右边界的值就会被重新设定，其判定条件为 ，该条件通过对公式\\ref{2.4} 求导，判定恒大于0 或者恒小于0 得到。 其中， 时， 为凸函数， 时， 为凹函数函数， 时， 为线性函数， 与 同符号时，且判定条件满足， 更靠近右边界浓度值。按照 ，带入公式定义公式，求得左边界值，这时在 处(右边界)， 的导数为0。 与 符号相反时，且判定条件满足， 更靠近左边界浓度值。按照 ，带入公式定义公式，求得右边界值，这是在 处(左边界)， 的导数为0 想象一下，如此处理之后， 在该网格中表现为抛物线的极值 连接边界处。 注意通过该步骤进行替换之后，会破坏边界处的连续性，也就是左右极值不相等（似乎边界处的连续性不是很重要？）! 得到每个网格边界处的浓度值，就能较为容易地计算网格边界处的通量。在边界处传输的平均浓度为 其中 假设为正数，表示 在一次积分时间中，在空间上移动的距离（ ）。 将公式\\ref{2.4} 带入，可以得到 对于第 个格子，公式中的浓度变化代表了从右边传出（ 损失浓度），或者从右边传入的量（ 损失浓度），二者只有一种可能，这取决于风的方向。 from sympy import * init_printing () ci = symbols ( \"c_i\" ) cLi = symbols ( \"cL_i\" ) cRi = symbols ( \"cR_i\" ) x = symbols ( \"x\" ) xLi = symbols ( \"xL_i\" ) xRi = symbols ( \"xR_i\" ) dx = symbols ( \"dx\" ) c6i = symbols ( \"c6_i\" ) y = symbols ( \"y\" ) f = cLi + ( x - xLi ) / dx * ( cRi - cLi + ( xRi - x ) / dx * c6i ) # 公式2.4 fR = integrate ( f , ( x , xRi - y , xRi )) / y # 在边界处进行积分 # 对积分后和方程进行整理 ff = simplify ( factor ( simplify ( fR )) . subs ( xRi , xLi + dx )) ff . subs ( y , dx * x ) 在每个网格边界处的单位时间的平均浓度之后，针对某个网格，考虑左右边界的通量，并对时间进行积分，最终就可以获得平流的影响。 其中 为边界处的通量。 PPM的程序实现用到的公式包括: 公式 \\ref{2.5} 公式 \\ref{2.8} 公式 \\ref{2.9} 公式 \\ref{2.10} 公式 \\ref{2.12} 公式 \\ref{2.13} 公式 \\ref{2.14} Note Sportisse B. Fundamentals in air pollution: from processes to modelling[M]. Springer Science & Business Media, 2009. Colella P, Woodward P R. The piecewise parabolic method (PPM) for gas-dynamical simulations[J]. Journal of computational physics, 1984, 54(1): 174-201. Todo 公式\\ref{2.9} 的物理意义？ 公式\\ref{2.10} 的具体推导过程？ 三维格子是怎么拓展的，需要注意哪些细节？","tags":"","loc":"page/ppm.html"},{"title":"第二章 包管理器 – atom","text":"Warning 万丈高楼平地起 简介 fpm（Fortran Package Manager） 是一个专门为Fortran语言设计的包管理工具，旨在简化Fortran项目的依赖管理、构建和发布过程。 主要特点和优势： 简化的依赖管理：fpm允许Fortran项目定义和管理依赖关系，可以轻松地引入和使用外部库和模块，而无需手动下载和配置。 fpm 鼓励采用现代化的项目结构，例如使用模块化的源代码组织方式，这有助于提高代码的可维护性和可扩展性。 易于使用的命令行界面：fpm 提供了简单明了的命令行界面，使得项目的构建、测试和发布过程更加方便和高效。 fpm 支持集成测试，可以帮助开发者编写和运行测试用例，确保代码的质量和稳定性。 使用fpm的基本流程 初始化一个新项目 fpm new ppm 编辑项目描述文件 name = \"ppm\" version = \"0.1.0\" license = \"license\" author = \"xiaolh\" maintainer = \"xiaolh@3clear.com\" copyright = \"Copyright 2024, xiaolh\" [build] auto-executables = true auto-tests = true auto-examples = true module-naming = false [install] library = false [fortran] implicit-typing = false implicit-external = false source-form = \"free\" [dependencies] stdlib = \"*\" [dev-dependencies] test-drive . git = \"https://github.com/fortran-lang/test-drive\" test-drive . tag = \"v0.4.0\" 构建和测试项目 fpm build\nfpm test Note fpm手册","tags":"","loc":"page/fpm.html"},{"title":"第三章 文档生成 – atom","text":"Warning 用正确的方式，做正确的事情 简介 写文档一直都是程序员的噩梦，特别是在word文档里面编辑。 代码总是确定性的描述，而文字则是充满了歧义。当时看代码总是痛苦的，因为代码是给编译器看的，所以我们一定是需要文档的。 如何减少写文档的痛苦，当前的最佳文档实践方式是在实现代码的同时，在代码的相同位置，以注释的方式去进行文档的编写。 这样就引申出一个需求，如何把代码文件（一般为文本文件）中的以注释编辑的文档，以更加漂亮可读的方式呈现出来。 这就是文档自动生成工具的由来，而目前最好的为fortran而生的文档生成工具就是 ford ford采用 Markdown 来编写纯文本格式的文档。 ford的使用非常简单，只需要在代码仓的主目录中输入 ford proj.md 即可在当前目录产生HTML格式的文档，简单来说，ford会从 proj.md （命名方式并不固定）读取一些代码仓的元数据信息（比如作者名称，简洁等等，也包含ford的一些配置信息），同时会解析代码仓主目录下的 src/*[fF]90 代码文件，会形成相关的链接结构（方便进行跳转）。当然ford也会额外的抽取一些特殊的注释文档，在后续会详细介绍。 编写全局说明文档 很多时候，我们需要为一个仓写一些 全局 的说明性文档，也有可能针对某个复杂的函数，需要很多文档进行 在代码中编写文档 如果在写Fortran时，不写专门的文档注释，那么ford只是简单的把源代码（ *.f90 ）、代码中的模块（ Module ）和模块中的过程体（ Module ）和模块中的一些独立单元（ subroutine, function, type ）和入口函数（ program ）解析出来，并形成链接。如果我们要告诉ford，对于某个对象，你应该额外的抽出一些注释，我们应该怎么做呢？ 用双感叹号 !! 来告诉ford（这个符号可以改变，但是一般来说没有必要），这是文档注释。而ford会忽略掉普通的感叹号 ! 注释。 文档注释应该在标注代码之后（有些人喜欢在函数定义的前面写函数的注释，通过特殊的标注 !> 也是可以支持的，不过不建议这样去做）。 subroutine demo ( cats , dogs , food , angry ) !! Feeds your cats and dogs, if enough food is available. If not enough !! food is available, some of your pets will get angry. ! Arguments integer , intent ( in ) :: cats !! The number of cats to keep track of. integer , intent ( in ) :: dogs !! The number of dogs to keep track of. real , intent ( inout ) :: food !! The ammount of pet food (in kilograms) which you have on hand. integer , intent ( out ) :: angry !! The number of pets angry because they weren't fed. return end subroutine demo 对于比较长的文档块，可以使用 !* 作为第一条文档的注释。 注意实现 在用ford生成静态网页时，加上-o选项，指定输出的目录 ford atom.md -o docs Note markdown latex 语法 ford手册","tags":"","loc":"page/ford.html"},{"title":"第四章 部署文档 – atom","text":"Warning 工具是第一生产力 简介 ford基于代码中的文档和全局文档，自动生成静态网页（HTML）。这些网页最后需要部署在HTTP服务上，才能进行分享。 有两个部署静态网页的平台值得推荐。 github pages Netlify github pages 打开一个仓，按照setting里面的步骤提示一步一步进行基本就可以完成配置。 在设置(setting)里面, 找到pages，并开启 设置要部署的分支；并设置目录，一般为 ./docs 设置域名名称，一般产生的URL为 https://username.github.io/something 在代码仓中生成docs目录（Fortran里面用ford去做） 把仓推送到GitHub，即可访问文档的URL 高级功能可以查看 GitHub Pages Netlify Netlify 的部署也是比较简单， 可以使用github账户登录Netlify，有一个引导页面，一步一步操作即可 有以下几项需要注意 用GitHub账号登录Netlify之后，GitHub上面会安装名为Netlify的Application。 在引导页面中Netlify会要求获取账号下面的所有仓的只读访问权限，可以选择只给部分仓的权限。后面需要添加新仓的支持的时候，可以在GitHub上进行设置。也可以点击Netlify中的 Add new site 中的导入一个新仓，这个操作会弹出一个引导页面，选择GitHub，然后添加账户名下的 Add another organization ，这样会跳转到\nGitHub的Application设置页面。 高级功能可以查看 Netlify 文档 Note GitHub Pages Netlify 主页","tags":"","loc":"page/docs.html"}]}