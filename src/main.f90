
program main
    use routines, only: xyadv

    implicit none

    integer, parameter :: nx = 100
    integer, parameter :: ny = 50
    integer, parameter :: nt = 60
    integer, parameter :: dt = 1
    real :: dx, dy
    real, dimension(nx, ny) :: u, v, conc

    integer :: i, j, n

    dx = 10
    dy = 10
    ! 初始化坐标
    do i = 1, nx
        x(i) = real(i - 1) * dx
    end do
    do j = 1, ny
        y(j) = real(j - 1) * dy
    end do

    ! Set initial condition (e.g., Gaussian distribution)
    do i = 1, nx
        do j = 1, ny
            conc(i, j) = exp(-((x(i) - 0.5)**2 + (y(j) - 0.5)**2) / 0.01)
        end do
    end do

    u = 1
    v = 1
    do i = 1, nt
        call xyadv(u, v, conc, dt, dx, dy)
    end do

end program main
