const SHEET_URL =
"https://script.google.com/macros/s/AKfycbzxUT9FQRmAe56gk3vW5l0RHbQRUmJtcMT4JCjiersMPOcM9ECcslw5iWxSVs0Bk_sNxQ/exec";



let db;



// =========================
// CREAR BASE DE DATOS
// =========================


let abrir = indexedDB.open(
"RegistroDocumentos",
1
);



abrir.onupgradeneeded=function(e){

db=e.target.result;


if(!db.objectStoreNames.contains("registros")){

db.createObjectStore(
"registros",
{
keyPath:"id",
autoIncrement:true
}
);


}


};



abrir.onsuccess=function(e){

db=e.target.result;

sincronizar();

};





// =========================
// USUARIO FIJO
// =========================


let usuario =
localStorage.getItem("usuario");


if(!usuario){

usuario=prompt(
"Ingrese usuario: Moises, Joan o Jidel"
);


localStorage.setItem(
"usuario",
usuario
);


}


document.getElementById("usuario").value=usuario;






// =========================
// SUCURSALES
// =========================


const listaSucursales=[

"SV Managua",
"SV Libertad",
"SV Terraplaza",
"SV Santo Domingo",
"SV Norte",
"SV Sur",
"SV Masaya",
"SV Gourmet",
"SV Ciudad Sandino"

];



const tipo =
document.getElementById("tipo");


const sucursal =
document.getElementById("sucursal");


const sucursalTexto =
document.getElementById("sucursalTexto");




tipo.addEventListener("change",()=>{


sucursal.innerHTML=
'<option value="">-- Seleccionar --</option>';



if(tipo.value==="Solicitud de Traslado"){


sucursal.style.display="block";

sucursalTexto.style.display="none";



listaSucursales.forEach(x=>{


let op=document.createElement("option");

op.value=x;

op.textContent=x;

sucursal.appendChild(op);


});


}else{


sucursal.style.display="none";

sucursalTexto.style.display="block";


}


});






// =========================
// GUARDAR EN TELEFONO
// =========================


function guardarTelefono(registro){


let tx=db.transaction(
"registros",
"readwrite"
);


let tabla=tx.objectStore(
"registros"
);


tabla.add(registro);


}







// =========================
// ENVIAR GOOGLE SHEETS
// =========================


function enviarGoogle(registro){


return fetch(
SHEET_URL,
{

method:"POST",

mode:"no-cors",

body:JSON.stringify(registro)

});


}






// =========================
// SINCRONIZAR
// =========================

function sincronizar(){

  if(!navigator.onLine || !db) return;

  let tx = db.transaction("registros", "readonly");
  let tabla = tx.objectStore("registros");
  let todos = tabla.getAll();

  todos.onsuccess = function(e){
    let registros = e.target.result;
    if(registros.length === 0) return;

    // Enviar uno por uno y eliminar solo si fue exitoso
    registros.forEach(registro => {

      fetch(SHEET_URL, {
        method: "POST",
        mode: "no-cors",
        body: JSON.stringify(registro)
      })
      .then(() => {
        // Eliminar de IndexedDB después de enviar
        let tx2 = db.transaction("registros", "readwrite");
        tx2.objectStore("registros").delete(registro.id);
      })
      .catch(() => {
        // Si falla, no eliminar — se reintentará después
      });

    });
  };

}






// =========================
// MENSAJE
// =========================


function mensaje(t,c){


let m=document.getElementById("mensaje");

m.textContent=t;

m.style.color=c;


setTimeout(()=>{

m.textContent="";

},5000);


}







// =========================
// BOTON GUARDAR
// =========================


document.getElementById("guardar")
.onclick=function(){



let conductor=
document.getElementById("conductor").value.trim();



let documento=
document.getElementById("documento").value.trim();



let suc;


if(tipo.value==="Solicitud de Traslado"){

suc=sucursal.value;


}else{


suc=sucursalTexto.value.trim();


}




if(!conductor ||
!documento ||
!suc ||
!tipo.value){


mensaje(
"⚠️ Complete todos los campos",
"red"
);


return;

}




let ahora=new Date();



let registro={


fecha:
ahora.toLocaleDateString("es-NI"),


hora:
ahora.toLocaleTimeString("es-NI"),


usuario,


conductor,


documento,


sucursal:suc,


tipo:tipo.value


};




// SIEMPRE GUARDA EN EL TELEFONO

guardarTelefono(registro);



mensaje(
"💾 Guardado en teléfono",
"green"
);




// SI HAY INTERNET ENVIA

if(navigator.onLine){


sincronizar();


}




document.getElementById("conductor").value="";

document.getElementById("documento").value="";

document.getElementById("sucursalTexto").value="";

tipo.value="";

sucursal.innerHTML=
'<option value="">-- Seleccionar --</option>';



};





window.addEventListener(
"online",
sincronizar
);