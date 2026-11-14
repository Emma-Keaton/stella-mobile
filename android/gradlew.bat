@rem Stella Mobile — Gradle Wrapper (Windows)
@if "%~dp0%0" == "" set APP_HOME=%~dp0
set APP_HOME=%~dp0..%
set WRAPPER_JAR=%APP_HOME%gradle\wrapper\gradle-wrapper.jar

if not exist "%WRAPPER_JAR%" (
  echo Gradle wrapper JAR not found. Please download Gradle 8.4 and place it at %WRAPPER_JAR%
  exit /b 1
)

java -jar "%WRAPPER_JAR%" %*