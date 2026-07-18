const SHEET_URL = "https://script.google.com/macros/s/AKfycbzxUT9FQRmAe56gk3vW5l0RHbQRUmJtcMT4JCjiersMPOcM9ECcslw5iWxSVs0Bk_sNxQ/exec";



// =====================
// USUARIO DEL TELEFONO
// =====================

let usuario = localStorage.getItem("usuario");


if(!usuario){

    usuario = prompt(
        "Ingrese usuario: Moises, Joan o Jidel"
    );


    localStorage.setItem(
        "usuario",
        usuario
    );

}


document.getElementById("usuario").value = usuario;




// =====================
// ENVIAR A GOOGLE SHEETS
// =====================

function enviarASheet(registro){


    return fetch(SHEET_URL,{

        method:"POST",

        mode:"no-cors",

        body:JSON.stringify(registro)

    });


}





// =====================
// GUARDAR SIN INTERNET
// =====================

function guardarPendiente(registro){


    let pendientes =
    JSON.parse(
        localStorage.getItem("pendientes") || "[]"
    );


    pendientes.push(registro);


    localStorage.setItem(
        "pendientes",
        JSON.stringify(pendientes)
    );


}





// =====================
// MENSAJE
// =====================

function mostrarMensaje(texto,color){


    let mensaje =
    document.getElementById("mensaje");


    mensaje.textContent = texto;


    mensaje.style.color = color;


    setTimeout(()=>{

        mensaje.textContent="";

    },5000);


}





// =====================
// BOTON GUARDAR
// =====================


document.getElementById("guardar")
.addEventListener("click",function(){


let conductor =
document.getElementById("conductor").value.trim();


let documento =
document.getElementById("documento").value.trim();


let sucursal =
document.getElementById("sucursal").value.trim();


let tipo =
document.getElementById("tipo").value;



if(!conductor){

mostrarMensaje(
"⚠️ Ingrese conductor",
"red"
);

return;

}



if(!/^[0-9]+$/.test(documento)){


mostrarMensaje(
"⚠️ Documento solo números",
"red"
);


return;

}




if(!sucursal){


mostrarMensaje(
"⚠️ Ingrese sucursal",
"red"
);


return;

}




if(!tipo){


mostrarMensaje(
"⚠️ Seleccione tipo",
"red"
);


return;

}




let fechaHora = new Date();



let registro={


fecha:
fechaHora.toLocaleDateString("es-NI"),


hora:
fechaHora.toLocaleTimeString("es-NI"),


usuario:
usuario,


conductor:
conductor,


documento:
documento,


sucursal:
sucursal,


tipo:
tipo


};





// ENVIAR

if(navigator.onLine){



enviarASheet(registro)

.then(()=>{


mostrarMensaje(
"✅ Enviado a Google Sheets",
"green"
);


})

.catch(()=>{


guardarPendiente(registro);


mostrarMensaje(
"⚠️ Guardado localmente",
"red"
);


});



}else{


guardarPendiente(registro);


mostrarMensaje(
"📴 Sin internet",
"red"
);


}






// limpiar campos


document.getElementById("conductor").value="";

document.getElementById("documento").value="";

document.getElementById("sucursal").value="";

document.getElementById("tipo").value="";



});