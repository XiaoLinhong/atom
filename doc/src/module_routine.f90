module routines
   !* performs advection using the one-dimensional implementation 
   !  of the piecewise parabolic method (分段抛物型方法) of Colella and Woodward (1984).
   !  A piecewise continuous parabola is used as the intepolation polynomial.
   !  The slope of the parabola at cell edges is computed from a cumulative
   !  function of the advected quantity. These slopes are further modified
   !  so that the interpolation function is monotone.

   implicit none

contains

   subroutine ppm(dt, dx, nn, area, areav, v, conc, flux)
      !! 一维平流函数
      implicit none

      ! args
      real, intent(in) :: dt !! 时间间隔: s
      real, intent(in) :: dx !! 网格分辨率: m
      integer, intent(in) :: nn !! 网格数
      real, intent(in) :: area_of_cell(nn) !! Cell area adjustment vector: 1/m2
      real, intent(in) :: area_of_face(nn) !! Interfacial area adjustment vector: m2
      real, intent(in)    :: v(nn) !! 风速: m/s

      real, intent(inout) :: conc(nn) !! 网格浓度: umol/m3
      real, intent(out) :: flux(nn) !! Conc change from interfacial mass flux: umol/m3


      ! local
      real, parameter :: TWO3RDS = 2./3.
      real :: fm(nn+1)
      real :: fp(nn+1)
      real :: cm(nn+1) ! 格子和格子之间的边界处的浓度
      real :: cl(nn+1) ! 网格的左边界处的浓度
      real :: cr(nn+1) ! 网格的右边界处的浓度
      real :: dc(nn+1) ! 两个格子之间的浓度差
      real :: c6(nn+1) ! 这个物理意义是啥？
      integer :: i
      real :: x ! 公式1.12

      ! Set all fluxes to zero. Either positive or negative flux
      ! will remain zero depending on the sign of the velocity
      fm = 0.
      fp = 0.

      ! handle boundary case: Zero order polynomial at the boundary cells
      cm(2) = conc(2)
      cm(nn) = conc(nn-1)
      ! First order polynomial at the next cells
      cm(3)    = (conc(3) + conc(2))/2.
      cm(nn-1) = (conc(nn-1) + conc(nn-2))/2.

      ! Second order polynomial inside the domain
      do i=3, nn-2
         dc(i) = 0.5*(conc(i+1) - conc(i-1)) ! 公式1.7
         ! Guarantee that CM lies between CON(I) and CON(I+1)：公式 1.8
         if ((conc(i+1) - conc(i))*(conc(i) - conc(i-1)) > 0.) then
            dc(i) = sign(1., dc(i))* &
            min(abs(dc(i)), 2.*abs(conc(i+1) - conc(i)), 2.*abs(conc(i) - conc(i-1))) 
         else
            dc(i) = 0. ! ?
         end if
      end do

      ! 公式1.6
      do i=3, nn-3
         cm(i+1) = conc(i) + 0.5*(conc(i+1) - conc(i)) + (dc(i) - dc(i+1))/6.
      end do

      do i=2, nn-1
         cr(i) = cm(i+1)
         cl(i) = cm(i)
      end do

      ! Generate piecewise parabolic distributions
      do i=2, nn-1
         ! 单调性
         if ((cr(i) - conc(i))*(conc(i) - cl(i)) > 0.) then
            dc(i) = cr(i) - cl(i) ! 公式1.5
            c6(i) = 6.*(conc(i) - 0.5*(cl(i) + cr(i))) ! 公式 1.5 
            ! Overshoot cases
            if (dc(i)*c6(i) > dc(i)*dc(i)) then
               cl(i) = 3.*conc(i) - 2.*cr(i)
            elseif (-dc(i)*dc(i) > dc(i)*c6(i)) then
               cr(i) = 3.*conc(i) - 2.*cl(i)
            endif
         else
            cl(i) = conc(i)
            cr(i) = conc(i)
         endif
         dc(i) = cr(i) - cl(i) ! 公式 1.5
         c6(i) = 6.*(conc(i) - 0.5*(cl(i) + cr(i)))
      end do

      ! Compute fluxes from the parabolic distribution
      do i=2, nn-1
         x = max(0., -v(i-1)*dt/dx) ! m/m
         fm(i) = x*(cl(i) + 0.5*x*(dc(i) + c6(i)*(1. - TWO3RDS*x))) ! 公式1.12

         x = max(0.,   v(i)*dt/dx)
         fp(i) = x*(cr(i) - 0.5*x*(dc(i) - c6(i)*(1. - TWO3RDS*x)))
      end do

      ! Compute fluxes from boundary cells assuming uniform distribution
      if (v(1) > .0.) then
         x = v(1)*dt/dx
         fp(1) = x*conc(1)
      end if

      if (v(nn-1).lt.0.) then
         x = -v(nn-1)*dt/dx
         fm(nn) = x*conc(nn)
      end if

      flux(1) = (fp(1) - fm(2)) ! ug/m^3?
      do i=2, nn-1
         flux(i) = (fp(i) - fm(i+1))
         conc(i) = conc(i) - (flux(i) - flux(i-1)) ! 公式1.13

         ! conc(i) = conc(i) - area_of_cell(i)*(area_of_face(i)*flux(i) - area_of_face(i-1)*flux(i-1))
      end do
   end subroutine xyadv

end module routines



area_of_face(i) = dy*(depth(i,j,k) + depth(i+1,j,k))/(mapscl(i,j) + mapscl(i+1,j))
area_of_cell(i) = mapscl(i, j)*mapscl(i, j)/(dy*depth(i,j,k))


