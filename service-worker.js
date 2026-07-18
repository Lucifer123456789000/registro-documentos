const CACHE_NAME = "registro-documentos-v1";


const ARCHIVOS = [

"./",
"./index.html",
"./style.css",
"./script.js",
"./manifest.json"

];



// Instalar aplicación

self.addEventListener(
"install",
evento=>{


evento.waitUntil(

caches.open(CACHE_NAME)
.then(cache=>{

return cache.addAll(ARCHIVOS);

})

);


});




// Activar nueva versión

self.addEventListener(
"activate",
evento=>{


evento.waitUntil(

caches.keys()
.then(keys=>{


return Promise.all(

keys.map(key=>{


if(key !== CACHE_NAME){

return caches.delete(key);

}


})


);


})

);


});






// Trabajar sin internet

self.addEventListener(
"fetch",
evento=>{


evento.respondWith(


caches.match(evento.request)

.then(respuesta=>{


return respuesta || fetch(evento.request);


})


);


});