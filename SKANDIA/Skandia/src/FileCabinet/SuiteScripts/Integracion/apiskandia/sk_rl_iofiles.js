
/**
* @author Saul Navarro <saul.navarro@beexponentialgroup.com>
* @Modificacion 
* @Name sk_rl_iofiles.js
* @description Script pagos enviar y recibir documentos de la api skandia para ejecutar el servicio de Banorte
* @file SANDBOX <https://7414605-sb1.restlets.api.netsuite.com/app/site/hosting/restlet.nl?script=1458&deploy=1> 
*       PRODUCCIÓN <>
* @NApiVersion 2.1
* @NScriptType Restlet
*/
define(['N/record','N/search','N/file',"N/util","N/format",'N/task','N/encode'], function (record,search,file,util,format,task,encode) {


    function get(params) {
        return "get"
    }

//Detalles de este script que son necesarios verifiacar al ser implementado
/*NÚMERO DE LOS FOLDERS*/

    const folders={
        h2h:1654,
        vendor:1655,
        pagos:1657,
        conciliacion:1656
    }

    const response={
        code:null,
        message:null,
        result:null
    }

    function post(params) {
//Iniciamos variables, tomamos la información del JSON
        var dynamicid2 = Object.values(params);        
        var name = dynamicid2[0];
        var folderselec=folders.h2h
                //Validando el contenido del request
                if (dynamicid2[1]===""||dynamicid2[1]===''||dynamicid2[1]===null) {
                    response.code=400
                    response.message="No se encuentra información en el campo del documento"        
                    response.result="El contenido en el campo XLS no se encuentra"
                    return response       
                } else if(dynamicid2[1].length%4!=0){
                    response.code=400
                    response.message="El contenido base64 proporcionado es erróneo: la longitud de la cadena no es multiplo de 4"
                    return response
                }else{   
                    var contenido = dynamicid2[1];
                }

                //Guardando los documentos 
                try {
                    var id_obtenido=guardar_file(name,contenido,folderselec)
                    response.code=200
                    response.message="Se guardó exitosamente el docuemento"
                    response.result="Id de documento: "+id_obtenido

                } catch (error) {
                    response.code=400
                    response.message="No se pudo cargar el archivo correctamente, favor de revisar el formato y nomenclatura"        
                    response.result="Falle en: "+ error.message
                    return response
                }

        return response
    }

     //Function Area
         // Crear y guardar el documento en folder
function guardar_file(nombrefile,contenido,folder) {

    var base64EncodedString = encode.convert({
        string: contenido,
        inputEncoding: encode.Encoding.BASE_64,
        outputEncoding: encode.Encoding.UTF_8
    });



    var objFileXLS = file.create({
        name: nombrefile + ".txt",
        fileType: file.Type.PLAINTEXT,
        contents: base64EncodedString,
        encoding: file.Encoding.UTF_8,
        folder: folder,
    });
        var idxls = objFileXLS.save();    
        return idxls
}

     return {
         post: post,
         get: get
     };
 });