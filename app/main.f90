module mod_func
    implicit none
    private

    real, parameter :: BEG = -20.
    real, parameter :: END = -0.

    public :: piecewise_constant

    contains

    real function piecewise_constant(x) result(c)
        real, intent(in) :: x
        if (x >= BEG .and. x <= END)  then
            c = 10.
        else
            c = 0.
        end if
    end function piecewise_constant

end module mod_func

program main
    !! This is our program
    use mod_ppm, only: adv_by_ppm
    use mod_func, only: piecewise_constant
    implicit none

    ! CFL = u*dt/dx < 1
    real, parameter :: dt = 1.0
    real, parameter :: dx = 2.0
    real, parameter ::  v = 1.0

    real, parameter ::  x = 80.
    real, parameter ::  t = (x/v)*2.0

    real, parameter :: SMALL = 1e-4


    integer, parameter :: nx = int(x/dx)+2
    integer, parameter :: nt = int(t/dt)

    real, dimension(nx) :: u, c, ctrue, increment
    integer :: i

    real :: bb, ee

    c = 0.
    ctrue = 0.
    u = v
 
    write(*, "(20F6.2)") -20., 0., v, dt, dx, -dx/2, x+dx/2
    do i = 0, nt
        bb = -dx - i*dt*v + SMALL
        ee =     - i*dt*v - SMALL
        ! do j = 1, nx-1
        !    ctrue(j) = (piecewise_constant(bb + (j-1)*dx ) + piecewise_constant(ee + (j-1)*dx))/2.0
        ! end do
        ! write(*, "(I4, 100F6.2)") i, ctrue
        c(1) = (piecewise_constant(bb) + piecewise_constant(ee))/2.0 ! 线性边界条件
        write(*, "(100F6.2)") i*dt, c
        call adv_by_ppm(dt, dx, nx, u, c, increment)
    end do

end program main
