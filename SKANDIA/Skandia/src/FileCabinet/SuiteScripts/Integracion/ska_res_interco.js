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
define(['N/record','N/search','N/file',"xlsx","N/util","N/format",'N/task'], function (record,search,file,XLSX,util,format,task) {



    function post(params) {
//Iniciamos variables, tomamos la información del JSON
        var dynamicid2 = Object.values(params);  
        log.debug({
            title: "dynamicid2: ",
            details: dynamicid2
        })      
        var name = dynamicid2[0];        
        var detailname=name.split("_")       
        var ejecutamos=null
        var response = {
            code: 200,
            message: "",
            result: []
        };
        var folderselec=1652

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


        //Validando y cargando en folder correspondiente los folders
        /* if(detailname[0]=='cuentas'&&detailname[1]==="fac"||detailname[0]=='cuentas'&&detailname[1]==="ede"||detailname[0]=='inversiones'&&detailname[1]===""){

        } */




        /* if (detailname[0]=='cuentas'||detailname[0]=='inversiones') {
            detailname[0]=='cuentas'?folderselec=folders.cuentas:folderselec=folders.inversiones
        } else if (detailname[0]=='siniestros'||detailname[0]=='nomina') {
            detailname[0]=='siniestros'?folderselec=folders.siniestros:folderselec=folders.nomina
        } 
        else{
            response.code=400
            response.message="El nombre del archivo no corresponde a un servicio válido, los servicios son: cuentas|siniestros|inversiones|nomina"        
            response.result="El valor "+detailname[0]+" no es correcto"
            return response            
        }

        if (detailname[1]==="fac") {
            ejecutamos="fac"
        }else if (detailname[1]==="ed") {    
            ejecutamos="ed"
        } else if (detailname[1]==="ede") {    
            ejecutamos="ede"
        } else {
            response.code=400
            response.message="No se encontró el tipo de transacción que se procesará en el nombre del archivo, los valores pueden ser:  fac=Facturas | ede = Entradas de diario estadístico |ed = Entradas de diario "
            response.result="El valor "+detailname[1]+" no es correcto"
            return response
        } */
        
    /*     try {
            
        } catch (error) {
            response.code=400
            response.message="No se encontró el tipo de transacción que se procesará en el nombre del archivo, los valores pueden ser:  fac=Facturas | ede = Entradas de diario estadístico |ed = Entradas de diario "
            response.result="El valor "+detailname[1]+" no es válido"
            return response
        }   */      
                try {
                    var id_obtenido=guardar_file(name,contenido,folderselec)
                    response.code=200
                    response.result="Id de documento: "+id_obtenido

                } catch (error) {
                    response.code=400
                    response.message="No se pudo cargar el archivo correctamente, favor de revisar el formato y nomenclatura"        
                    response.result="Falle en: "+ error.message
                    return response
                }
                try {
                    iniciar_tarea(id_obtenido,folderselec,ejecutamos)
                    response.message="El archivo fue cargado, el procesamiento se está ejecutando"        
                } catch (error) {
                    response.code=500
                    response.message="El archivo fue cargado pero la tarea no se pudo iniciar, devido a :"+error.message        
                    return response 
                }
        return response
    }

     //Function Area
         // Crear y guardar el documento en folder
function guardar_file(nombrefile,contenido,folder) {
    var objFileXLS = file.create({
        name: nombrefile + ".xlsx",
        fileType: file.Type.EXCEL,
        contents: contenido,
        encoding: file.Encoding.UTF_8,
        folder: 1652,
    });
        var idxls = objFileXLS.save();  log.debug({
            title: "idxls: ",
            details: idxls
        })     
        return idxls
}

     //Ejecutar el proceasmineto del documento
    function iniciar_tarea(idxls,folderselec,trantype) {
        datostomr={
            idxls,
            folderselec
        }

        
            task.create({
                taskType: task.TaskType.MAP_REDUCE,
                scriptId: 'customscript_ska_map_excelinterco',
                deploymentId: 'customdeploy__ska_map_excelinterco',
                params:{ 'custscript_parametrointerco': JSON.stringify(datostomr)}
            }).submit();
        
    }

     return {
         post: post,
         
     };
 });