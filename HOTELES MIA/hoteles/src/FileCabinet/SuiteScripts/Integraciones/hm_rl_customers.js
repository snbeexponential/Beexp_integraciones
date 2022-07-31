/**
 * @author Evelyn Sarmiento Cámbara<>
 * @Modificacion <>
 * @Name ac_rl_customers.js
 * @description Script para la importacion/exportacion de Customers. URL Documentation: <pendiente>
 * @file  <URL PENDIENTE>
 * @NApiVersion 2.1
 * @NScriptType Restlet
 */

 define([
    'N/log',
    'N/record',
    '../libs/lib_rest_module',
    'N/runtime',
    "N/search",
    "N/format"
],
    function (log, record, jsimport, runtime, search, format) {

        const entry_point = {
            get: null,
            post: null,
            put: null
        };

        const response = {
            code: 200,
            message: "",
            result: []
        };


        const CONTRATO = {
        };
        //Consulta del cliente por numero de id interno
        entry_point.get = function (request) {
            try {
                filters = [];
                var pagina = request.pagina || 1;
                var id = request.internalid;
                var fecha_desde;
                var fecha_hasta;
                if (request.desde && request.hasta) {
                    fecha_desde = new Date(request.desde);
                    fecha_hasta = new Date(request.hasta);
                    var formattedDateString_desde = format.format({
                        value: fecha_desde,
                        type: format.Type.DATETIME,
                    });
                    var formattedDateString_hasta = format.format({
                        value: fecha_hasta,
                        type: format.Type.DATETIME,
                    });
                    formattedDateString_desde = formattedDateString_desde.replace(
                        /(:\d{2}):\d{1,2}\b/,
                        "$1"
                    );
                    formattedDateString_hasta = formattedDateString_hasta.replace(
                        /(:\d{2}):\d{1,2}\b/,
                        "$1"
                    );
                }
                if (id) {
                    filters.push(["internalidnumber", "equalto", id]);
                } else if (formattedDateString_desde && formattedDateString_hasta) {
                    filters.push([
                        "lastmodifieddate",
                        "within",
                        formattedDateString_desde,
                        formattedDateString_hasta,
                    ]);
                } else {
                    response.message = "Missing fields: internalid || desde, hasta";
                    return response;
                }

                var custSearchObj = search.create({
                    type: "customer",
                    filters: filters,
                    columns: [
                        search_internalid = search.createColumn({ name: "internalid", laber: "internalid" }),
                        search_isperson = search.createColumn({ name: "isperson", laber: "isperson" }),
                        search_companyname = search.createColumn({ name: "companyname", laber: "companyname" })
                    ],
                });

                var resultado = [];


                var searchResultCount = custSearchObj.runPaged().pageRanges;
                //Busqueda direccion
                var pagedData = custSearchObj.runPaged({ "pa​g​e​S​i​z​e": 1000 });

                //Busqueda direcciones del cliente
                for (var i = 0; i < pagedData.pageRanges.length; i++) {
                    var currentPage = pagedData.fetch(i);
                    currentPage.data.forEach(function (result) {

                       
                      /*   var pagedData3 = custContactSearchObj.runPaged({
                            "pa​g​e​S​i​z​e": 1000,
                        }); */
                       
                        response.result.push({
                            internalid: result.getValue(search_internalid),
                            isperson: result.getValue(search_isperson),
                            companyname: result.getValue(search_companyname),
                        });
                    });
                }


            } catch (error) {
                response.code = 400;
                response.message = error.message;
            }
            return response;
        }

        //Creación del cliente
        entry_point.post = function (request) {
            log.audit('POST', request);
            try {
                let fixed_request = JSON.parse(JSON.stringify(request));
                if (!fixed_request.internalid) {
                    createOrUpdateCustomer(fixed_request);
                    
                } else {
                    response.code = 400;
                    response.message = 'You do not need to provide the customer ID';
                }
            } catch (error) {
                log.error('entry_point.post ERROR', error);
                response.code = 400;
                response.message = error.message;
            }
            return response;
        }



        entry_point.put = (request) => {
            try {
                let fixed_request = JSON.parse(JSON.stringify(request));

                if (fixed_request.idcliente){
                    createOrUpdateCustomer(fixed_request);  
                    
                } else {
                    response.code = 400;
                    response.message = 'You must provide the customer ID';
                }
            } catch (error) {
                log.error('error', error);
                response.code = 400;
                response.message = error.message;
            }
            return response;
        }

        const createOrUpdateCustomer = (fixed_request) => {

            var json_test = record.create({
                type: record.Type.CUSTOMER,
                isDynamic: true,

            })

            let obj2create = {};
            //taxregistrationnumber
            user_data2 = {
                entityid: fixed_request.nombrecompleto,
                isperson: fixed_request.tipopersona,
                firstname: fixed_request.firstname,
                lastname: fixed_request.lastname,
                companyname: fixed_request.nombrecompleto,
                entitystatus: fixed_request.status,
                phone: fixed_request.telefono,
                email: fixed_request.email,
                subsidiary:fixed_request.subsidiaria,
                custentity_mx_rfc:fixed_request.rfc,
                pricelevel: fixed_request.pricelevel,
                currency: fixed_request.currency,
                terms: fixed_request.terms,
                salesrep: fixed_request.representante,
                category: fixed_request.category
            }


            /* var user_data2 = {}; */
            let addressObj={addressbook:[]}
            let contactObj={contact:[]}


            if (!fixed_request.idcliente) {

                var address_data = {};
                    addressObj.addressbook.push({
                                addressbookaddress: {
                                    address: fixed_request.direccion[0].direccion,
                                    custrecord_streetname:fixed_request.direccion[0].nombrecalle,
                                    custrecord_streetnum:fixed_request.direccion[0].numerocalle,
                                    notedirectiontype: fixed_request.direccion[0].nota,
                                    country: fixed_request.direccion[0].pais,
                                    addressee: fixed_request.direccion[0].direccion,
                                    addrphone: fixed_request.direccion[0].telofonodireccion,
                                    city: fixed_request.direccion[0].municipio,
                                    state: fixed_request.direccion[0].estado,
                                    zip: fixed_request.direccion[0].codigopostal
                                }
                    });
                    address_data = Object.assign(addressObj);
                    

                    var contact_data = {};
                   /*  for (let i = 0; i < fixed_request.contactoscliente.length; i++) {
                        //Contacto principal
                        contactObj.contact.push({
                            subsidiary: fixed_request.subsidiaria,
                            entityid: fixed_request.contactoscliente[i].CC_Nombre,
                            title: fixed_request.contactoscliente[i].CC_Puesto,
                            email: fixed_request.contactoscliente[i].CC_Email,
                            phone: fixed_request.contactoscliente[i].CC_Telefono,
                            mobilephone: fixed_request.contactoscliente[i].CC_TelefonoMovil
                        })
                        contact_data = Object.assign(contactObj);
                    } */
                    /* user_data = Object.assign(user_data2,contact_data,address_data); */
                    user_data = Object.assign(user_data2,address_data);
            } else {
                 var costumerRecord = record.load({
                    type:record.Type.CUSTOMER,
                    id: fixed_request.idcliente,
                    isDynamic: true,
                });
                var directionId=costumerRecord.getSublistValue({ 
                    sublistId: 'addressbook',
                    fieldId: 'id',
                    line:0 
                })                
                var address_data = {};
                    
                    addressObj.addressbook.push({
                                addressid:  directionId,
                                addressbookaddress: {
                                    address: fixed_request.direccion[0].direccion,
                                    custrecord_streetname:fixed_request.direccion[0].nombrecalle,
                                    custrecord_streetnum:fixed_request.direccion[0].numerocalle,
                                    notedirectiontype: fixed_request.direccion[0].nota,
                                    country: fixed_request.direccion[0].pais,
                                    addressee: fixed_request.direccion[0].direccion,
                                    addrphone: fixed_request.direccion[0].telofonodireccion,
                                    city: fixed_request.direccion[0].municipio,
                                    state: fixed_request.direccion[0].estado,
                                    zip: fixed_request.direccion[0].codigopostal
                                }
                    });
                    address_data = Object.assign(addressObj);

                    
/*                     var costumerRecord = record.load({
                        type:record.Type.CUSTOMER,
                        id: fixed_request.idcliente,
                        isDynamic: true,
                    });
                    log.debug("SI LLEGA")
                    

                    var contactId=costumerRecord.getSublistValue({ 
                        sublistId:'contact',
                        fieldId: 'id',
                        line:0
                    })

                    if(contactId){
                        log.debug("ID DEL CONTACTO",contactId)
                    }
 */
                
                user_data = Object.assign(user_data2,address_data);
            }


            if (fixed_request.isperson == true) {
                fixed_request.isperson = "T"
            } else if (fixed_request.isperson == false) {
                fixed_request.isperson = "F"
            }



            fixed_request['custentity_fa_created_from'] = runtime.getCurrentScript().id;

            if (fixed_request.idcliente) { obj2create["id"] = fixed_request.idcliente; }
            obj2create['recordType'] = record.Type.CUSTOMER;
            obj2create['isDynamic'] = true;
            obj2create['ignoreMandatoryFields'] = true;
            //Parsear los datos
            let parseTest = JSON.parse(JSON.stringify(user_data));
            obj2create['values'] = parseTest;
            //log.debug('testarray', obj2create);
            let submit = jsimport.submitFieldsJS(obj2create);

            response.result = {
                clientid: submit.recordId,
                /* direcciones:[] */
            };
            
            log.debug("obj2create Hoy",json_test)

            if (fixed_request.idcliente) { 
                response.message = "Cliente actualizado exitosamente";
             }else{
                response.message = "Cliente agregado exitosamente";
             }
             
            
            record.submitFields({
                type: record.Type.CUSTOMER,
                id: response.result.clientid,

                values: {
                    custentity_fa_request: JSON.stringify(fixed_request),
                    custentity_fa_response: response
                },
                options: {
                    enableSourcing: false,
                    ignoreMandatoryFields: true
                }
            });

            
        }
        return entry_point;
    });