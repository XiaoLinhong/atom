## 0. compile object
TARGET = atom

## 1. compile configure
FFLAGS = # 编译选项 
LDFLAGS = # 链接的库位置

ifeq ($(COMPIFLE),)
   COMPIFLE = gnu
endif

ifeq ($(COMPIFLE), gnu)
   FC = gfortran
   # 增强警告
   FFLAGS += -Wall -Werror -Wall -Warray-bounds
   # 良好的编译习惯
   FFLAGS += -Wshadow -Wconversion
   # 
   FFLAGS += -Wunreachable-code -Wunused-parameter -Wunused-variable

endif

ifeq ($(COMPIFLE), intel)
   FC = ifort
   # Enable Intel compiler warnings
   FFLAGS += -warn=all
   # Good coding practices
   FFLAGS +=
   # Additional warnings
   FFLAGS += 
endif

ifeq ($(MAKECMDGOALS), $(filter $(MAKECMDGOALS),gdb vs))
    FFLAGS += -g
else
    FFLAGS += -Ofast # Optimization flags
endif

ifneq ($(MAKECMDGOALS), clean)
  $(info # Building $(TARGET) [$(FC) $(FFLAGS)])
endif

## 2. directory
# Create the destination directory (`./build`)
WORK_DIR  = $(shell pwd)
SRC_DIR   = $(WORK_DIR)/src
DST_DIR   = $(WORK_DIR)/build
INC_DIR   = $(WORK_DIR)/build

# 创建编译目录
$(shell mkdir -p $(DST_DIR))

FFLAGS += -I$(INC_DIR)

# execuble file
EXE = $(DST_DIR)/$(TARGET)

# Source files
SRCS := $(wildcard $(SRC_DIR)/*.f90) # 返回匹配到的文件列表
SRCS +=  # Add your source files here

# Object files
NAME := $(notdir $(SRCS))
OBJS := $(addprefix $(DST_DIR)/, $(NAME:.f90=.o)) # 变量值的替换
# OBJDEPS := $(OBJECTS:.o=.d) # 头文件的依赖

## 3. compile
ifeq ($(MAKECMDGOALS), test)
    FFLAGS += -fbacktrace # Optimization flags
    TEST_DIR = $(WORK_DIR)/$(TARGET)/test
    SRCS += $(wildcard $(TEST_DIR)/*.f90)
    EXE = $(WORK_DIR)/$(test)
endif

# link the program
$(EXE): $(OBJS)
	@$(FC) $(FFLAGS) $(LDFLAGS) $^ -o $@

# 静态模式替换
$(OBJS): $(DST_DIR)/%.o: $(SRC_DIR)/%.f90
	$(FC) $(FFLAGS) -c $< -o $@

## 4. run this program 

# Debug the program with GDB
vs: $(EXE)
	$(EXE)

gdb: $(EXE)
	gdb $(EXE)

run: $(EXE)
	$(EXE)

test: $(EXE)
	$(EXE)

# Clean up
clean:
	rm -rf $(DST_DIR)
