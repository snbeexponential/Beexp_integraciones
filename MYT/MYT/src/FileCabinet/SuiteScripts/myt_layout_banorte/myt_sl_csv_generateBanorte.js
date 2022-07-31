/**
 * @author Saul Navarro
 * @fecha 04/10/2021
 * @Name myt_sl_csv_generateBanorte.js
 * @description Script de prueba para el desarrollo de la libreria de exportacion de records
 * @NApiVersion 2.1
 * @NScriptType Restlet
 */

 define(['N/log','N/search',' N/format','N/file',"N/encode"], function(log, search, format,file,encode) {
    const entry_point = {
        post: null
    };

    var response = {
        code: 200,
        message: "",
        result: []
    };
    entry_point.post = function(request) {
        log.debug('Obteniendo el String',request)
        try {

            var csvString=request.data;
    
            log.debug('Obteniendo el String',csvString)
           csvString = encode.convert({
                string: csvString,
                inputEncoding: encode.Encoding.BASE_64,
                outputEncoding: encode.Encoding.UTF_8
            }); 
            log.debug('Decodificando el string',csvString)
            
            
            var fileObj = file.create({
                name: 'banorte.csv',
                fileType: file.Type.CSV,
                contents: csvString,
                description: 'Banorte Layout',
                encoding: file.Encoding.UTF8,
                folder: 85449,
                isOnline: true
            });
            var fileId = fileObj.save();

            var fileObj2=file.load({
                id:fileId
            })

            var urldownload="https://6367348-sb1.app.netsuite.com/core/media/previewmedia.nl?id="+fileObj2.id;
            response={
                url:urldownload
            }
        } catch (error) {
            log.debug(error);
        }
        return response;
    }
    return entry_point;
});