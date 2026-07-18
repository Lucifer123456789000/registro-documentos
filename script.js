const URL = "https://script.google.com/macros/s/AKfycby_b6DQ5q5FHyd05rZ0nnGBNNwVsA0FIEZGk012h6kXqQBJ0zNAVzVl2m_VDjJIF7jB7A/exec";

document.getElementById("guardar").addEventListener("click", async function () {

    const conductor = document.getElementById("conductor").value.trim();
    const documento = document.getElementById("documento").value.trim();
    const tipo = document.getElementById("tipo").value;

    if(conductor === "" || documento === ""){
        alert("Complete todos los campos");
        return;
    }

    try{

        await fetch(URL,{
            method:"POST",
            body: JSON.stringify({
                conductor: conductor,
                documento: documento,
                tipo: tipo
            })
        });

        alert("✅ Registro guardado correctamente");

        document.getElementById("conductor").value="";
        document.getElementById("documento").value="";
        document.getElementById("tipo").selectedIndex=0;

    }catch(error){

        alert("❌ Error al guardar");
        console.log(error);

    }

});