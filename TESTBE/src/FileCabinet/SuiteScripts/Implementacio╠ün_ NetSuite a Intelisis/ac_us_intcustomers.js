/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
 define(['N/record', 'N/http', 'N/ui/dialog', 'N/url'],
 /**
* @param{record} record
*/
 (record, http, dialog, url) => {


     const afterSubmit = (context) => {
         var customerRecord = context.newRecord;
         let idcou = customerRecord.id

         //datos generales
         //let cliente = customerRecord.getValue('entityid');
         let idcle = idcou.toString();
         let nombreCliente = customerRecord.getValue('companyname');

         let gln =customerRecord.getValue('custentity_beex_az_clasificacion') //Preguntar cliente
         
         let rfc = customerRecord.getValue('custentityrfc');
         
         let email = customerRecord.getValue('email');
         let telefono = customerRecord.getValue('phone');

         //direccion


         let direccion = customerRecord.getValue('shipaddr1');
         let colonia = customerRecord.getValue('shipaddr2');
         let poblacion = customerRecord.getValue('shipcity');
         let estado = customerRecord.getValue('shipstate');
         let cp = customerRecord.getValue('shipzip');

/*             let direccion = customerRecord.getValue('shipcountry');
         let direccionNumero = "" //no existe
         let delegacion = customerRecord.getValue('shipcity');
         let colonia = customerRecord.getValue('shipaddr2');
         let poblacion = customerRecord.getValue('shipaddr1');
         let estado = customerRecord.getValue('shipstate');
         let cp = customerRecord.getValue('shipzip'); */



         const customerObj=record.load({
             type: "customer",
             id: customerRecord.id,
             isDynamic: true,
         })

         //Agregando campos nivel linea
         let familia = customerObj.getText({
             fieldId: 'custentity_bex_az_clientesuc'
         }) 
         let categoria =customerObj.getText({
             fieldId: 'category'
         })
         let agente = customerObj.getValue({
             fieldId: 'salesrep'
         })
         let listapreciosEsp =customerObj.getText({
             fieldId: 'pricelevel'
         })
         let tipoCliente =customerObj.getText({
             fieldId: 'custentity_beex_az_campotipodecliente'
         })
          
         let idContacto
         let idDireccion
         //obtener id dirección

         let directions = customerObj.getLineCount({
             sublistId: 'addressbook'
         });
         if (directions<=1 && directions>=1) {
             idDireccion = customerObj.getSublistValue({
                 sublistId: 'addressbook',
                 fieldId: 'internalid',
                 line: 0
             });                
         }else{
             for (let i = 0; i < directions; i++) {
                 const item_id = customerObj.getSublistValue({
                     sublistId: 'addressbook',
                     fieldId: 'defaultshipping',
                     line: i
                 });
                 if (item_id==true) {
                 idDireccion = customerObj.getSublistValue({
                     sublistId: 'addressbook',
                     fieldId: 'internalid',
                     line: i
                 });
                 }else{
                     idDireccion=""
                 }
             }
         }

         //obtener id Contacto

         let contacts = customerObj.getLineCount({
             sublistId: 'contactroles'
         });
         if (contacts<=1 && contacts>=1) {
             idContacto = customerObj.getSublistValue({
                 sublistId: 'contactroles',
                 fieldId: 'contact',
                 line: 0
             });
         }

         //Obtener datos de contacto
         idContacto = customerObj.getSublistValue({
             sublistId: 'contactroles',
             fieldId: 'contact',
             line: 0
         });

             let contact = customerObj.getSublistValue({
                 sublistId:'contactroles',
                 fieldId: 'contact',
                 line: 0
             });
             let contactname = customerObj.getSublistValue({
                 sublistId:'contactroles',
                 fieldId: 'contactname',
                 line: 0
             });
             let emailc= customerObj.getSublistValue({
                 sublistId:'contactroles',
                 fieldId: 'email',
                 line: 0
             });

             const new_contact = record.load({
                 type: 'contact',
                 id:idContacto,
                 isDynamic:true
             })

             let tel = new_contact.getValue({
                 fieldId: 'phone',
             });


             const contactObj = {
                 Cliente: idcle,
                 Nombre: contactname,
                 Email: emailc,
                 Telefonos: tel,
                 Id:parseInt(contact),
                 IdContacto: parseInt(contact)
             }
         //Fin de datos de contacto

         //contactroles


         const clienteObj = {
             Cliente:idcle,
             Nombre:nombreCliente,
             Familia:familia,
             Agente:agente,
             ListaPreciosEsp: listapreciosEsp,
             GLN:gln,
             Categoria:categoria,
             Direccion: direccion,
             Colonia: colonia,
             Poblacion: poblacion,
             Estado: estado,
             CodigoPostal: cp,
             RFC: rfc,
             Tipo: tipoCliente,
             Email: email,
             Telefonos: telefono,
             IdNetsuite:parseInt(idcle),
             IdContacto:parseInt(idContacto),
             IdDireccion:parseInt(idDireccion)
         }

         //familia = Sucursal
         let parseado = JSON.stringify(clienteObj);
         if (context.type === "create"|| context.type === "edit") {                
             var customerRecord = context.newRecord;
             const headerObj = {
                 'Content-Type': 'application/json',
             };

             let apiReponse = http.post({
                 url: 'http://crm.agricenter.com.mx:5190/api/cte/guardar',
                 headers: headerObj,
                 body: parseado
             });
             let apibody = JSON.parse(apiReponse.body);
             let clienteintelisis = apibody[0].Cliente;
             
             if (clienteintelisis !=null) {
                customerObj.setValue({
                    fieldId: "custentity_bex_az_numerocli_intelisis",
                    value:clienteintelisis,
                    ignoreFieldChange:true
                })
                customerObj.save({
                    ignoreMandatoryFields: true
                });
             }
             
             let apicode = apiReponse.code;
             if (apicode === 200) {
                 log.debug('CONEXION CLIENTE:', 'CONEXION EXITOSA cliente');
             } else {
                 log.debug('algo mal salio', 'algo salio mal');
                 
             }

             let parseadocontacto = JSON.stringify(contactObj);
             let apiReponseContacto = http.post({
                 url: 'http://crm.agricenter.com.mx:5190/api/contactos/guardar',
                 headers: headerObj,
                 body: parseadocontacto
             });
             /* log.debug('api apiReponseContacto: ', apiReponseContacto); */
             let apibody2 = apiReponseContacto.body;
             /* log.debug('Cliente ApiBody', apibody2); */
             let apicode2 = apiReponseContacto.code;
             /* log.debug('codigo: ', apicode2); */

             if (apicode2 === 200) {
                 log.debug('CONEXION CONTACTO:', 'CONEXION EXITOSA');
             } else {
                 log.debug('algo mal salio', 'algo salio mal');
             }


             return apiReponse;

         }

     }

     return { afterSubmit }
 });


