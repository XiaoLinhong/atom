module test_ppm
  use mod_ppm, only: adv_by_ppm
  use testdrive, only : error_type, unittest_type, new_unittest, check
  implicit none
  private

  public :: collect_ppm

contains

  !> Collect all exported unit tests
  subroutine collect_ppm(testsuite)
    !> Collection of tests
    type(unittest_type), allocatable, intent(out) :: testsuite(:)

    testsuite = [new_unittest("boundary", test_boundary)]
  end subroutine collect_ppm

  !> Check substitution of a single line
  subroutine test_boundary(error)
    !> Error handling
    type(error_type), allocatable, intent(out) :: error
  
    integer, parameter :: nx = 50+2
    integer, parameter :: nt = 20
    real, parameter :: dt = 1.0
    real, parameter :: dx = 5.0
    real, dimension(nx) :: u, c, increment
    integer :: i

    c = 0.
    u = 2.0 
    do i = 1, nt
        if (i >= 10) c(1) = 10. 
        call adv_by_ppm(dt, dx, nx, u, c, increment)
    end do
    call check(error, c(1) == 10., "This is left boundary")
    call check(error, c(nx) == 0., "Right boundary must be 0")
  end subroutine test_boundary
end module test_ppm

program tester
  use, intrinsic :: iso_fortran_env, only : error_unit
  use testdrive, only : run_testsuite
  use test_ppm, only : collect_ppm
  implicit none
  integer :: stat

  stat = 0
  call run_testsuite(collect_ppm, error_unit, stat)

  if (stat > 0) then
    write(error_unit, '(i0, 1x, a)') stat, "test(s) failed!"
    error stop
  end if

end program tester
