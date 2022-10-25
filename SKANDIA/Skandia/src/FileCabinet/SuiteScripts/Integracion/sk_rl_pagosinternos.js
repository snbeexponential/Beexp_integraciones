/**
* @author Carlos Abreu Novelo carlos.abreu@beexponential.com.mx<>
* @Modificacion <>
* @Name sk_rl_pagosinternos.js
* @description Script pagos internos csv
* @file <URL PENDIENTE>
* @NApiVersion 2.1
* @NScriptType Restlet
* @NAmdConfig ../excel_module/sk_sc_excel_conf.json
*/
define(['N/record','N/search','N/file',"xlsx","N/util","N/format"], function (record,search,file,XLSX,util,format) {
    const response = {
        code: null,
        message: null,
        result:null
    };
    const folder =2064 
    function postRequest(params) {
        var dynamicid2 = Object.values(params);
        var name = dynamicid2[0];
        var XLS = dynamicid2[1];
        let contenido
        let id_obtenido
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
            contenido = dynamicid2[1];
        }

        try {
            id_obtenido=guardar_file(name,contenido,folder)
            response.code=200
            response.result="Id de documento: "+id_obtenido

        } catch (error) {
            response.code=400
            response.message="No se pudo cargar el archivo correctamente, favor de revisar el formato y nomenclatura"        
            response.result="Falle en: "+ error.message
            return response
        }
        try {
            iniciar_tarea(id_obtenido,folder)
            response.message="El archivo fue cargado, el procesamiento intercompañia se está ejecutando"        
        } catch (error) {
            response.code=500
            response.message="El archivo fue cargado pero la tarea no se pudo iniciar, devido a :"+error.message        
            return response 
        }
    }
     //FUNCTIONS AREA
     function guardar_file(nombrefile,contenido,folder) {
        var objFileXLS = file.create({
            name: nombrefile + ".xlsx",
            fileType: file.Type.EXCEL,
            contents: contenido,
            encoding: file.Encoding.UTF_8,
            folder: folder,
        });
            var idxls = objFileXLS.save();    
            return idxls
    }

    function iniciar_tarea(idxls,folderselec) {
        let datostomr={
            idxls,
            folderselec}

            task.create({
                taskType: task.TaskType.MAP_REDUCE,
                scriptId: 'customscript_ska_map_excelinterco',
                deploymentId: 'customdeploy__ska_map_excelinterco',
                params:{ 'custscript_parametrointerco': JSON.stringify(datostomr)}
            }).submit();
    }

     return {
         post: postRequest,
     };
 });