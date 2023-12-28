npx run ./node_modules/.bin/tsc --outDir ./build   
xcopy .\\public .\\build\\public\\ /s /e /y
xcopy .\\views .\\build\\views\\ /s /e /y
copy ./package.json ./build/package.json 
copy ./settings.json ./build/settings.json