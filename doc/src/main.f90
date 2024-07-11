
program main
    !! This is our program
    use routines, only: xyadv

    implicit none

    integer, parameter :: nx = 100
    integer, parameter :: ny = 50
    integer, parameter :: nt = 60
    real, parameter :: dt = 1.0
    real :: dx, dy
    real, dimension(nx, ny) :: u, v, conc

    integer :: i, j

    dx = 10
    dy = 10
    ! Set initial condition (e.g., Gaussian distribution)
    do i = 1, nx
        do j = 1, ny
            conc(i, j) = exp(-((i*dx - 0.5)**2 + (j*dy - 0.5)**2) / 0.01)
        end do
    end do

    u = 1
    v = 1
    do i = 1, nt
        call xyadv(u, v, conc, dt, dx, dy)
    end do

end program main
