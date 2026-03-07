cmake_minimum_required(VERSION 3.18.1)
project(llama-android)

# -------------------------------------------------------
# 1) Locate llama.cpp
# -------------------------------------------------------
set(LLAMA_CPP_DIR "${CMAKE_CURRENT_SOURCE_DIR}/llama.cpp")

if (NOT EXISTS "${LLAMA_CPP_DIR}/CMakeLists.txt")
  message(FATAL_ERROR "❌ llama.cpp NOT FOUND")
endif()

# -------------------------------------------------------
# 2) Android + Performance Flags (CPU ONLY)
# -------------------------------------------------------
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_POSITION_INDEPENDENT_CODE ON)

# 🚫 DISABLE VULKAN COMPLETELY
set(GGML_VULKAN OFF CACHE BOOL "Disable Vulkan" FORCE)
set(GGML_METAL OFF CACHE BOOL "Disable Metal" FORCE)
set(GGML_CUDA OFF CACHE BOOL "Disable CUDA" FORCE)
set(GGML_OPENCL OFF CACHE BOOL "Disable OpenCL" FORCE)

# 🔥 CPU OPTIMIZATION FLAGS
set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -O3 -Ofast -flto -march=armv8.2-a+dotprod+fp16")
set(CMAKE_C_FLAGS   "${CMAKE_C_FLAGS}   -O3 -Ofast -flto -march=armv8.2-a+dotprod+fp16")

# 🔥 ENABLE LLAMA.CPP NATIVE CPU BACKENDS
set(GGML_CPU ON CACHE BOOL "Enable CPU backend" FORCE)

# 🔥 Static linking (no dynamic backend loading issues)
set(GGML_BACKEND_SHARED OFF CACHE BOOL "Disable dynamic backends" FORCE)
set(LLAMA_SHARED OFF CACHE BOOL "Build static llama libs" FORCE)
set(GGML_SHARED OFF CACHE BOOL "Build static ggml libs" FORCE)

# 🔥 OpenMP for multi-threaded CPU inference
find_package(OpenMP REQUIRED)
if (OpenMP_CXX_FOUND)
  set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} ${OpenMP_CXX_FLAGS}")
endif()

# -------------------------------------------------------
# 3) Add llama.cpp
# -------------------------------------------------------
add_subdirectory(${LLAMA_CPP_DIR})

# -------------------------------------------------------
# 4) Your JNI bridge
# -------------------------------------------------------
add_library(
  llama-android
  SHARED
  llama-jni.cpp
)

# -------------------------------------------------------
# 5) Include paths
# -------------------------------------------------------
target_include_directories(
  llama-android
  PRIVATE
  ${LLAMA_CPP_DIR}
  ${LLAMA_CPP_DIR}/include
  ${LLAMA_CPP_DIR}/src
)

# -------------------------------------------------------
# 6) Link everything (no Vulkan)
# -------------------------------------------------------
target_link_libraries(
  llama-android
  PRIVATE
  llama
  log
  android
  OpenMP::OpenMP_CXX
)