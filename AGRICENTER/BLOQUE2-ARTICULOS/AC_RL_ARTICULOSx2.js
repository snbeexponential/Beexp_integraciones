/**
 * @author Saúl Navarro <>
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
            get:null,
            post:null,
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
        entry_point.get = function(request) {
            try {
                filters = [];
                
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
                    response.message = "Hacen falta argumentos: internalid || desde, hasta";
                    return response;
                }

                var custSearchObj = search.create({
                    type: "customer",
                    filters: filters,
                    columns: [
                        search_internalid = search.createColumn({ name: "internalid", laber: "internalid" }),
                        search_isperson = search.createColumn({ name: "isperson", laber: "isperson" }),
                        search_companyname = search.createColumn({ name: "companyname", laber: "companyname" }),

                        search_companyname = search.createColumn({ name: "companyname", label: "Company Name" }),
                        search_customername = search.createColumn({ name: "altname", label: "Name" }),
                        //search_firscusttname=search.createColumn({name: "firstname", label: "First Name"}),
                        //search_lastcustname=search.createColumn({name: "lastname", label: "Last Name"}),

                        search_entitystatus = search.createColumn({ name: "entitystatus", laber: "entitystatus" }),
                        search_category = search.createColumn({ name: "category", laber: "category" }),
                        search_salesrep = search.createColumn({ name: "salesrep", laber: "salesrep" }),
                        search_email = search.createColumn({ name: "email", laber: "email" }),
                        search_phone = search.createColumn({ name: "phone", laber: "phone" }),
                        //search_subsidiary=search.createColumn({name:"subsidiary",laber:"subsidiary"}),
                        search_pricelevel = search.createColumn({ name: "pricelevel", laber: "pricelevel" }),
                        search_currency = search.createColumn({ name: "currency", laber: "currency" }),
                        search_terms = search.createColumn({ name: "terms", laber: "terms" }),
                        search_creditlimit = search.createColumn({ name: "creditlimit", laber: "creditlimit" }),
                        search_custentity_mx_rfc = search.createColumn({ name: "vatregnumber", label: "RFC" }),
                        search_clientesuc = search.createColumn({ name: "custentity_bex_az_clientesuc", label: "Sucursal" }),
                        search_numerocli = search.createColumn({ name: "custentity_bex_az_numerocli_intelisis", label: "Numero de cliente Intelisis" }),
                        search_clientezona = search.createColumn({ name: "custentity_beex_az_clientezona", label: "Zona" }),
                        search_clientetipo = search.createColumn({ name: "custentity_beex_az_campotipodecliente", label: "Tipo Cliente" }),
                        //search_saldocliente=search.createColumn({name: "custentity_beex_az_saldocliente", label: "Saldo"}),
                        search_saldovencido = search.createColumn({ name: "custentity_beex_az_saldo_vencido", label: "Saldo Vencido" }),
                        search_terminospago = search.createColumn({ name: "custentity_beex_az_terminos_pago", label: "Terminos" }),
                        //search_clasifc=search.createColumn({name: "custentity_beex_az_gln", label: "Clasificacion"}),
                        search_crediodisp = search.createColumn({ name: "custentity_beex_az_credito_disponible", label: "Credito Disponible" }),
                        //search_numeroempleado=search.createColumn({name: "custentity_beex_az_numeroempleado", label: "Numero de Intelisis Empleado"}),


                        //search_custentity_beex_fa_usocfdi=search.createColumn({name:"custentity_beex_fa_usocfdi",label:"RFC"}),     
                    ],
                });

                var resultado = [];


                var searchResultCount = custSearchObj.runPaged().pageRanges;
                var pagedData = custSearchObj.runPaged({ "pa​g​e​S​i​z​e": 1000 });

                for (var i = 0; i < pagedData.pageRanges.length; i++) {
                    var currentPage = pagedData.fetch(i);
                    currentPage.data.forEach(function (result) {

                        var custBookSearchObj = search.create({
                            type: "customer",
                            filters: [filters, "AND",
                                ["internalid", "anyof", result.getValue(search_internalid)]],
                            columns: [
                                search_address = search.createColumn({ name: "addresslabel", label: "Address Label" }),
                                search_country = search.createColumn({ name: "country", label: "Country" }),
                                search_attention = search.createColumn({ name: "attention", label: "Attention" }),
                                search_addresse = search.createColumn({ name: "addressee", label: "Addressee" }),
                                search_addrphone = search.createColumn({ name: "addressphone", label: "Address Phone" }),
                                search_addr1 = search.createColumn({ name: "address1", label: "Address 1" }),
                                search_addr2 = search.createColumn({ name: "address2", label: "Address 2" }),
                                search_city = search.createColumn({ name: "city", label: "City" }),
                                search_state = search.createColumn({ name: "state", label: "State/Province" }),
                                search_zip = search.createColumn({ name: "zipcode", label: "Zip Code" }),
                                //search_vatregnumber=search.createColumn({name:"custentity_vat_reg_no", label: "VAT Registration No"}),
                                search_isdefaultshipping = search.createColumn({ name: "isdefaultshipping", label: "isdefaultshipping" }),
                                search_isdefaultbilling = search.createColumn({ name: "isdefaultbilling", label: "isdefaultbilling" }),
                                search_internalid2 = search.createColumn({ name: "addressinternalid", label: "Address Internal ID" })
                            ],
                        });
                        var searchResultCount = custBookSearchObj.runPaged().pageRanges;
                        var pagedData2 = custBookSearchObj.runPaged({
                            "pa​g​e​S​i​z​e": 1000,
                        });
                        var lista_cus_bookadd = [];
                        var default_address = [];
                        for (var j = 0; j < pagedData2.pageRanges.length; j++) {
                            var currentPage2 = pagedData2.fetch(j);
                            currentPage2.data.forEach(function (result2) {
                                lista_cus_bookadd.push({
                                    internalid: result2.getValue(search_internalid2),
                                    notedirectiontype: null,
                                    country: result2.getValue(search_country),
                                    attention: result2.getValue(search_attention),
                                    addresse: result2.getValue(search_addresse),
                                    addrphone: result2.getValue(search_addrphone),
                                    addr1: result2.getValue(search_addr1),
                                    addr2: result2.getValue(search_addr2),
                                    city: result2.getValue(search_city),
                                    state: result2.getValue(search_state),
                                    zip: result2.getValue(search_zip),
                                    //vatregnumber:result2.getValue(search_vatregnumber),
                                    label: result2.getValue(search_address),
                                    defaultshipping: result2.getValue(search_isdefaultshipping),
                                    defaultbilling: result2.getValue(search_isdefaultbilling),
                                    isresidential: null
                                }
                                );
                            });
                        }

                        response.result.push({
                            internalid: result.getValue(search_internalid),
                            isperson: result.getValue(search_isperson),
                            companyname: result.getValue(search_companyname),
                            customername: result.getValue(search_customername),
                            //firstname:result.getValue(search_firscusttname),
                            //lastname:result.getValue(search_lastcustname),
                            entitystatus: result.getValue(search_entitystatus),
                            category: result.getValue(search_category),
                            salesrep: result.getValue(search_salesrep),
                            email: result.getValue(search_email),
                            phone: result.getValue(search_phone),
                            //subsidiary:result.getValue(search_subsidiary),
                            pricelevel: result.getValue(search_pricelevel),
                            currency: result.getValue(search_currency),
                            terms: result.getValue(search_terms),
                            creditlimit: result.getValue(search_creditlimit),
                            rfc: result.getValue(search_custentity_mx_rfc),
                            clientesuc: result.getValue(search_clientesuc),
                            numerocli: result.getValue(search_numerocli),
                            clientezona: result.getValue(search_clientezona),
                            // saldocliente:result.getValue(search_saldocliente),
                            saldovencido: result.getValue(search_saldovencido),
                            terminospago: result.getValue(search_terminospago),
                            //clasifc:result.getValue(search_clasifc),
                            crediodisp: result.getValue(search_crediodisp),
                            crediodisp: result.getValue(search_clientetipo),
                            //numeroempleado:result.getValue( search_numeroempleado),

                            //usocfdi:result.getValue(search_custentity_beex_fa_usocfdi),
                            addressbook: {
                                addressbookaddress: lista_cus_bookadd,
                            }

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
                if (fixed_request.internalid) {
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
            let obj2create = {};

            var user_data = {

                itemid : request.no_articulo_itelisis,
                displayname : request.nombre_art,
                class : request.clase,
                custitem_bex_az_subclase : request.subclase,
                custitem_beex_az_um : request.unidad_medida,
                custitem_bex_az_ingreact : request.ingredient_act,
                manufacturer : request.fabricante,
                salesdescription : request.description_ventas,
                taxschedule : request.taxschedule,
                taxschedule : request.impuesto_iva,
                custitem_bex_az_iepsarticulo : request.impuesto_ieps,
                price1:[ ]
                    
                    
                }
                




    /*             internalid: fixed_request.internalid,
                companyname: fixed_request.nombre_compania,
                isperson: fixed_request.isperson,
                customername: fixed_request.nombre2,
                firstname: fixed_request.nombre,
                lastname: fixed_request.apellido,
                entitystatus: fixed_request.estado_entidad,
                category: fixed_request.categoria,
                salesrep: fixed_request.representante,
                email: fixed_request.correo_electronico,
                phone: fixed_request.telefono,
                pricelevel: fixed_request.nivel_precio,
                currency: fixed_request.currency,
                creditlimit: fixed_request.limite_credito,
                custentity_beex_az_clientezona: fixed_request.cliente_zona,
                custentity_bex_az_clientesuc: fixed_request.sucursal,
                custentity_beex_az_campotipodecliente: fixed_request.tipo_cliente,
                vatregnumber: fixed_request.rfc,
                custentity_beex_az_saldo_vencido: fixed_request.saldo_vencido,
                custentity_beex_az_terminos_pago: fixed_request.terminos,
                custentity_beex_az_credito_disponible: fixed_request.credito_disponible,
                addressbook: [
                    {
                        addressid: fixed_request.addressbook[0].id,
                        defaultbilling: fixed_request.addressbook[0].billing,
                        defaultshipping: fixed_request.addressbook[0].shipping,
                        addressbookaddress: {
                            address: fixed_request.addressbook[0].addressbookaddress.id,
                            notedirectiontype: fixed_request.addressbook[0].addressbookaddress.notas,
                            country: fixed_request.addressbook[0].addressbookaddress.pais,
                            addressee: fixed_request.addressbook[0].addressbookaddress.propietario,
                            addrphone: fixed_request.addressbook[0].addressbookaddress.numero_direccion,
                            addr1: fixed_request.addressbook[0].addressbookaddress.calle1,
                            addr2: fixed_request.addressbook[0].addressbookaddress.calle2,
                            city: fixed_request.addressbook[0].addressbookaddress.ciudad,
                            state: fixed_request.addressbook[0].addressbookaddress.estado,
                            zip: fixed_request.addressbook[0].addressbookaddress.codigo_postal,
                            

                        }
                    }
                ] */
                // contact : [{
                //     contactroles:{
                //         contact: fixed_request.c
                //     }
                // }] 

            
        

            fixed_request['custentity_fa_created_from'] = runtime.getCurrentScript().id;

            if (fixed_request.internalid) { obj2create["id"] = fixed_request.internalid; }
            obj2create['recordType'] = record.Type.NON_INVENTORY_ITEM;
            obj2create['isDynamic'] = true;
            obj2create['ignoreMandatoryFields'] = true;
            //Parsear los datos
            let parseTest = JSON.parse(JSON.stringify(user_data));
            obj2create['values'] = parseTest;
            let submit = jsimport.submitFieldsJS(obj2create);
            response.result = {
                clientid: submit.recordId,
                /* direcciones:[] */
            };

            // Obtener ID de cada dirección agregada
            //  var objCustomer = record.load({ type: record.Type.CUSTOMER, id: submit.recordId, isDynamic: true });

            // log.debug('datos parseados' ,submit);
            // var totalLines = objCustomer.getLineCount({ sublistId: 'addressbook' });

            /*     if (totalLines>0){
                  for (let index = 0; index < totalLines; index++) {
                    
                       response.result.direcciones.push({
                          label: objCustomer.getSublistValue({ sublistId: 'addressbook', fieldId: 'label', line: index }),
                          addressid: objCustomer.getSublistValue({ sublistId: 'addressbook', fieldId: 'internalid', line: index })                    
                      })
                  }
              }     */


            response.message = submit.msg;
            record.submitFields({
                type: record.Type.NON_INVENTORY_ITEM,
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