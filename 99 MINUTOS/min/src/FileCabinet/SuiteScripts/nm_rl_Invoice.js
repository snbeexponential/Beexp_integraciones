/**
* @author Carlos Abreu Novelo carlos.abreu@beexponential.com.mx<>
* @Modificacion <>
* @Name nm_rl_Invoice.js
* @description Script Facturama invoices
* @file <URL PENDIENTE>
* @NApiVersion 2.1
* @NScriptType Restlet
*/
define(['N/https', 'N/encode', 'N/file', 'N/record'], function (https, encode, file, record) {
    function postRequest(params) {
        log.debug("params", params);
        var dynamicid2 = Object.values(params);
        log.debug("dynamicid2", dynamicid2);
        var data = dynamicid2[0];
        log.debug("data", data);



        const response = {
            code: 200,
            message: "",
            result: []
        };

        var userpass = encode.convert({
            string: "beexponential:beexponential",
            inputEncoding: encode.Encoding.UTF_8,
            outputEncoding: encode.Encoding.BASE_64,
        });
        log.debug("userpass", userpass);


        var headersObj = {
            contentType: "application/json",
            Authorization: 'Basic ' + userpass

        };
        log.debug('headers', headersObj);

        /* 
                var bodyObjtxt = '{ "employees" : [' + '{ "firstName":"John" , "lastName":"Doe" },' + '{ "firstName":"Anna" , "lastName":"Smith" },' + '{ "firstName":"Peter" , "lastName":"Jones" } ]}'; */

        //Datos minimos para facturar
        /* var bodyObj = {ExpeditionPlace: "78240",CfdiType: "I",PaymentForm: "03",PaymentMethod: "PUE",Receiver:[{"Rfc":"SME111110NY1","CfdiUse":"P01"}] }; */



        let invoice = record.load({

            type: record.Type.INVOICE,

            id: Number(data),

            isDynamic: true,

        });
        log.debug('invoice', invoice);

        var sublistName = invoice.getSublists();

        log.debug('sublistas', sublistName);

        let total = invoice.getValue({

            fieldId: 'total'

        });
        log.debug('total', total);

        let rfc = invoice.getValue({

            fieldId: 'custbody_mx_customer_rfc'

        });
        log.debug('rfc', rfc);

        let amountpaid = invoice.getValue({

            fieldId: 'amountpaid'

        });
        log.debug('amountpaid', amountpaid);

        let entity = invoice.getValue({

            fieldId: 'entityname'

        });
        log.debug('entity', entity);

        //sublista ITEM

        let lines = invoice.getLineCount({

            sublistId: 'item'

        });
        log.debug('lines', lines);

        let itemsInvoice = [];
        log.debug('itemsInvoice', itemsInvoice);

        for (let i = 0; i < lines; i++) {

            let info = {};
            log.debug('info', info);

            let quantity = invoice.getSublistValue({

                sublistId: 'item',

                fieldId: 'quantity',

                line: i

            });
            log.debug('quantity', quantity);

            let grossamt = invoice.getSublistValue({

                sublistId: 'item',

                fieldId: 'grossamt',

                line: i

            });
            log.debug('grossamt', grossamt);

            let taxamount = invoice.getSublistValue({

                sublistId: 'item',

                fieldId: 'taxamount',

                line: i

            });
            log.debug('taxamount', taxamount);

            let rate = invoice.getSublistValue({

                sublistId: 'item',

                fieldId: 'rate',

                line: i

            });
            log.debug('rate', rate);
            info['quantity'] = quantity;

            info['grossamt'] = grossamt;

            info['taxamount'] = taxamount;

            info['rate'] = rate;

            itemsInvoice.push(info)
            log.debug('itemsInvoice', itemsInvoice);
            

        }
        for (var i=0;i< itemsInvoice.length;i++) {



            let dataInvoice = itemsInvoice[i];
            var quantity2=Number(dataInvoice.quantity)
            log.debug('quantity2', quantity2);
            var grossamt2=Number(dataInvoice.grossamt)
            log.debug('grossamt2', grossamt2);
            var taxamount2=Number(dataInvoice.taxamount)
            log.debug('taxamount2', taxamount2);
            var rate2 =Number(dataInvoice.rate)
            log.debug('rate2', rate2);
        };


        



        

        var bodyObj = {
            "ExpeditionPlace": "78240",
            "PaymentConditions": "CREDITO A SIETE DIAS",
            "Folio": "100",
            "CfdiType": "I",
            "PaymentForm": "03",
            "PaymentMethod": "PUE",
            "Receiver": {
                "Rfc": rfc,
                "Name": entity,
                "CfdiUse": "P01"
              },
            "Items": [
                {
                    "ProductCode": "10101504",
                    "IdentificationNumber": "149",
                    "Description": "abril 2022",
                    "UnitCode": "E48",
                    "UnitPrice": "1200.00",
                    "Quantity": "1.00",
                    "Subtotal": 1200.00,
                    "Taxes": [
                        {
                            "Total": 192.00,
                            "Name": "IVA",
                            "Base": 1200.00,
                            "Rate": 0.16, 
                            "IsRetention": false
                        }, 
                    ],
                    "Total": 1392.00
                }                
            ]
            
            /* Items: 
                {
                  ProductCode: "10101504",
                  IdentificationNumber: "001",
                  Description: "SERVICIO DE COLOCACION",
                  Unit: "NO APLICA",
                  UnitCode: "E49",
                  UnitPrice: 100.0,
                  Quantity: 15.0,
                  Subtotal: 1500.0,
                  Discount: 0.0,
                  Taxes: 
                    {
                      Total: 240.0,
                      Name: "IVA",
                      Base: 1500.0,
                      Rate: 0.16,
                      IsRetention: false
                    }
                  ,
                  Total: 1740.0,
                }    */
        }
        /* var newbody = JSON.parse(JSON.stringify(bodyObj));
        log.debug('newbody', newbody); 
 */
        log.debug('bodyObj', bodyObj);



        /* var newbody = JSON.stringify(bodyObj);
        log.debug('newbody',JSON.stringify(newbody)); */


        /*  var data = JSON.parse(newbody);
         log.debug('data',JSON.parse(data)); */
      
 
        //ACTIVAR PARA FACTURAR
          var apiResponse = https.post({
             url: 'https://apisandbox.facturama.mx/2/cfdis',
             ContentType:"text/json; charset=utf-8",
             body: bodyObj,
             headers: headersObj
         }); 
         log.debug('apiResponse', apiResponse);
        var myresponse_body = apiResponse.body; // see http.ClientResponse.body
        log.debug('myresponse_body', myresponse_body)
        var myresponse_code = apiResponse.code; // see http.ClientResponse.code
        log.debug('myresponse_code', myresponse_code)
        var myresponse_headers = apiResponse.headers; // see http.Clientresponse.headers
        log.debug('myresponse_headers', myresponse_headers) 
      
      apiResponse.result.push(bodyObj)
      
      log.debug('TestBody',bodyObj);
return bodyObj

        //ACTIVAR PARA GUARDAR FACTURA 
         if (apiResponse.code === 201) {
            log.debug('conexion: ', 'conexion exitosa');
            let bodyresp = apiResponse.body;
            log.debug('bodyresp', bodyresp);
            let request = JSON.parse(bodyresp);
            log.debug('request', request);
            let id = request.Id;
            log.debug('id', id);
            let uuid = request.Complement.TaxStamp.Uuid;
            log.debug('uuid', uuid);
            let nameresp = request.Complement.TaxStamp.Date;
            log.debug('nameresp', nameresp);
            var v_folder = 1121;

            //hacemos un load del record
            let invoice = record.load({

                type: record.Type.INVOICE,
    
                id: Number(data),
    
                isDynamic: true,
                //Le damos el valor del id generado en facturama al campo custom en NetSuite
            }).setValue({
    
                fieldId: 'custbody_facturama_id',
    
                value: id
    
            }).setValue({
                //Le damos el valor de uuid de la factura generado por facturama al campo vustom en NetSuite
                fieldId: 'custbody_mx_cfdi_uuid',
    
                value: uuid
    
            }).save({})






            var apiPDFResponse = https.get({
                url: 'https://apisandbox.facturama.mx/api/Cfdi/pdf/issued/' + id,
                name: 'Content-Type',
                value: 'application/json',
                headers: headersObj
            });
            log.debug('apiPDFResponse', apiPDFResponse);

            var apiXMLResponse = https.get({
                url: 'https://apisandbox.facturama.mx/api/Cfdi/xml/issued/' + id,
                name: 'Content-Type',
                value: 'application/json',
                headers: headersObj
            });
            log.debug('apiXMLResponse', apiXMLResponse);

            if (apiPDFResponse.code === 200) {
                let pdfresp = apiPDFResponse.body
                let requestpdf = JSON.parse(pdfresp);
                log.debug('requestpdf', requestpdf);
                let pdfbase64 = requestpdf.Content;
                log.debug('pdfbase64', pdfbase64);

                // Crear PDF
                var objFilePDF = file.create({
                    name: nameresp + ".pdf",
                    fileType: file.Type.PDF,
                    contents: pdfbase64,
                    folder: v_folder,
                });
                var idpdf = objFilePDF.save();
                response.result.push({
                    tipo: nameresp + ".pdf",
                    id: idpdf
                });
                log.debug('idpdf', idpdf);
                let invoice = record.load({

                    type: record.Type.INVOICE,
        
                    id: Number(data),
        
                    isDynamic: true,
                    //Le damos el valor del id generado en facturama al campo custom en NetSuite
                }).setValue({ fieldId: 'custbody_pdf', value: idpdf, ignoreFieldChange: true }).save({}) // PDF


            } if (apiXMLResponse.code === 200) {
                let xmlresp = apiXMLResponse.body
                let requestxml = JSON.parse(xmlresp);
                log.debug('requestxml', requestxml);
                let xmlbase64 = requestxml.Content;
                log.debug('xmlbase64', xmlbase64);

                // Crear XML
                var docXML = encode.convert({
                    string: xmlbase64,
                    inputEncoding: encode.Encoding.BASE_64,
                    outputEncoding: encode.Encoding.UTF_8
                });
                var objFileXML = file.create({
                    name: nameresp + ".xml",
                    fileType: file.Type.XMLDOC,
                    contents: docXML,
                    folder: v_folder,
                });
                var idxml = objFileXML.save();
                response.result.push({
                    tipo: nameresp + ".xml",
                    id: idxml
                });
                log.debug('idxml', idxml);
                let invoice = record.load({

                    type: record.Type.INVOICE,
        
                    id: Number(data),
        
                    isDynamic: true,
                    //Le damos el valor del id generado en facturama al campo custom en NetSuite
                }).setValue({ fieldId: 'custbody_xml', value: idxml, ignoreFieldChange: true }).save({}) // XML

            }

        } 

        return apiResponse;
        /*return bodyObj;*/
    }

    return {
        post: postRequest
    }
});