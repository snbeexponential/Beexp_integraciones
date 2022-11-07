/**
 * @author Saul Navarro <saul.navarro@beexponential.com.mx>
 * @Name tt_rl_facturacion.js
 * @fecha 04/11/2022
 * @description Recepción de XML y PDF base 64(conversión a archivos), UUID y ligas en la invoice.
 * @NApiVersion 2.1
 * @NScriptType Restlet
 */
 define(['N/encode','N/file', 'N/record'],function (encode, file, record) {
    
    const entry_point = {
        get: null,
        post: null,
        put: null,
        delete: null
    };

    const response = {
        code:200,
        message:"",
        result:[]
    };    

    let v_folder = 1097;


    entry_point.post = (context) => {
        try {   
              
            // Crear PDF
            let objFilePDF = file.create({
                name: context.name + ".pdf",
                fileType: file.Type.PDF,                
                contents: context.pdf,
                folder: v_folder,
            });
            
            /* let idpdf =0 */
            let idpdf = objFilePDF.save();
            log.debug("idpdf 1",idpdf)
            // Crear XML
            let docXML = encode.convert({
                string: context.xml,
                inputEncoding: encode.Encoding.BASE_64,
                outputEncoding: encode.Encoding.UTF_8
            });
            log.debug("Pruebas de funcionamiento 1")
            let objFileXML = file.create({
                name: context.name+".xml",
                fileType: file.Type.XMLDOC,
                contents: docXML,                
                folder: v_folder,                
            });
            log.debug("Pruebas de funcionamiento 2")
            let idxml = objFileXML.save();  
            log.debug("Pruebas de funcionamiento 3")
            response.result.push({
                tipo: context.name+".xml",
                id: idxml
            }); 
            log.debug("Pruebas de funcionamiento 4",response)
            response.result.push({
              tipo: context.name+".pdf",
              id: idpdf
          });
          log.debug("Pruebas de funcionamiento 5",response)
            let data_invoiceid=context.listid;
            let validateload;
            let registro;
            let arraynovalid=[]

            data_invoiceid.forEach(element => {
              try {
                registro = record.load({ 
                    type: record.Type.INVOICE, 
                    id:element, 
                    isDynamic: true
                });
                validateload=true
              } catch (error) {
                validateload=false
              }
              if (validateload) {
                registro.setValue({ fieldId: "custbody49", value: context.UUID});
                registro.setValue({ fieldId: "custbody_fa_pdf", value: idpdf});
                registro.setValue({ fieldId: "custbody_fa_xml", value: idxml});
                registro.save();
              }else{
                arraynovalid.push(element);
              }
            });
            if (arraynovalid.length>0) {
                response.code=200  
                response.message="Los archivos se han agregado exitosamente"
                response.result.push({
                  mensaje:"La siguente lista de invoices no han sido encontrados",
                  listid:arraynovalid})
              }else{
                response.code=200  
                response.message="Se han timbrado extitosamente las facturas"
              }
            // Actualizar información de la INVOICE
        } catch (error) {
            response.code = 400;
            response.message = response.message = error.message;
        }
        return response;        
    }
    entry_point.get = (context) => {return 'get';}
    entry_point.put = (context) => {return 'put';}
    entry_point.delete = (context) => {return 'delete';}

    return entry_point;    
 });