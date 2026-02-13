cmake_minimum_required(VERSION 3.18.1)
project(llama-android)

# -------------------------------------------------------
# 1) Locate llama.cpp (must sit NEXT to this file)
# -------------------------------------------------------
set(LLAMA_CPP_DIR "${CMAKE_CURRENT_SOURCE_DIR}/llama.cpp")
set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -O3 -Ofast -flto")
set(CMAKE_C_FLAGS "${CMAKE_C_FLAGS} -O3 -Ofast -flto")

if (NOT EXISTS "${LLAMA_CPP_DIR}/CMakeLists.txt")
  message(FATAL_ERROR "
  ❌ llama.cpp NOT FOUND at:
  ${LLAMA_CPP_DIR}

  You must place the full llama.cpp repo here:
  client/android/app/src/main/cpp/llama.cpp
  ")
endif()

# -------------------------------------------------------
# 2) Android + performance flags
# -------------------------------------------------------
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_POSITION_INDEPENDENT_CODE ON)

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
# 5) UPDATED include paths (NEW llama.cpp layout)
# -------------------------------------------------------
target_include_directories(
  llama-android
  PRIVATE
  ${LLAMA_CPP_DIR}
  ${LLAMA_CPP_DIR}/include
  ${LLAMA_CPP_DIR}/src      # <-- IMPORTANT FIX
)

# -------------------------------------------------------
# 6) Link everything
# -------------------------------------------------------
target_link_libraries(
  llama-android
  PRIVATE
  llama
  log
  android
  OpenMP::OpenMP_CXX
)
