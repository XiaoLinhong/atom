module mod_ppm
   !* The **one-dimensional implementation** of the PPM
   ! （piecewise parabolic method, 分段抛物线法）
   !
   ! - 假设1：等距网格
   ! - 假设2：第一个网格和最后一个网格为区域边界网格，为外部约束。
   ! 
   !  **Step 1**: 计算2~n-1个网格的平均坡度(slopC)
   ! 
   !  \[\delta c_{i} = 0.5(c_{i+1} - c_{i-1})\]
   !  
   !  为了让浓度不连续的地方模拟得更好，
   !  同时，确保网格边界处浓度在左右格子平均浓度之间，
   !  对\(\delta c_{i}\)进行约束。
   ! \[
   !    \delta_m c_{i} = 
   !    \begin{cases}
   !    min(|\delta c_{i}|, 2|c_{i+1} - c_{i}|, 2|c_{i} - c_{i-1}|)*sign(\delta c_{i})
   !    &\quad {\text{if } (c_{i+1} - c_{i})(c_{i} - c_{i-1}) \gt 0 }\\
   !    \text{0,} &\quad \text{else} \\
   !    \end{cases}
   !    \tag {2.9} \label {2.9}
   ! \]
   ! 
   !  **Step 2**: 每个网格边界处的浓度
   ! \[
   !    c_{x_{i+1/2}} =
   !    c_i + 0.5(c_{i+1}-c_i) +
   !    \frac{1}{6}(\delta_m c_{i} - \delta_m c_{i+1}) 
   !    \tag {2.8} \label {2.8}
   ! \]
   !  **Step 3**: 计算抛物线参数，并对边界处浓度进行约束
   ! \[
   ! c_{6,i} = 6(c_i- \frac{1}{2}(c_{x_{i+1/2}} + c_{x_{i-1/2}}) )
   ! \tag {2.5} \label {2.5}
   ! \]
   ! \begin{align*}
   ! c_{x_{i-1/2}} &= c_{x_{i+1/2}} = c_{i} \quad \text{if } 
   ! (c_{x_{i+1/2}}-c_{i}) (c_{i}-c_{x_{i-1/2}}) \le 0 \\
   ! c_{x_{i-1/2}} &= 3c_{i} - 2c_{x_{i+1/2}}  \quad \text{if }  \Delta c_i c_{6,i} > (\Delta c_i)^2 \\
   ! c_{x_{i+1/2}} &= 3c_{i} - 2c_{x_{i-1/2}}  \quad \text{if } - \Delta c_i c_{6,i} > (\Delta c_i)^2
   ! \tag {2.10} \label {2.10}
   ! \end{align*}
   ! 
   ! **Step 4**: 计算边界处传输的平均浓度，及其通量
   ! \begin{align*}
   !    c_{i+1/2, L}(y) &= c_{x_{i+1/2}} - \frac{y}{2\Delta x}
   !    (c_{x_{i+1/2}} - c_{x_{i-1/2}} -(1-\frac{2y}{3\Delta x})c_{6,i}) \\
   !    c_{i+1/2, R}(y) &= c_{x_{i+1-1/2}} - \frac{y}{2\Delta x}
   !    (c_{x_{i+1+1/2}} - c_{x_{i+1-1/2}} -(1-\frac{2y}{3\Delta x})c_{6,i+1})
   !    \tag {2.12} \label {2.12}
   ! \end{align*}
   ! 其中\(y=|u\Delta t|\)
   ! \[
   !   f_{i+1/2} = 
   !   \begin{cases}
   !   u_{x_{i+1/2}} \times c_{i+1/2, L}  &\quad {\text{if } u_{x_{i+1/2}} \ge 0 }\\
   !   u_{x_{i+1/2}} \times c_{i+1/2, R}  &\quad {\text{if } u_{x_{i+1/2}} \le 0 } \\
   !   \end{cases}
   !   \tag {2.14} \label {2.14}
   ! \]
   ! **Step 5**: 用前向欧拉法进行时间积分
   ! \[
   !    c_i^{n+1} = c_i^{n} + \frac{\Delta t}{\Delta x}(f_{i-1/2}-f_{i+1/2})
   !    \tag {2.13} \label {2.13}
   ! \]
   ! 网格设计
   !```
   !     |Boundary|<-----------------Domain----------------->|Boundary|
   !     |  c(1)  |   c(2)  |-----------------------| c(n-1) |  c(n)  |     
   !     |       u(1)      u(2) ->                         u(n-1)    u(n)
   !     |        | slopC(2)|
   !     |        |deltaC(2)|
   !     |        |  c6(2)  |
   !  leftC(1) leftC(2) 
   !           rightC(1) rightC(2) 
   !  egdeC(0) egdeC(1)  egdeC(2)
   !           transC(1) transC(2)
   !           flux(1)    flux(2) ->                     flux(n-1)
   !```
   implicit none

