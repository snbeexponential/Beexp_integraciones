/**
* @author Carlos Abreu Novelo carlos.abreu@beexponential.com.mx<>
* @Modificacion <>
* @Name sk_rl_conciliacion.js
* @description Script conciliacion csv
* @file <URL PENDIENTE>
* @NApiVersion 2.1
* @NScriptType Restlet
*/
define(['N/https', 'N/encode', 'N/file', 'N/record'], function (https, encode, file, record) {
    function postRequest(params) {
        log.debug("params", params);
        var dynamicid2 = Object.values(params);
        log.debug("dynamicid2", dynamicid2);
        var name = dynamicid2[0];
        log.debug("name", name);
        var CSV = dynamicid2[1];
        log.debug("CSV", CSV);

        var v_folder = 1739;

        const response = {
            code: 200,
            message: "Archivo Guardado Correctamente",
            result: [idcsv]
        };

        // Crear PDF
        var objFileCSV = file.create({
            name: name + ".csv",
            fileType: file.Type.CSV,
            contents: CSV,
            encoding: file.Encoding.UTF_8,
            folder: v_folder,
        });
        var idcsv = objFileCSV.save();
        response.result.push({
            tipo: name + ".pdf",
            id: idcsv
        });
        log.debug('idcsv', idcsv);

       



        // load file
       




        /*return bodyObj;*/
    }


    return {
        post: postRequest,

    }

});