/**
* @author Carlos Abreu Novelo carlos.abreu@beexponential.com.mx<>
* @Modificacion <>
* @Name nm_rl_customerpayment
* @description Script Facturama CUstomer Payment
* @file <URL PENDIENTE>
* @NApiVersion 2.1
* @NScriptType Restlet
*/
define(['N/https', 'N/encode', 'N/file', 'N/record','N/format'], function (https, encode, file, record,format) {
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
            name: 'Content-Type',
            value: 'application/json',
            Authorization: 'Basic ' + userpass

        };
        log.debug('headers', headersObj);

        /* 
                var bodyObjtxt = '{ "employees" : [' + '{ "firstName":"John" , "lastName":"Doe" },' + '{ "firstName":"Anna" , "lastName":"Smith" },' + '{ "firstName":"Peter" , "lastName":"Jones" } ]}'; */

        //Datos minimos para facturar
        /* var bodyObj = {ExpeditionPlace: "78240",CfdiType: "I",PaymentForm: "03",PaymentMethod: "PUE",Receiver:[{"Rfc":"SME111110NY1","CfdiUse":"P01"}] }; */



        let invoice = record.load({

            type: record.Type.CUSTOMER_PAYMENT,

            id: Number(data),

            isDynamic: true,
        }).setValue({
            fieldId: 'paymentmethod',
            value: 8,

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

        let payment = invoice.getValue({

            fieldId: 'payment'

        });
        log.debug('payment', payment);

        let entity = invoice.getValue({

            fieldId: 'entityname'

        });
        log.debug('entity', entity);

        /* //sublista ITEM

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
 */

        function sysDate() {
            var date = new Date();
            var tdate = date.getDate();
            var month = date.getMonth() + 1; // jan = 0
            var year = date.getFullYear();
            return currentDate = month + '/' + tdate + '/' + year;
            }
           
            log.debug('sysDate', sysDate);

            function timestamp() {
                var str = "";
                
                var currentTime = new Date();
                var hours = currentTime.getHours();
                var minutes = currentTime.getMinutes();
                var seconds = currentTime.getSeconds();
                var meridian = "";
                if (hours > 12) {
                    meridian += "pm";
                } else {
                    meridian += "am";
                }
                if (hours > 12) {
                
                    hours = hours - 12;
                }
                if (minutes < 10) {
                    minutes = "0" + minutes;
                }
                if (seconds < 10) {
                    seconds = "0" + seconds;
                }
                str += hours + ":" + minutes + ":" + seconds + " ";
                
                return str + meridian;
                }
            
            

                function addLeadingZeros(n) {
                    if (n <= 9) {
                      return "0" + n;
                    }
                    return n
                  }



                  let currentDatetime = new Date()
                  log.debug('currentDatetime', currentDatetime);

                  let formattedDate = currentDatetime.getFullYear() + "-" + addLeadingZeros(currentDatetime.getMonth() + 1) + "-" + addLeadingZeros(currentDatetime.getDate()) + " " + addLeadingZeros(currentDatetime.getHours()) + ":" + addLeadingZeros(currentDatetime.getMinutes()) + ":" + addLeadingZeros(currentDatetime.getSeconds())

                  log.debug('formattedDate', formattedDate);



        var currentDate = sysDate(); // returns the date
        log.debug('currentDate', currentDate);
        var currentTime = timestamp(); // returns the time stamp in HH:MM:SS
        log.debug('currentTime', currentTime);
        var currentDateAndTime = currentDate + ' ' + currentTime;
        log.debug('currentDateAndTime', currentDateAndTime);

        var parsedDate = format.parse({
            value: currentDateAndTime,
            type: format.Type.MMYYDATE //DATETIMETZ
         });
         log.debug('parsedDate', parsedDate);
         
         
         //var B = currentDatetime.toString(); //toISOString
         

         var B= Date.parse(parsedDate)/1000;
         log.debug('B', B);

         var C = new Date(currentDateAndTime).toJSON();
         log.debug('C', C);
         




       
        
        

        var bodyObj = {
           "Receiver.Name": entity,
            "Receiver.CfdiUse": "P01",
            "Receiver.Rfc": rfc,
            "CfdiType": "P",
            "NameId": "14",
            "ExpeditionPlace": "78240",
            "Complemento.Payments[0].Date": "2022-04-04T16:25:42",
            "Complemento.Payments[0].PaymentForm": "02",
            "Complemento.Payments[0].Amount": total,
            "Complemento.Payments[0].RelatedDocuments[0].Uuid": "ad581a84-1769-451b-8d64-c8f31abe6dc1",
            "Complemento.Payments[0].RelatedDocuments[0].Folio": "100032007",
            "Complemento.Payments[0].RelatedDocuments[0].PaymentMethod": "PUE",
            "Complemento.Payments[0].RelatedDocuments[0].PartialityNumber": "1",
            "Complemento.Payments[0].RelatedDocuments[0].PreviousBalanceAmount": total,
            "Complemento.Payments[0].RelatedDocuments[0].AmountPaid": payment,
         	
            
            
            
            




            /* "Complemento[0].Payments[0].Date": "2018-04-05T05:00:00.000Z",
            "Complemento[0].Payments[0].PaymentForm": "03",
            "Complemento[0].Payments[0].Amount": "1200",
            "Complemento[0].Payments[0].RelatedDocuments[0].Uuid": "102dd39a-032e-40aa-aeba-1144500239db",
            "Complemento[0].Payments[0].RelatedDocuments[0].Folio": "100032007", 
            "Complemento[0].Payments[0].RelatedDocuments[0].PaymentMethod": "PUE", 
            "Complemento[0].Payments[0].RelatedDocuments[0].PartialityNumber": "1",
            "Complemento[0].Payments[0].RelatedDocuments[0].PreviousBalanceAmount": "1200",
            "Complemento[0].Payments[0].RelatedDocuments[0].AmountPaid": "1200", */
            
        
        
        
        
        
        
        /* "NameId": 1,
        "CfdiType": "P",
        "Folio": 100,
        "Serie": "",
        "ExpeditionPlace": "78240",
        "Receiver": {
            "Rfc": "JAR1106038RA",
            "Name": "SinDelantal Mexico",
            "CfdiUse": "P01"
        },
        "Complemento": {
            "Payments": [{
                "PaymentForm": "02",
                "Amount": 10,
                "RelatedDocuments": [
                    {
                      "Uuid": "683657d1-7b82-46cb-8d44-7365531fe588",
                      "Currency": "MXN",
                      "PaymentMethod": "PUE",
                      "PartialityNumber": 1,
                      "PreviousBalanceAmount": 1.0,
                      "AmountPaid": 1.0
                }]
            }]
        } */
        
        };
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
             name: 'Content-Type',
             value: 'application/json',
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
            var v_folder = 1122;

            //hacemos un load del record
            let invoice = record.load({

                type: record.Type.CUSTOMER_PAYMENT,
    
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

            //consulta get para generar el PDF 
            var apiPDFResponse = https.get({
                url: 'https://apisandbox.facturama.mx/api/Cfdi/pdf/issued/' + id,
                name: 'Content-Type',
                value: 'application/json',
                headers: headersObj
            });
            log.debug('apiPDFResponse', apiPDFResponse);
            //consulta get para generar xml
            var apiXMLResponse = https.get({
                url: 'https://apisandbox.facturama.mx/api/Cfdi/xml/issued/' + id,
                name: 'Content-Type',
                value: 'application/json',
                headers: headersObj
            });
            log.debug('apiXMLResponse', apiXMLResponse);

            if (apiPDFResponse.code === 200) {
                let pdfresp = apiPDFResponse.body
                // Crear PDF en base 64
                let requestpdf = JSON.parse(pdfresp);
                log.debug('requestpdf', requestpdf);
                let pdfbase64 = requestpdf.Content;
                log.debug('pdfbase64', pdfbase64);

                // Crear PDF con nombre especificado en carpeta especificada
                var objFilePDF = file.create({
                    name: nameresp + ".pdf",
                    fileType: file.Type.PDF,
                    contents: pdfbase64,
                    folder: v_folder,
                });
                //Guardar el PDF en filegabinet
                var idpdf = objFilePDF.save();
                response.result.push({
                    tipo: nameresp + ".pdf",
                    id: idpdf
                });
                log.debug('idpdf', idpdf);

                let invoice = record.load({

                    type: record.Type.CUSTOMER_PAYMENT,
        
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

                // Crear XML en base 64
                var docXML = encode.convert({
                    string: xmlbase64,
                    inputEncoding: encode.Encoding.BASE_64,
                    outputEncoding: encode.Encoding.UTF_8
                });
                // Crear XML con nombre especificado en carpeta especificada
                var objFileXML = file.create({
                    name: nameresp + ".xml",
                    fileType: file.Type.XMLDOC,
                    contents: docXML,
                    folder: v_folder,
                });
                //Guardar el XML en filegabinet
                var idxml = objFileXML.save();
                response.result.push({
                    tipo: nameresp + ".xml",
                    id: idxml
                });
                log.debug('idxml', idxml);

                let invoice = record.load({

                    type: record.Type.CUSTOMER_PAYMENT,
        
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