contains

   subroutine adv_by_ppm(dt, dx, n, u, c, increment, volume)
      !! 基于PPM方法实现的一维平流函数
      ! input args
      real, intent(in) :: dt !! 时间间隔: s
      real, intent(in) :: dx !! 网格分辨率: m
      integer, intent(in) :: n !! 网格数: 2~n-1 参与平流计算
      real, intent(in)    :: u(n) !! 风速: m/s，网格可以比n少一个
      ! output args
      real, intent(inout) :: c(n)  !! 网格浓度: umol/m3，包含两个边界浓度
      real, intent(out)   :: increment(n) !! 浓度变化: umol/m3，只有2~n-1有效
      ! optional args
      real, optional, intent(in) :: volume(n) !! 每个网格的体积校正因子: dx*dy*dz;

      ! local variables
      ! mass grid
      real :: c6(n) ! 决定了抛物线的凸凹特征
      real :: slopC(n)  ! average slop: \(\delta c\) or \(\delta_m c\)
      real :: deltaC(n) ! rightC - leftC \(\Delta c\) 

      ! stag grid: 第i个mass网格的右边为stag网格的i
      real :: egdeC(0:n) ! 格子和格子之间的边界处的浓度
      real :: leftC(n)   ! 网格的左边界处的浓度 leftC = (0:n-1)
      real :: rightC(n)  ! 网格的右边界处的浓度 rightC = (1:n)
      real :: transC(n)  ! 边界处的浓度随着风场输出(一小段距离)的平均浓度 transport
      real :: flux(n)    ! 边界处的通量

      real :: CFL :  ! Courant-Friedrichs-Lewy条件：u*dt/dx
      real :: fL, fR ! 一个网格的左右通量
      integer :: i

      ! step 1:
      do i=2, n-1
         ! Compute average slope in the i'th cell
         slopC(i) = 0.5 * (c(i+1) - c(i-1))
         ! Constraint: 确保梯度不要太大
         if ((c(i+1) - c(i))*(c(i) - c(i-1)) > 0.) then
            slopC(i) = sign(1., slopC(i))* &
                        min(abs(slopC(i)), &
                            2.*abs(c(i+1) - c(i)), &
                            2.*abs(c(i) - c(i-1)))
         else ! 局地极值情况
            slopC(i) = 0
         end if
      end do

      ! step 2: Compute concentrations at cell boundaries
      ! Zero order polynomial
      egdeC(0) = c(1)
      egdeC(n) = c(n)
      ! First order polynomial
      egdeC(1) = (c(2) - c(1))/2
      egdeC(n-1) = (c(n) - c(n-1))/2
      ! 求边界处的值
      do i=2, n-2
         egdeC(i) = c(i) + (c(i+1) - c(i))/2 + (slopC(i) - slopC(i+1))/6.
      end do
      leftC = egdeC(0:n-1)
      rightC = egdeC(1:n)

      ! step 3: 对边界处浓度进行约束
      do i=2, n-2
         ! 更新边界处浓度
         if ((rightC(i) - c(i))*(c(i) - leftC(i)) > 0.) then
            deltaC(i) = rightC(i) - leftC(i)
            c6(i) = 6.*(c(i) - (rightC(i) + leftC(i))/2.)
            ! Overshoot cases
            if (deltaC(i)*c6(i) > deltaC(i)*deltaC(i)) then
               leftC(i) = 3.*c(i) - 2.*rightC(i)
            else if (-deltaC(i)*deltaC(i) > deltaC(i)*c6(i)) then
               rightC(i) = 3.*c(i) - 2.*leftC(i)
            endif
         else ! 局地极值
            leftC(i) = c(i)
            rightC(i) = c(i)
         end if

         ! 确定每个格子抛物线参数：rightC, leftC, c6;
         deltaC(i) = rightC(i) - leftC(i)
         c6(i) = 6.*(c(i) - (rightC(i) + leftC(i))/2.)
      end do

      ! 第四步: Compute fluxes 
      ! fluxes from boundary cells 
      if (u(1) > 0.) flux(1) = u(1) * leftC(1) ! assuming uniform distribution
      if (u(1) < 0.) flux(1) = u(1) * leftC(1+1) ! First order polynomial
      if (u(n-1) > 0.) flux(n-1) = u(n-1) * rightC(n-1) ! First order polynomial
      if (u(n-1) < 0.) flux(n-1) = u(n-1) * rightC(n)
      ! fluxes from the parabolic distribution
      do i=2, n-2
         CFL = abs((u(i)*dt)/dx) ! Guarantee y = u(i)*dt > 0
         if (u(i) > 0.) then ! 公式 2.12
            transC(i) = rightC(i) - CFL/2 * (deltaC(i) - (1. - CFL*2./3.)*c6(i))
         else
            transC(i) = leftC(i+1) - CFL/2 * (deltaC(i+1) - (1. - CFL*2./3.)*c6(i+1))
         end if
         flux(i) = u(i) * transC(i) ! 公式2.14
      end do

      ! 第5步: 时间积分 
      do i=2, n-1 
         fR = flux(i)
         fL = flux(i-1)
         if (present(volume)) then ! 进行校正体积校正，保证质量守恒
            if (fL > 0) fL = fL*volume(i-1)/volume(i) 
            if (fR < 0) fR = fR*volume(i+1)/volume(i)
         end if
         ! 公式2.13
         increment(i) = dt/dx * (fL - fR)
         c(i) = c(i) + increment 
      end do

   end subroutine adv_by_ppm

end module mod_ppm
