@echo off
title AstroEspacio - Aprendizaje, Simulador y Camara con Personajes
echo ========================================================
echo   ASTROESPACIO: EVALUACION, SIMULADOR Y CAMARA WEB
echo ========================================================
echo.
echo Selecciona que deseas abrir:
echo   [1] Centro Completo (Evaluacion, Escuela y Minijuegos)
echo   [2] AstroPiloto (Simulador con Teclado / Joystick)
echo   [3] AstroAmigos (CAMARA WEB con Pinguinito, Pandita, Elefantito y Lobito)
echo   [4] Abrir todo
echo.
set /p opt="Elige una opcion (1, 2, 3 o 4) [Enter = 1]: "
if "%opt%"=="2" (
  start "" "aventura.html"
) else if "%opt%"=="3" (
  start "" "camara.html"
) else if "%opt%"=="4" (
  start "" "index.html"
  start "" "aventura.html"
  start "" "camara.html"
) else (
  start "" "index.html"
)
exit
