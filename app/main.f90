
program main
    !! This is our program
    use mod_ppm, only: adv_by_ppm
    implicit none

    integer, parameter :: nx = 102
    integer, parameter :: nt = 150
    real, parameter :: dt = 1.0
    real, parameter :: dx = 5.0
    real, dimension(nx) :: u, c, increment
    integer :: i

    c = 0.
    u = 2.0 

    do i = 1, nt
        if (i >= 10) c(1) = 10. 
        call adv_by_ppm(dt, dx, nx, u, c, increment)
        write(*, "(20F6.2)") c(5:15)
    end do

end program main
