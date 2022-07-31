/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
 define(['N/record', 'N/http', 'N/ui/dialog', 'N/url', 'N/ui/message'],
 /**
* @param{record} record
*/
 (record, http, dialog, url, message) => {
     const afterSubmit = (context) => {
         let customerRecord = context.newRecord;
         let salesordid = customerRecord.id
         //datos generales
         const ObjeSORecord = record.load({
             type: record.Type.SALES_ORDER,
             id: salesordid,
             isDynamic: true
         })


         let cliente = ObjeSORecord.getValue({
             fieldId: 'custbody_bex_az_numclit_inteli_ct'
         });
         let moneda = ObjeSORecord.getText({
             fieldId: 'currency'
         });

         if (moneda!=null&&moneda==="MXN") {
             moneda="Pesos"
         }else if(moneda!=null&&moneda==="US Dollar"){
            moneda="Dolares"
         }
         

         let agente = ObjeSORecord.getValue({
             fieldId: 'salesrep'
         });
         
         let pricelevel = ObjeSORecord.getValue({
             fieldId: 'pricelevel'
         });
         //Id interno de la ubicación Netsuite
         let almacen = ObjeSORecord.getValue({
             fieldId: 'location'
         });

         //iD INTELISI DE LA SUCURSAL 2
         //Campo sucursale en Sales order
         let sucursal = ObjeSORecord.getValue({
             fieldId: 'custbody_beex_az_num_sucur_inte'
         });

         log.debug("almacen",almacen)
         log.debug("sucursal",sucursal)

       
         let condicion = ObjeSORecord.getValue({
            fieldId: 'custbody_beex_az_termesti'
         });

         let categoria = ObjeSORecord.getValue({
            fieldId: 'custbody_beex_az_catcliente'
         });


         let numLines = ObjeSORecord.getLineCount({
            sublistId: 'item'
        });
         let articulos = [];
         for (let i = 0; i < numLines; i++) {
            
             let item = ObjeSORecord.getSublistValue({
                 sublistId: 'item',
                 fieldId: 'item',
                 line: i
             });

             let Objitem=record.load({
                type: record.Type.NON_INVENTORY_ITEM,
                id: item,
                isDynamic: true
            })
            let NombreIntelisis = Objitem.getValue({
                fieldId:'itemid'
             });


             let precio = ObjeSORecord.getSublistValue({
                 sublistId: 'item',
                 fieldId: 'amount',
                 line: i
             });

             let unidad = ObjeSORecord.getSublistValue({
                 sublistId: 'item',
                 fieldId: 'unit',
                 line: i
             });

             let cantidad = ObjeSORecord.getSublistValue({
                 sublistId: 'item',
                 fieldId: 'quantity',
                 line: i
             });

             let precioLista= ObjeSORecord.getSublistValue({
                sublistId: 'item',
                fieldId: 'rate',
                line: i
            });

             let precioAc=ObjeSORecord.getSublistValue({
                sublistId: 'item',
                fieldId: 'custcol_bex_az_precioacordado',
                line: i
            });


             let descuento = (precioLista-precioAc)/precioLista

             let iva = ObjeSORecord.getSublistValue({
                sublistId: 'item',
                fieldId: 'taxrate1',
                line: i
            });
             let ieps = ObjeSORecord.getSublistValue({
                sublistId: 'item',
                fieldId: 'custcol_bex_az_iepstransac',
                line: i
            });

            //Articulos: "AIN0664"
             articulos.push({
                 Articulo:NombreIntelisis,
                 Cantidad:cantidad,
                 Precio:precioLista,
                 Unidad:unidad,
                 Descuento:descuento,
                 Iva:iva,
                 Ieps:ieps
             })
         }
         
         const clienteObj = {
             Mov: "Pedido",
             Cliente:cliente,
             Moneda:moneda,
             Agente:agente,
             Condicion:condicion,
             Causa:null,
             ListaPreciosEsp: pricelevel,
             Almacen:almacen,
             Sucursal: parseInt(sucursal),
             Categoria:categoria,
             Articulos:articulos
         }
         let parseado = JSON.stringify(clienteObj);
         log.debug('json', parseado);
         //validando que no tenga campos con F en autorizado
         let countValido=0;

         let items = customerRecord.getLineCount({
             sublistId: 'item'
         });
         let isValido = "V";
         for (let j = 0; j < items; j++) {
             isValido = customerRecord.getSublistValue({
                 sublistId: 'item',
                 fieldId: 'custcolconfirma_venta_menor',
                 line: j
             });
             if (isValido === "F") {
                 countValido++;
             }
         }
         log.debug("Count Valido",countValido);

         if (countValido >0) {
            log.debug("no creado")
         }else{
            if (context.type === "create"||context.type === "edit") {
                const customerRecord2 = context.newRecord;
                log.debug('id:', customerRecord2.id)
                log.debug('create: ', 'creando');
                const headerObj = {
                    'Content-Type': 'application/json',
                };
                let apiReponse = http.post({
                    url: 'http://crm.agricenter.com.mx:5190/api/ventas/guardar',
                    headers: headerObj,
                    body: parseado
                });
                log.debug('api response: ', apiReponse);
                let apibody = apiReponse.body;
                log.debug('body del response: ', apibody);
                let apicode = apiReponse.code;
                log.debug('codigo: ', apicode);
        
                if (apicode === 200) {
                    log.debug('CONEXION:', 'CONEXION EXITOSA');
                } else {
                    log.debug('algo mal salio', 'algo salio mal');
                    //log.debug('respuesa del server:',response)
                }
        
                return apiReponse;
            }
         }
/*          const headerObj = {
             'Content-Type': 'application/json',
         };
         let apiReponse = http.post({
             url: 'http://crm.agricenter.com.mx:5190/api/ventas/guardar',
             headers: headerObj,
             body: parseado
         });
         log.debug('api response: ', apiReponse);
         let apibody = apiReponse.body;
         log.debug('body del response: ', apibody);
         let apicode = apiReponse.code;
         log.debug('codigo: ', apicode);

         if (apicode === 200) {
             log.debug('CONEXION:', 'CONEXION EXITOSA');
         } else {
             log.debug('algo mal salio', 'algo salio mal');
             //log.debug('respuesa del server:',response)
         } */

         /* else{
 let Novalido = message.create({
     title: 'Orden de Venta no Guardada',
     message: "No se pudo guardar la orden de venta, el valor de Autorización tiene datos incorrectos, debe ser un valor (F o V)",
     type: message.Type.ERROR
 });
 Novalido.show()
} */

         //fin validando que no tenga campos con F en autorizado

     }

     return { afterSubmit }

 });
