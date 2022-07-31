// PAPSA - PORTAL DE PROVEEDORES
// 5
/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */

 // define(['N/search'], function (search) {    
    define(['N/xml', 'N/file','N/search', 'N/record', 'N/render', 'N/encode'], function(xml, file, search, record, render, encode) {

        // Variables globales
        var CarpetaFacturasProveedores = 1240  // actualizado 13/01/2022
        var contexto = ''
        var params = ''
        var opcion = ''
        var idVendor = ''
        var user = ''
        var pass = ''
        var idPedido = 0
        var inputXML = ''
        var inputPDF = ''
        var xmlUUID = ''
        var xmlTOTAL = ''
        var mensaje = ''
        var arrayItemsJsPO = []    
        var arrayPurchaseJsOrders = []
        var idPDF = ''
        var idXML = ''

        // Configuración de imagen
        var logo = 'https://cdn.shopify.com/s/files/1/0408/8509/2516/files/logo-be-exponential_200x100.png?v=1591890880'
        var background_onGet = 'https://cdn.shopify.com/s/files/1/0408/8509/2516/files/bg1_1920x1080_crop_center.jpg?v=1591980319'
        var backgroundImg_onPost = 'https://image.freepik.com/foto-gratis/equipo-empresarial-planificando-estrategia-marketing_53876-102032.jpg'
        var backgroundColor_onPost = 'white'
        
        var bodyColor = 'lightgrey'
        var fontColor = 'black'
        var titlesColor = 'MidnightBlue'
        var botonColor = 'darkgrey'
        var botonFontColor = 'white'
        var botonHoverColor = 'LightBlue'
        var botonFontHoverColor = 'darkblue'

        // HEAD de todos los HTML
        var head = '<head>'+
                        '<meta charset="utf-8">'+
                        '<meta name="viewport" content="width=device-width, initial-scale=1">'+
                        '<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet"'+
                        'integrity="sha384-1BmE4kWBq78iYhFldvKuhfTAU6auU8tT94WrHftjDbrCEXSU1oBoqyl2QvZ6jIW3" crossorigin="anonymous">'+
                        '<title>Portal de proveedores</title>'+
                        '<link href="http://fonts.cdnfonts.com/css/roboto" rel="stylesheet">'+
                        '<style> '+
                            '*, html { font-family: "roboto", sans-serif; color: '+ fontColor +'; background-color: none; text-align: center; border: none;}'+   
                            'html, body { background-color: '+ bodyColor +'; }'+                             
                            '.btn-primary {color: '+ botonFontColor +'; background-color: '+ botonColor +'; border: none;}'+
                            '.btn-primary:hover { color: '+ botonFontHoverColor +'; background-color: '+ botonHoverColor +'; }'+
                            'th {color: grey; text-align: center;"}'+
                            '.fondoCabeceraOnPost { background-image:url(""); background-size:cover; background-color:white; }'+
                        '</style>'+
                    '</head>'

        // Título de todos los HTML después de LOGIN
        var cabecera =  '<br>'+
                        '<div class="container">'+                          
                            '<div style="display: flex; flex-direction: row; align-items: baseline;">'+  
                                '<img style=" width:150px; " src="'+logo+'" alt="MDN">'+  
                            '</div>'+ 
                            '<div style="display: flex; flex-direction: row; align-items: baseline;">'+                                                       
                                '<h4 style="margin-left: 0px;"> Portal de Proveedores </h4>'+    
                                '<p style="margin-left: 10px;"> Versión 2.0 </p>'+
                            '</div>'+
                        '</div>'
    
        // papsa
       // var urlPortal = 'https://6036816-sb1.extforms.netsuite.com/app/site/hosting/scriptlet.nl?script=563&deploy=1&compid=6036816_SB1&h=bf5f950191612f10603d'
         // SS FF
          var urlPortal = 'https://tstdrv2285072.extforms.netsuite.com/app/site/hosting/scriptlet.nl?script=685&deploy=1&compid=TSTDRV2285072&h=968e4518cca8fe3a2a02' 


        function mensajeHTML(opcion, titulo, mensaje) {

            var html = ""+
            '<!doctype html>'+
            head+
            '<body>'+

                '<style>'+ 
                    '.banner { background-image: url("'+ backgroundImg_onPost +'"); background-repeat: no-repeat; background-size: cover; background-color: '+ backgroundColor_onPost +'; }'+
                '</style>'+

                '<form id="myForm2" method="POST" class="form-horizontal" action="'+urlPortal+'">'+

                    '<div class="banner">'+
                        cabecera+
                    '</div>'+
                    '<br>'+   

                    '<div class="container">'+                            
                        '<h5>Orden de compra ID: '+ idPedido +'</h5>'+ 
                        '<br>'+
                        '<h1 style="color: '+ titlesColor +';">'+titulo+'</h1>'+
                        '<br>'+
                        '<h3> '+ mensaje +' </h3>'+
                        '<br>'+
                        '<br>'+
                        '<input hidden type="text" name="user" id="user" value="'+user+'">'+
                        '<input hidden type="text" name="pass" id="pass" value="'+pass+'">'+
                        '<input hidden type="text" name="idVendor" id="idVendor" value="'+idVendor+'">'+
                        '<input hidden type="text" name="idPedido" id="idPedido" value="'+idPedido+'">'+
                        '<input hidden type="text" name="mensaje" id="mensaje" value="'+mensaje+'">'+
                        '<input hidden type="text" name="idPDF" id="idPDF" value="'+idPDF+'">'+
                        '<input hidden type="text" name="idXML" id="idXML" value="'+idXML+'">'+                    
                        '<input hidden type="text" name="opcion" id="opcion" value="'+opcion+'">'+                         
                        '<button type="submit" class="btn btn-primary">Regresar </button>'+ 
                    '</div>'+  
                    
                    '<br><br><br><br>'+              
                '</form>'+

                '<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-ka7Sk0Gln4gmtz2MlQnikT1wXgYsOgOMhuPIlRH9sENBO0LRn5q8nbTov41p" crossorigin="anonymous"> </script>'+
            '</body>'+
            '</html>'
    
            contexto.response.write(html)        
            contexto.response.setHeader({ name: 'Custom-Header-Demo', value: 'Demo' })
            return true        
        }

    
        // Llenar arrayItemsJsPO con los items de un pedido en particular
        function llenarArrayItemsJsPO() {
            var purchaseorderSearchObj = search.create({
                type: "purchaseorder",
                filters:[
                    ["type","anyof","PurchOrd"],"AND", 
                    ["mainline","is","F"],"AND", 
                    ["item.type","anyof","Assembly","InvtPart","Group"], "AND",  // sólo artículos de tipo assembly, group o inventory item
                    ["internalid","anyof", idPedido]
                ],columns:[
                    search.createColumn({name: "item"}),
                    search.createColumn({name: "quantity"}),
                    search.createColumn({name: "unit"}),               
                    search.createColumn({name: "amount"})
                ]
            });
            purchaseorderSearchObj.run().each(function(result){
              
                arrayItemsJsPO.push({
                    id: result.id,
                    itemid: result.getValue({name: 'item'}),
                    item: result.getText({name: 'item'}),
                    quantity: result.getValue({name: 'quantity'}),
                    unit: result.getValue({name: 'unit'}),
                    amount: result.getValue({name: 'amount'})
                })
               
                
       
            
                return true
            })       
            return true
        }
    
    
        // 7 Generar BILL y guardar archivo XML en 
        function crearBill() {
            try {
                // let POrecord2 = record.load({ type: 'purchaseorder', id: idPedido, isDynamic: true })
                // let transactionnumber2 = POrecord2.getValue({fieldId: 'transactionnumber'})
                var billObject = record.transform({
                    fromType: 'purchaseorder',
                    fromId: idPedido,
                    toType: 'vendorbill',
                    isDynamic: true,
                })

             //   billObject.setValue('custbody_pap_tipo_material_factura', '1' )  // TIPO MATERIAL obligatorio : se utiliza 1 - producto (Nancy Peña 07/01/2022 )

                // Llenar array: arrayItemsBill (datos del XML) para modificar el BILL creado en memoria
                let i = 1
                let arrayItemsBill = []
                do {
                    log.debug("Params",i)
                    log.debug("Params",params)
                    log.debug("Params",params.item_1)
                    log.debug("Params",params['item_'+i])
                    log.debug(params)
                    log.debug("Params",typeof(params['item_'+i]))

                    let itemText =  params['item_'+i] // {id:1185, claveProdServ:50307000, valorUnitario:216.796, cantidad:4.000, importe:867.18}
                    
                    log.debug("itemText 1",itemText)
                    log.debug("itemText 1",typeof(itemText))
                    let cadena1 = itemText.replace(/{/g, '{"')
                    log.debug("itemText 2",cadena1)
                    log.debug("itemText 2",typeof(cadena1))
                    let cadena2 = cadena1.replace(/:/g, '":')
                    log.debug("itemText 3",cadena2)
                    log.debug("itemText 3",typeof(cadena2))
                    let cadena3 = cadena2.replace(/, /g, ', "')
                    let objeto = JSON.parse(cadena3)           
                    arrayItemsBill.push(objeto)
                    i++
                } while (params['item_'+i])
                // Validar que no haya ITEMS repetidos en distintas líneas en arrayItemsBill
                let unique = []
                let arrayItemsBill2 = arrayItemsBill
                    /* log.debug('arrayItemsBill2',arrayItemsBill2) */
                arrayItemsBill2.map(item =>{
                    let posicion = unique.findIndex( item2 => item.id === item2.id )
                    if (posicion === -1) unique.push(item)               
                }) 
                if(unique.length !== arrayItemsBill2.length) {
                    let opcion = 'detalles'
                    let titulo= 'Algo ha salido mal...'
                    let mensaje = 'Ha seleccionado dos veces el mismo artículo, por favor valide la captura'
                    mensajeHTML(opcion, titulo, mensaje)
                    return true
                } 
                // recorrer arrayItemsBill y modificar items en subList con los valores del XML
                arrayItemsBill.map(item => {    
                    var itemLineNumber = billObject.findSublistLineWithValue({sublistId: "item", fieldId: "item", value: item.id })
                    billObject.selectLine({sublistId: 'item',line: itemLineNumber})
                    billObject.setCurrentSublistValue({sublistId: 'item',fieldId: 'rate', value: item.valorUnitario  })
                    billObject.setCurrentSublistValue({sublistId: 'item',fieldId: 'quantity', value: item.cantidad  })               
                    billObject.commitLine({ sublistId: 'item' })
                })
                // Salvar Bill Nuevo
                let billId = billObject.save()
                
                // Relacionar BILL con archivos XML, PDF, UUID
                // var CFDIProveedor = record.create({ type: 'customrecord_be_vendor_bill_cfdidocument', isDynamic: true }) // record: CFDI Proveedor
                // CFDIProveedor.setValue({ fieldId: 'custrecord_vendor_bill_transaction', value: billId, ignoreFieldChange: true }) // parent BILL
                // CFDIProveedor.setValue({ fieldId: 'custrecord_vendor_bill_pdffile', value: idPDF, ignoreFieldChange: true }) // PDF
                // CFDIProveedor.setValue({ fieldId: 'custrecord_vendor_bill_xmlfile', value: idXML, ignoreFieldChange: true }) // XML
                // CFDIProveedor.setValue({ fieldId: 'custrecord_vendor_bill_uuid', value: xmlUUID, ignoreFieldChange: true }) // UUID
                // CFDIProveedor.setValue({ fieldId: 'custrecord_vendor_bill_total', value: xmlTOTAL, ignoreFieldChange: true }) // TOTAL
                // CFDIProveedor.save()


                let opcion2 = 'menuOrdenes'
                let titulo2 = 'Factura creada en Netsuite con éxito'
                let mensaje2 = 'El id de la factura es: ' + billId
                mensajeHTML(opcion2, titulo2, mensaje2)
                return true  

            } catch (e) {
                let opcion = 'menuOrdenes'
                let titulo= 'Algo ha salido mal...'
                let mensaje = 'ERROR: ' + e
                mensajeHTML(opcion, titulo, mensaje)
                return true
            }
        }
    
      //funcion para obtener el rfc del proveedor de netsuite
        function getVendorRFC(orderId) {
            const vendor = search.lookupFields({ type: 'purchaseorder', id: orderId, columns: ['entity'] });
            const rfc = search.lookupFields({ type: 'vendor', id: vendor.entity[0].value, columns: ['custentity_mx_rfc'] });
            return rfc.custentity_mx_rfc;
        }
    
        // 6 Procesar un XML cargado.
        function procesarXML() {

            try {
                // Procesar archivo PDF cuando se reciba, guardar en gabinete        
                if (inputPDF != '') {
                    let inputPDF_formateado = inputPDF.replace('data:application/pdf;base64,','')
                    log.debug("inputPDF_formateado",inputPDF_formateado)
                    log.debug("inputPDF_formateado",typeof(inputPDF_formateado))

                    let objFilePDF = file.create({
                        name: 'Pedido_' + idPedido + '.pdf',
                        fileType: file.Type.PDF,                
                        contents: inputPDF_formateado,                
                        folder: CarpetaFacturasProveedores
                    })
                    idPDF = objFilePDF.save() 
                    log.debug("idPDF",idPDF);
                }
                // Procesar archivo XML cuando se reciba, guardar en gabinete        
                if (inputXML != '') {            
                    let
                     objFilePDF = file.create({
                        name: 'Pedido_' + idPedido + '.xml',
                        fileType: file.Type.XMLDOC,                
                        contents: inputXML,                
                        folder: CarpetaFacturasProveedores
                    })
                    idXML = objFilePDF.save()
                    log.debug("idXML",idXML)
                }
                let listaItemsPO = []
                llenarArrayItemsJsPO()  // llenar un array con los items del pedido seleccionado: arrayItemsJsPO        
                arrayItemsJsPO.map( item => listaItemsPO.push(item.itemid)) // llenar segundo array solo con item id: listaItemsPO        
                let xmlDocument = xml.Parser.fromString({text: inputXML})

                // Obtener datos del XML:                 
                let arrayItemsXMLuuid = xml.XPath.select({node: xmlDocument, xpath: '//tfd:TimbreFiscalDigital'}) 
                let xmlUUID = arrayItemsXMLuuid[0].getAttribute({name: 'UUID'}) // UUID                
                let arrayItemsXMLtotal = xml.XPath.select({node: xmlDocument, xpath: '//cfdi:Comprobante'}) 
                let xmlTOTAL = arrayItemsXMLtotal[0].getAttribute({name: 'Total'})  // TOTAL            
                 let arrayemisor=xml.XPath.select({node: xmlDocument, xpath: '//cfdi:Emisor'}) // rfc
                let rfc=arrayemisor[0].getAttribute({name: 'Rfc'}) 
                /* log.debug("Rfc emisor",rfc)
                log.debug("rfc del pedido en netsuite",getVendorRFC(idPedido)) */
                //log.debug('xmlUUID: ' + xmlUUID + ', xmlTOTAL: ' + xmlTOTAL)
                if (getVendorRFC(idPedido) != rfc) {
                    let opcion  = 'detalles'
                    let titulo = 'Algo ha salido mal...'
                    let mensaje_error = 'El rfc del xml no coincide con el pedido'
                    mensajeHTML(opcion, titulo, mensaje_error)
                    return true
                }

                let arrayItemsXML = xml.XPath.select({node: xmlDocument, xpath: '//cfdi:Concepto'}) // array items del XML
                let cadenaParaHTML = ''    
                
                // Validar cantidad de items en XML y en pedido
                /* log.debug("arrayItemsXML.length",arrayItemsXML.length) */
                if (arrayItemsJsPO.length != arrayItemsXML.length) {
                    let opcion  = 'detalles'
                    let titulo = 'Algo ha salido mal...'
                    let mensaje_error = 'Los artículos de la factura XML no coinciden con los artículos del Pedido'
                    mensajeHTML(opcion, titulo, mensaje_error)
                    return true
                }  
                let CodSATSinCoincidencia = false // bandera para validar que todos los items en el xml existan en el pedido por codigo SAT
                arrayItemsXML.map( (cuenta, key) => { 
                    let ClaveProdServ = cuenta.getAttribute({name: 'ClaveProdServ'})    
                    let NoIdentificacion = cuenta.getAttribute({name: 'NoIdentificacion'})            
                    let Descripcion = cuenta.getAttribute({name: 'Descripcion'})
                    let ValorUnitario = cuenta.getAttribute({name: 'ValorUnitario'})
                    let Cantidad = cuenta.getAttribute({name: 'Cantidad'})
                    let Importe = cuenta.getAttribute({name: 'Importe'})
                    let primerItemEnRadio = true            
                    let FilaItemXML = '<tr> <td>'+ClaveProdServ+'</td> <td>'+NoIdentificacion+'</td> <td style="text-align: left; ">'+Descripcion+'</td> <td>'+ValorUnitario+'</td> <td>'+Cantidad+'</td> <td>'+Importe+'</td> </tr>'
                    let FilasItemsPedido = ''            
                    // Construir tabla de artículos del XML y sus correspondencias de artículos de la Purchase order
                    var itemSearchObj = search.create({ // buscar items en NS que tengan el CodSAT
                        type: "item",
                        // filters:["custitem_myt_codigo_sat_xml.custrecord_myt_csx_codigo_sat_xml", "startswith", ClaveProdServ],    
                        filters:["custitem_mx_txn_item_sat_item_code.custrecord_mx_ic_mr_code","startswith",ClaveProdServ],   
                        columns:[
                            search.createColumn({name: "itemid",sort: search.Sort.ASC}),
                            search.createColumn({name: "itemid"}),
                            search.createColumn({name: "custitem_mx_txn_item_sat_item_code"})
                        ]
                    })
                    itemSearchObj.run().each(function(result){ 

                        /* log.debug('result.id', result.id) */

                        let encontrado = listaItemsPO.indexOf(result.id) > -1 ? listaItemsPO.indexOf(result.id) : -1       

                        /* log.debug('encontrado', encontrado) */

                        if (encontrado > -1) {                            
                            let checked = ''
                            if (primerItemEnRadio) {
                                checked = 'checked'
                                primerItemEnRadio =  false
                            } 
                            let nombreItem = result.getValue({name: 'itemid'})
                             let sat_item = result.getValue({name: 'custitem_mx_txn_item_sat_item_code'})
                          /*   log.debug("id item del pedido", nombreItem)
                            log.debug("clave sat xml",ClaveProdServ)
                          log.debug("clave sat pedido", sat_item ) */
                            let valor = '{id:'+result.id+', claveProdServ:'+ClaveProdServ+', valorUnitario:'+ValorUnitario+', cantidad:'+Cantidad+', importe:'+Importe+'}'  
                            FilasItemsPedido += '<tr> <td></td> <td></td> <td style="color: '+ titlesColor +'; text-align: left; " > <input '+checked+' type="radio" name="item_'+ key +'" value="'+ valor +'"> '+ nombreItem +' </td> <td></td> <td></td> <td></td> </tr>'                                
                        } else {
                            /* log.debug('no encontrado') */
                            CodSATSinCoincidencia = true     // si al menos un artículo no tiene coincidencias en el pedido, se activa la bandera 
                        }
                        return true
                    })                
                    cadenaParaHTML += FilaItemXML
                    cadenaParaHTML += FilasItemsPedido            
                }) 

                /* log.debug('CodSATSinCoincidencia 4: ' + CodSATSinCoincidencia) */
                
                // Validar que todos los artículos en el XML tengan coincidencia en el pedido
              /*
              if (CodSATSinCoincidencia) {
                    let opcion  = 'detalles'
                    let titulo = 'Algo ha salido mal...'
                    let mensaje_error = 'Existen artículos en el XML con un código SAT inexistente en el Pedido'
                    mensajeHTML(opcion, titulo, mensaje_error)
                    return true
                }
        */
                var html = ""+
                '<!doctype html>'+
                '<html lang="en">'+
                head+
                '<body>'+

                    '<style>'+ 
                        '.banner { background-image: url("'+ backgroundImg_onPost +'"); background-repeat: no-repeat; background-size: cover; background-color: '+ backgroundColor_onPost +'; }'+
                    '</style>'+

                    '<form id="myForm2" method="POST" class="form-horizontal" action="'+urlPortal+'">'+
                        
                        '<div class="banner">'+
                            cabecera+
                        '</div>'+
                        '<br>'+
                    
                        '<div class="container">'+                            
                            '<h5>Orden de compra ID: '+ idPedido +'</h5>'+                             
                            '<h3 style="color:'+ titlesColor +';">Validación de artículos</h3>'+
                            '<h6>Verifique los artículos del XML contra los artículos del Pedido</h6>'+
                            '<br>'+
                            '<table class="table">'+
                                '<tr>'+
                                    '<th>ClaveProdServ</th>'+
                                    '<th>NoIdentificacion</th>'+
                                    '<th>Descripcion</th>'+
                                    '<th>ValorUnitario</th>'+
                                    '<th>Cantidad</th>'+
                                    '<th>Importe</th>'+                            
                                '</tr>'+ 
                                cadenaParaHTML+
                            '</table>'+ 
                            '<input hidden type="text" name="user" id="user" value="'+user+'">'+
                            '<input hidden type="text" name="pass" id="pass" value="'+pass+'">'+
                            '<input hidden type="text" name="idVendor" id="idVendor" value="'+idVendor+'">'+
                            '<input hidden type="text" name="idPedido" id="idPedido" value="'+idPedido+'">'+
                            '<input hidden type="text" name="mensaje" id="mensaje" value="'+mensaje+'">'+
                            '<input hidden type="text" name="idPDF" id="idPDF" value="'+idPDF+'">'+
                            '<input hidden type="text" name="idXML" id="idXML" value="'+idXML+'">'+    
                            
                            '<input hidden type="text" name="xmlUUID" id="xmlUUID" value="'+xmlUUID+'">'+
                            '<input hidden type="text" name="xmlTOTAL" id="xmlTOTAL" value="'+xmlTOTAL+'">'+   
                            
                            '<input hidden type="text" name="opcion" id="opcion" value="crearBill">'+                   
                            
                            '<button type="submit" class="btn btn-primary">Guardar factura en Netsuite</button>'+
                            '<button style="margin-left: 10px;" type="button" class="btn btn-primary" onClick="regresar()"> Regresar </button>'+
        
                        '</div>'+  
                        '<br><br><br><br>'+              
                    '</form>'+

                    '<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-ka7Sk0Gln4gmtz2MlQnikT1wXgYsOgOMhuPIlRH9sENBO0LRn5q8nbTov41p" crossorigin="anonymous"> </script>'+
                    '<script>'+
                        'var mensaje = document.getElementById("mensaje").value;'+
                        'if (mensaje.length > 0) { alert(mensaje); };'+                   
                        'function regresar(){'+                    
                            'document.getElementById("opcion").value = "detalles";'+    
                            'var myForm2 = document.getElementById("myForm2");'+                
                            'myForm2.submit();'+
                        '}'+                 
                    '</script>'+
                '</body>'+
                '</html>'            
                contexto.response.write(html)        
                contexto.response.setHeader({ name: 'Custom-Header-Demo', value: 'Demo' })
                return true

            } catch (e) {
                let opcion = 'menuOrdenes'
                let titulo= 'Algo ha salido mal...'
                let mensaje = 'ERROR: ' + e
                mensajeHTML(opcion, titulo, mensaje)
                return true
            }

        }
    
    
        // 5 Detalles de un pedido
        function detallesOrden(){

            try {

                let cadena = ''        
                arrayItemsJsPO.map( itemValues => {
                    cadena += '<tr><td>'+ itemValues.id +'</td><td>'+ itemValues.item +'</td><td>'+ itemValues.quantity +'</td> <td>'+ itemValues.unit +'</td> <td>'+ itemValues.amount +'</td>'
                })
        
                var html = ""+
                '<!doctype html>'+
                '<html lang="en">'+
                head+
                '<body>'+

                    '<style>'+ 
                        '.banner { background-image: url("'+ backgroundImg_onPost +'"); background-repeat: no-repeat; background-size: cover; background-color: '+ backgroundColor_onPost +'; }'+
                    '</style>'+

                    '<form id="myForm" method="POST" class="form-horizontal" action="'+urlPortal+'">'+
                        
                        '<div class="banner">'+
                            cabecera+
                        '</div>'+
                        '<br>'+

                        '<div class="container">'+ 
                            '<h4>Orden de compra ID: '+ idPedido +'</h4>'+ 
                            '<h2 style="color: '+ titlesColor +'; ">Lista de artículos</h2>'+
                            '<br>'+
                            '<table class="table">'+
                                '<tr>'+
                                    '<th>ID artículo</th>'+
                                    '<th>Nombre</th>'+
                                    '<th>Cantidad</th>'+
                                    '<th>Unidad</th>'+
                                    '<th>Precio total</th>'+
                                '</tr>'+
                                cadena+
                            '</table>'+ 
        
                            '<input hidden type="text" name="user" id="user" value="'+user+'">'+
                            '<input hidden type="text" name="pass" id="pass" value="'+pass+'">'+
                            '<input hidden type="text" name="idVendor" id="idVendor" value="'+idVendor+'">'+
                            '<input hidden type="text" name="idPedido" id="idPedido" value="'+idPedido+'">'+ 
                            '<input hidden type="text" name="mensaje" id="mensaje" value="'+mensaje+'">'+ 
                            '<input hidden type="text" name="opcion" id="opcion" value="menuOrdenes">'+  
                            '<input hidden type="text" name="inputXML" id="inputXML" value="vacio">' +
                            '<input hidden type="text" name="inputPDF" id="inputPDF" value="vacio">' +
                            
                            '<button type="button" class="btn btn-primary" data-toggle="modal" data-target="#myModal">Procesar factura XML y PDF</button>'+ 
                            '<button style="margin-left: 10px; float: ;" type="button" class="btn btn-primary" id="regresar">Regresar</button>'+
        
                        '</div>'+ 
                        '<br><br>'+ 
                        
                        '<div style="background-color: lightgrey;" class="modal fade" id="myModal" role="dialog"  >'+
                            '<div class="modal-dialog">'+
                                '<div class="modal-content">'+
                                    '<div class="modal-header">'+
                                        //'<button type="button" class="close" data-dismiss="modal">&times;</button>'+
                                        '<h3 style="color: '+ titlesColor +';" class="modal-title">Cargar los archivos de facturación (XML y PDF)</h3>'+
                                    '</div>'+
                                    '<div class="modal-body">'+
                                        '<p style="color:'+ titlesColor +';">Elija el XML y PDF para comparar contra el pedido seleccionado</p>'+
                                        '<br>'+
                                        '<input class="form-control" type="file" accept=".xml, .pdf" name="archivoXML" id="archivoXML" placeholder="" multiple >'+                            
                                    '</div>'+
                                    '<div class="modal-footer">'+
                                        '<button type="button" class="btn btn-primary" id="send-file-button" data-dismiss="modal">Subir factura XML y PDF</button>'+                                
                                        '<button type="button" class="btn btn-primary" data-dismiss="modal">Close</button>'+
                                    '</div>'+
                                '</div>'+
                            '</div>'+
                        '</div>'+
                        '<br><br><br><br>'+
                    '</form>'+                   
        
                    '<script>'+    
                        'var mensaje = document.getElementById("mensaje").value;'+
                        'if (mensaje.length > 0) { alert(mensaje); };'+
                        
                        'var button_enviar = document.getElementById("send-file-button");'+
                        'var button_regresrar = document.getElementById("regresar");'+   
                        
                        'button_enviar.onclick = function () {'+ 
                            'var files = document.getElementById("archivoXML").files;'+ 
                            'if (files.length != 2) { alert("Solo puede elegir 2 archivos, un XML y un PDF"); return false; }'+
                            'var fileXML = "null";'+
                            'var filePDF = "null";'+ 
                            'if (files[0].type === "text/xml" && files[1].type == "application/pdf" ) { fileXML = files[0]; filePDF = files[1]; }'+
                            'if (files[1].type == "text/xml" && files[0].type == "application/pdf" ) { fileXML = files[1]; filePDF = files[0]; }'+
                            'if (fileXML === "null") { alert("Solo puede elegir 2 archivos, un XML y un PDF"); return false; }'+
                            'if (filePDF === "null") { alert("Solo puede elegir 2 archivos, un XML y un PDF"); return false; }'+
                            'document.getElementById("opcion").value = "procesarXML";'+ 
        
                            'var reader = new FileReader();'+                    
                            'reader.onload = function () { document.getElementById("inputXML").value = reader.result; };'+
                            'reader.readAsText(fileXML);'+
        
                            'var reader2 = new FileReader();'+                    
                            'reader2.onload = function () { document.getElementById("inputPDF").value = reader2.result; };'+
                            // 'reader2.readAsText(filePDF);'+
                            'reader2.readAsDataURL(filePDF);'+
                            
                                                
                            'const myTimeout = setTimeout(enviar, 700);'+
                        '};'+           
        
                        'button_regresrar.onclick=function(){'+   
                            'document.getElementById("opcion").value = "menuOrdenes";'+
                            'document.getElementById("inputXML").value = "vacio";'+
                            'document.getElementById("inputPDF").value = "vacio";'+
                            'const myTimeout = setTimeout(enviar, 700);'+
                        '};'+
        
                        'function enviar(){'+
                            'var myForm = document.getElementById("myForm");'+
                            'myForm.submit();'+
                        '}'+
        
                    '</script>'+

                    '<script src="https://code.jquery.com/jquery-3.2.1.slim.min.js" integrity="sha384-KJ3o2DKtIkvYIK3UENzmM7KCkRr/rE9/Qpg6aAZGJwFDMVNA/GpGFF93hXpG5KkN" crossorigin="anonymous"></script>'+
                    '<script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.12.9/umd/popper.min.js" integrity="sha384-ApNbgh9B+Y1QKtv3Rn7W3mgPxhU9K/ScQsAP7hUibX39j7fakFPskvXusvfa0b4Q" crossorigin="anonymous"></script>'+
                    '<script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/js/bootstrap.min.js" integrity="sha384-JZR6Spejh4U02d8jOt6vLEHfe/JQGiRRSQQxSfFWpi1MquVdAyjUar5+76PVCmYl" crossorigin="anonymous"></script>'+
        
                '</body>'+
                '</html>'
                contexto.response.write(html)
                contexto.response.setHeader({ name: 'Custom-Header-Demo', value: 'Demo' })
                return true

            } catch (e) {
                let opcion = 'menuOrdenes'
                let titulo= 'Algo ha salido mal...'
                let mensaje = 'ERROR: ' + e
                mensajeHTML(opcion, titulo, mensaje)
                return true
            }    

        }
    
        
        // 4 lista de órdenes por proveedor
        function desplegarTablaOrdenes() {

            try {
                // Buscar órdenes del proveedor  
                var purchaseorderSearchObj = search.create({
                    type: "purchaseorder",
                    filters: [
                        ["type", "anyof", "PurchOrd"], "AND",
                        ["mainline", "is", "T"], "AND",
                        ["status", "anyof", "PurchOrd:F"], "AND",
                        ["vendor.internalid", "anyof", idVendor]
                    ], columns: [                
                        search.createColumn({name: "entity"}),  
                        search.createColumn({name: "trandate"}),
                        search.createColumn({name: "status"}),
                        search.createColumn({name: "transactionnumber"})                    
                    ]
                });
                var searchResultCount = purchaseorderSearchObj.runPaged().count                    
                if (searchResultCount>0)  {            
                    purchaseorderSearchObj.run().each(function (result) {
                        
                        let vid = result.getValue({name: 'entity'})
                        let ventity = result.getText({name: 'entity'})
                        let vtrandate =result.getValue({name: 'trandate'})
                        let vstatus =result.getValue({name: 'status'})
                        let transactionnumber =result.getValue({name: 'transactionnumber'})

                        arrayPurchaseJsOrders.push({
                            id: result.id,
                            vendorId:   vid, 
                            vendorName: ventity,
                            trandate:   vtrandate,
                            status: vstatus, 
                            transactionnumber: transactionnumber
                        })
                        return true;
                    })            
                }
                // convertir lista de pedidos a lineas de tabla html
                let cadena = ''        
                arrayPurchaseJsOrders.map( pedido => {
                    cadena += '<tr><td>'+ pedido.id +'</td><td>'+ pedido.transactionnumber +'</td><td>'+ pedido.trandate +'</td> <td>'+ pedido.status +'</td> <td><button type="button" class="btn btn-primary" onClick="verDetalles('+pedido.id+')" >Ver detalles</button></td></tr>'
                })
                // desplegar HTML con tabla integrada en "cadena"
                var html = ""+
                '<!doctype html>'+
                '<html lang="en">'+
                head+
                '<body>'+

                    '<style>'+ 
                        '.banner { background-image: url("'+ backgroundImg_onPost +'"); background-repeat: no-repeat; background-size: cover; background-color: '+ backgroundColor_onPost +'; }'+
                    '</style>'+

                    '<form id="myForm" method="POST" class="form-horizontal" action="'+urlPortal+'">'+                       
                         
                        '<div class="banner">'+
                            cabecera+
                        '</div>'+
                        '<br>'+

                        '<div class="container">'+                            
                            '<h3 style="color: '+ titlesColor +';"> Lista de Pedidos pendientes por facturar </h3>'+
                            '<table class="table">'+
                                '<tr>'+
                                    '<th>Id pedido</th>'+
                                    '<th>Num. pedido</th>'+
                                    '<th>Fecha pedido</th>'+
                                    '<th>Status</th>'+
                                    '<th></th>'+
                                '</tr>'+ 
                                cadena+
                            '</table>'+         
                            
                            '<input hidden type="text" name="user" id="user" value="'+user+'">'+
                            '<input hidden type="text" name="pass" id="pass" value="'+pass+'">'+
                            '<input hidden type="text" name="idVendor" id="idVendor" value="'+idVendor+'">'+
                            '<input hidden type="text" name="mensaje" id="mensaje" value="'+mensaje+'">'+ 
                            '<input hidden type="text" name="idPedido" id="idPedido" value="">'+
                            '<input hidden type="text" name="opcion" id="opcion" value="detalles">'+  
        
                            '<button type="button" class="btn btn-primary" onClick="window.close()" style="margin-left: 10px; float: ;">  Cerrar Ventana </button>'+
                        '</div>'+

                        '<br><br><br><br>'+              
                    '</form>'+

                    '<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-ka7Sk0Gln4gmtz2MlQnikT1wXgYsOgOMhuPIlRH9sENBO0LRn5q8nbTov41p" crossorigin="anonymous"> </script>'+
                    '<script>'+
        
                        'var mensaje = document.getElementById("mensaje").value;'+
                        'if (mensaje.length > 0) { alert(mensaje); };'+
                        
                        'function verDetalles(idPedido){'+                    
                            'document.getElementById("idPedido").value = idPedido;'+
                            'document.getElementById("myForm").submit();'+
                        '}'+
                    '</script>'+
                    '</body>'+
                '</html>'
                contexto.response.write(html)
                contexto.response.setHeader({ name: 'Custom-Header-Demo', value: 'Demo' })
                return true

            } catch (e) {
                let opcion = 'menuOrdenes'
                let titulo= 'Algo ha salido mal...'
                let mensaje = 'ERROR: ' + e
                mensajeHTML(opcion, titulo, mensaje)
                return true
            }    
            
        }
       
    
        // 3 Menú de opcionse para POST
        function onPost(){

            try {

                // Leer parámetros del context del HTML        
                params = contexto.request.parameters
                opcion = params.opcion ? params.opcion : ''
                idVendor = params.idVendor ? params.idVendor : ''
                user = params.user ? params.user : ''
                pass = params.pass ? params.pass : ''
                idPedido = params.idPedido ? params.idPedido : ''
                inputXML = params.inputXML ? params.inputXML : '' 
                inputPDF = params.inputPDF ? params.inputPDF : ''
                idPDF = params.idPDF ? params.idPDF : '' 
                idXML = params.idXML ? params.idXML : ''
                xmlUUID = params.xmlUUID ? params.xmlUUID : '' 
                xmlTOTAL = params.xmlTOTAL ? params.xmlTOTAL : ''

                switch (opcion) {

                    case "menuOrdenes":                    
                        // checar login y password
                        var vendorSearchObj = search.create({
                            type: "vendor",
                            filters:[
                            ["custentity_be_vendor_user", "is", user], "AND",
                            ["custentity_be_vendor_password", "is", pass], "AND",
                            ["custentity_be_active_access", "is", true]
                            ],columns:[]
                        })
                        var searchResultCount = vendorSearchObj.runPaged().count                
                        vendorSearchObj.run().each(function (result) { idVendor = result.id })                
                        if (searchResultCount > 0) { 
                            let mensaje = ''
                            desplegarTablaOrdenes() // mandar a pantalla de tabla de órdenes
                        }else{
                            onGet() // regresar a pantalla de login
                        }
                        break
        
                    case "detalles":
                        llenarArrayItemsJsPO()
                        if (arrayItemsJsPO.length > 0) {                     
                            let mensaje = ''
                            detallesOrden() // desplegar pantalla de detalles
                        } else {
                            onGet() // regresar a pantalla de login
                        }
                        break
                    
                    case "procesarXML":                
                        procesarXML()
                        break 
        
                    case "crearBill":
                        crearBill()                
                        break
                
                    default:
                        break
                }     
                return true  

            } catch (e) {
                let opcion = 'menuOrdenes'
                let titulo= 'Algo ha salido mal...'
                let mensaje = 'ERROR: ' + e
                mensajeHTML(opcion, titulo, mensaje)
                return true
            }
            
              
        }
    
    
        // 2 login
        function onGet() {
                
            var html = ''+
            '<!doctype html>'+
            '<html lang="en">'+
            head+
            '<body>'+
                '<style>'+                     
                    '.container {max-width: 600px; background-color: none; background-image: none; }'+
                    '.banner { background-image: url("'+background_onGet+'"); background-repeat: no-repeat; background-size: cover; background-color: white; }'+
                '</style>'+
                '<form id="myForm" method="POST" class="form-horizontal" action="'+urlPortal+'">'+
                    '<div style="width:100%;" class="banner">'+                    
                        '<div class="container" >'+
                            '<br><br>'+
                            '<img style="width:350px; margin: auto; " src="'+logo+'" alt="MDN">'+
                            '<br><br>'+                        
                            '<b><h2 style="color: black;">Portal de Proveedores</h2>'+
                            '<h5 style="color: black;">Versión 2.0</h5></b>'+
                            '<br><br>'+
                        '</div>'+
                    '</div>'+
                    '<div class="container">'+                        
                        '<br>'+
                        '<h4>Acceso al sistema</h4>'+
                        '<table class="table">'+
                            '<tr>'+
                                '<th>Usuario</th>'+
                                '<th>Contraseña</th>'+
                            '</tr>'+
                            '<tr>'+
                                '<td><input style="color: black;" type="text" name="user" id="user"></td>'+
                                '<td><input style="color: black;" type="password" name="pass" id="pass"></td>'+
                            '</tr>'+
                        '</table>'+
                        '<input hidden type="text" name="opcion" id="opcion" value="menuOrdenes">'+
                        '<button type="submit" class="btn btn-primary" onClick="">Aceptar</button>'+
                        '<button type="button" class="btn btn-primary" onClick="window.close()" style="margin-left: 10px; float: ;">  Cerrar Ventana </button>'+
                    '</div>'+
                    '<br><br>'+
                '</form>'+

                '<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-ka7Sk0Gln4gmtz2MlQnikT1wXgYsOgOMhuPIlRH9sENBO0LRn5q8nbTov41p" crossorigin="anonymous"> </script>'+
                '<script>'+
                    'document.getElementById("user").value = "";'+
                    'document.getElementById("pass").value = "";'+
                '</script>'+
                '</body>'+
            '</html>'
    
            contexto.response.write(html);
            contexto.response.setHeader({ name: 'Custom-Header-Demo', value: 'Demo' });
    
        }
                
    
        // 1 Lista de entry points
        function menu(context) { 
            contexto = context 
            if (context.request.method === "GET") {
                onGet()
            }
            else{
                onPost()
            }
        }
    
    
        return {
            onRequest: menu
        }    
    
    })
    