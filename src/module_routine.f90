module routines
    implicit none

contains

! This subroutine performs advection of a scalar quantity (concentration) using a simple 
! forward-in-time, centered-in-space scheme.
!
! Arguments:
!   u, v: 2D arrays representing the velocity components in x and y directions, respectively.
!   conc: 2D array representing the scalar quantity to be advected.
!   dt: Time step size.
!   dx, dy: Spatial step sizes in x and y directions, respectively.
!
! Returns:
!   The subroutine updates the 'conc' array in-place with the advected concentration.
!
subroutine xyadv(u, v, conc, dt, dx, dy)
    implicit none

    ! args
    real, intent(in) :: dt
    real, intent(in) :: dx, dy
    real, dimension(:, :), intent(inout) :: u, v
    real, dimension(:, :), intent(inout) :: conc

    ! local
    integer :: i, j

    ! Perform advection using a simple forward-in-time, centered-in-space scheme
    do i = 2, size(conc, 1) - 1
        do j = 2, size(conc, 2) - 1
            conc(i, j) = conc(i, j) - &
                (u(i, j) * dt / dx) * (conc(i, j) - conc(i - 1, j)) - &
                (v(i, j) * dt / dy) * (conc(i, j) - conc(i, j - 1))
        end do
    end do

end subroutine xyadv

end module routines
