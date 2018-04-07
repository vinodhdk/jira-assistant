md dist\unwanted
del dist\unwanted\* /q
del dist\assets\.npmignore /q
rmdir dist\assets
move dist\*.svg dist\unwanted\
move dist\*.txt dist\unwanted\
pause