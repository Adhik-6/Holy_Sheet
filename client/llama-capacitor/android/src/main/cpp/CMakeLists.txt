cmake_minimum_required(VERSION 3.18.1)
project(llama-android)

# -------------------------------------------------------
# 1) Locate llama.cpp
# -------------------------------------------------------
set(LLAMA_CPP_DIR "${CMAKE_CURRENT_SOURCE_DIR}/llama.cpp")

if (NOT EXISTS "${LLAMA_CPP_DIR}/CMakeLists.txt")
  message(FATAL_ERROR "❌ llama.cpp NOT FOUND at ${LLAMA_CPP_DIR}")
endif()

# -------------------------------------------------------
# 2) C++ Standard + PIC
# -------------------------------------------------------
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_POSITION_INDEPENDENT_CODE ON)

# -------------------------------------------------------
# 3) Backend selection
#    Vulkan compiled in — hidden at runtime via
#    GGML_VK_VISIBLE_DEVICES=-1 for CPU-only devices
# -------------------------------------------------------
set(GGML_VULKAN  ON  CACHE BOOL "Enable Vulkan"          FORCE)
set(LLAMA_VULKAN ON  CACHE BOOL "Enable Vulkan (Legacy)" FORCE) # Safe fallback for versioning

# 🔥 THE FIX: Force the compiler to see Vulkan globally
add_compile_definitions(GGML_USE_VULKAN=1)
add_compile_definitions(LLAMA_USE_VULKAN=1)

set(GGML_METAL   OFF CACHE BOOL "Disable Metal"    FORCE)
set(GGML_CUDA    OFF CACHE BOOL "Disable CUDA"     FORCE)
set(GGML_OPENCL  OFF CACHE BOOL "Disable OpenCL"   FORCE)
set(GGML_CPU     ON  CACHE BOOL "Enable CPU"       FORCE)

# -------------------------------------------------------
# 4) CPU optimization
#    Baseline: armv8-a (safe for all Android devices)
#    llama.cpp internally compiles dotprod/fp16 hot paths
#    separately via GGML_CPU_ARM_ARCH + GGML_CPU_REPACK
#    To enable dotprod, replace the first 2 lines of this block (4) with the next 2 following lines:
#    set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -O3 -Ofast -flto -march=armv8.2-a+dotprod+fp16")
#    set(CMAKE_C_FLAGS   "${CMAKE_C_FLAGS}   -O3 -Ofast -flto -march=armv8.2-a+dotprod+fp16")
# -------------------------------------------------------
set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -O3 -Ofast -flto -march=armv8-a")
set(CMAKE_C_FLAGS   "${CMAKE_C_FLAGS}   -O3 -Ofast -flto -march=armv8-a")

set(GGML_CPU_ARM_ARCH "armv8-a" CACHE STRING "Base CPU arch for llama.cpp" FORCE)
set(GGML_CPU_REPACK   ON        CACHE BOOL   "Enable weight repacking"     FORCE)

# -------------------------------------------------------
# 5) Static linking
# -------------------------------------------------------
set(GGML_BACKEND_SHARED OFF CACHE BOOL "Static ggml backends" FORCE)
set(LLAMA_SHARED        OFF CACHE BOOL "Static llama"         FORCE)
set(GGML_SHARED         OFF CACHE BOOL "Static ggml"          FORCE)

# -------------------------------------------------------
# 6) OpenMP
# -------------------------------------------------------
find_package(OpenMP REQUIRED)
if (OpenMP_CXX_FOUND)
  set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} ${OpenMP_CXX_FLAGS}")
endif()

# -------------------------------------------------------
# 6.5) VULKAN C++ BINDINGS (Bridging the NDK Gap)
# -------------------------------------------------------
file(TO_CMAKE_PATH "$ENV{VULKAN_SDK}" VULKAN_SDK_PATH)
include_directories("${VULKAN_SDK_PATH}/Include")

# -------------------------------------------------------
# 7) Add llama.cpp
# -------------------------------------------------------
add_subdirectory(${LLAMA_CPP_DIR})

# -------------------------------------------------------
# 8) JNI bridge
# -------------------------------------------------------
add_library(llama-android SHARED llama-jni.cpp)

target_include_directories(
  llama-android PRIVATE
  ${LLAMA_CPP_DIR}
  ${LLAMA_CPP_DIR}/include
  ${LLAMA_CPP_DIR}/src
)

# -------------------------------------------------------
# 9) Link
#    --whole-archive ensures Vulkan backend symbols are
#    not stripped by the linker even if unreferenced
# -------------------------------------------------------
target_link_libraries(
  llama-android
  PRIVATE
  llama
  -Wl,--whole-archive
  ggml-vulkan
  -Wl,--no-whole-archive
  vulkan
  log
  android
  OpenMP::OpenMP_CXX
)