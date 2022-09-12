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

        let empleadoInternalid = '';

        const CONTRATO = {
        };
        //Consulta del cliente por numero de id interno
        entry_point.get = function (request) {
            return 'h2'
        }

        let server = '';

        //Creación del cliente
        entry_point.post = function (request, server) {
            log.audit('POST', request);

            server = 'POST';
            log.debug('SERVICIO: ', server);
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
            log.debug('PUT', request);
            let internalid2 = 0;
            let idexterno = request.cliente_id_externo;
            server = 'PUT';
            log.debug('SERVICIO: ', server);

            log.debug('id externo: ', idexterno);

            search.create({
                type: "customer",
                filters:
                    [
                        ["externalid", "is", idexterno]
                    ],
                columns:
                    [
                        search.createColumn({ name: "internalid", label: "Internal ID" })
                    ]
            }).run().each(function (element) {
                let internalid = element.getValue({ name: 'internalid' });
                internalid2 = internalid;

                return true;
            })




            log.debug('internalid:', internalid2);

            try {
                let fixed_request = JSON.parse(JSON.stringify(request));
                if (internalid2 != 0) {
                    log.debug('EN EL PUT', '');
                    createOrUpdateCustomer(fixed_request, internalid2);
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
        const createOrUpdateCustomer = (fixed_request, internalid2, server) => {
            let obj2create = {};
            let contactarr = [];

            let subsi = 1;
            switch (fixed_request.subsidiaria_principal) {
                case 'Parent Company':
                    subsi = 1
                    break;
                case 'SKANDIA ASISTENCIA':
                    subsi = 4
                    break;
                case 'SKANDIA LIFE':
                    subsi = 3
                    break;
                case 'SKANDIA INMUEBLES':
                    subsi = 6
                    break;
                case 'SKANDIA OPERADORA':
                    subsi = 2
                    break;
                case 'SKANDIA SERVICIOS':
                    subsi = 7
                    break;
                case 'SUBSIDIARIA DE ELIMINACIÓN':
                    subsi = 11
                    break;
            }


            if (internalid2 && internalid2 != 0) {
                log.debug('internalid2: ', internalid2);
                const objContact = fixed_request.contact;
                let internalid_contact = 0;
                log.debug('obj', objContact)
                objContact.forEach(function (index) {

                    search.create({
                        type: "contact",
                        filters:
                            [
                                ["externalid", "is", index.id_contact_externo]
                            ],
                        columns:
                            [
                                search.createColumn({ name: "internalid", label: "Internal ID" })
                            ]
                    }).run().each(function (element) {
                        internalid_contact2 = element.getValue({ name: 'internalid' });
                        internalid_contact = internalid_contact2;

                        return true;
                    })

                    log.debug('internalid contact: ', internalid_contact);

                    var objRecord = record.load({
                        type: record.Type.CONTACT,
                        id: internalid_contact,
                        isDynamic: true
                    });

                    objRecord.setValue({
                        fieldId: 'entityid',
                        value: index.nombre_contacto,
                    }).setValue({
                        fieldId: 'email',
                        value: index.email_contacto
                    }).setValue({
                        fieldId: 'phone',
                        value: index.celular_contacto
                    }).setValue({
                        fieldId: 'title',
                        value: index.puesto_contacto
                    }).setValue({
                        fieldId: 'contactrole',
                        value: index.rol
                    }).setValue({
                        fieldId: 'mobilephone',
                        value: index.celular_contacto
                    }).setValue({
                        fieldId: 'subsidiary',
                        value: subsi
                    }).setValue({
                        fieldId: 'externalid',
                        value: index.id_contact_externo
                    })

                    let id_contacto = objRecord.save({
                        ignoreMandatoryFields: true
                    });


                    contactarr.push({
                        contacto: index.nombre_contacto,
                        id_contact: id_contacto,
                        id_contact_externo: index.id_contact_externo
                    });


                })

                fixed_request.contact = [{}];

            }

            log.debug('fixed request vacio', fixed_request.contact);





            if (fixed_request.isperson == true) {
                fixed_request.isperson = "T"
            } else if (fixed_request.isperson == false) {
                fixed_request.isperson = "F"
            }
            let salespre = '';
            for (let k = 0; k < fixed_request.salesteams.length; k++) {
                if (fixed_request.salesteams[k].representante_principal) {
                    log.debug('en el if','SI HAY REPRESENTANTE PRIMARIO')
                    let employeeSearchObj = search.create({
                        type: "employee",
                        filters:
                            [
                                ["externalidstring", "is", fixed_request.salesteams[k].empleado_id]
                            ],
                        columns:
                            [
                                search_empleado = search.createColumn({ name: "internalid", label: "Internal ID" })
                            ]
                    });
                    let searchResultCount = employeeSearchObj.runPaged().count;
                    employeeSearchObj.run().each(function (result) {
                        empleadoInternalid = result.getValue(search_empleado);
                        return true;
                    });
                    salespre = empleadoInternalid
                }
            }

            log.debug('representate principal', salespre);

            let user_data2 = {
                internalid: internalid2,
                cliente_tipo: fixed_request.cliente_tipo,
                externalid: fixed_request.cliente_id_externo,
                companyname: fixed_request.companyname,
                isperson: fixed_request.isperson,
                firstname: fixed_request.firstname,
                middlename: fixed_request.middlename,
                lastname: fixed_request.lastname,
                custentity_skan_fecha_nacimiento: fixed_request.fecha_nacimiento,
                custentity_skan_genero: fixed_request.genero,
                custentity_skan_nacionalidad: fixed_request.nacionalidad,
                category: fixed_request.category,
                parent: fixed_request.parent,
                entitystatus: fixed_request.entitystatus,
                url: fixed_request.url,
                defaultorderpriority: fixed_request.defaultorderpriority,
                email: fixed_request.email,
                phone: fixed_request.phone,
                altphone: fixed_request.alternative_phone,
                fax: fixed_request.fax,
                custentity_mx_rfc: fixed_request.rfc,
                representingSubsidiary: fixed_request.representingSubsidiary,
                subsidiary: subsi,
                salesrep: salespre,
                currency: fixed_request.currency,
                creditlimit: fixed_request.creditlimit,
                pricelevel: fixed_request.pricelevel,
                custentity2: fixed_request.departamento,
                custentity1: fixed_request.ubicacion,
                custentity3: fixed_request.clase,
                receivablesaccount: fixed_request.cuenta,
                terms: fixed_request.terms,
                custentity_psg_ei_auto_select_temp_sm: fixed_request.documento_template,
                custentity_psg_ei_entity_edoc_standard: fixed_request.pack,
                custentity_edoc_gen_trans_pdf: fixed_request.generar_pdf,
                custentity_mx_rfc: fixed_request.rfc.rfc,

                taxregistration: [{
                    address: fixed_request.rfc.address_id,
                    custpage_taxnumbervalidation_name: fixed_request.rfc.nombre,
                    nexuscountry: fixed_request.rfc.country,
                    nexusstate: fixed_request.rfc.state,
                    taxregistrationnumber: fixed_request.rfc.rfc,
                }]


            }
            log.debug('line: ', '457');
            log.debug('SERVICIOS', server)
            //log.debug('id: ', fixed_request.internalid);
            var user_data = {};
            let addressObj = { addressbook: [] }

            //let subsidiaryObj = { submachine: [] }
            //let subsidiaryObj = {subsidiary: fixed_request.subsidiary}
            if (!internalid2) {


                //#region creacion del salesteam
                let salesObj = { salesteam: [] };
                let sales_data = {};
                log.debug('sales lines:', fixed_request.salesteams.length);

                for (let k = 0; k < fixed_request.salesteams.length; k++) {

                    let employeeSearchObj = search.create({
                        type: "employee",
                        filters:
                            [
                                ["externalidstring", "is", fixed_request.salesteams[k].empleado_id]
                            ],
                        columns:
                            [
                                search_empleado = search.createColumn({ name: "internalid", label: "Internal ID" })
                            ]
                    });
                    let searchResultCount = employeeSearchObj.runPaged().count;
                    employeeSearchObj.run().each(function (result) {
                        empleadoInternalid = result.getValue(search_empleado);
                        return true;
                    });


                    salesObj.salesteam.push({
                        employee: empleadoInternalid,
                        contribution: fixed_request.salesteams[k].contribucion,
                        isprimary: fixed_request.salesteams[k].representate_principal,
                        issalesrep: fixed_request.salesteams[k].representate_principal,
                        salesrole: -2
                    });

                    sales_data = Object.assign(salesObj);

                }

                log.debug('sales data', sales_data);

                //#endregion

                //#region creacion de las subsidiarias
                let subsidiaryObj = { submachine: [] };
                let subsidiary_data = {};
                let subsidiaria2 = '';
                for (let l = 0; l < fixed_request.subsidiarias.length; l++) {

                    switch (fixed_request.subsidiarias[l].subsidiary) {
                        case 'Parent Company':
                            subsidiaria2 = 1
                            break;
                        case 'SKANDIA ASISTENCIA':
                            subsidiaria2 = 4
                            break;
                        case 'SKANDIA LIFE':
                            subsidiaria2 = 3
                            break;
                        case 'SKANDIA INMUEBLES':
                            subsidiaria2 = 6
                            break;
                        case 'SKANDIA OPERADORA':
                            subsidiaria2 = 2
                            break;
                        case 'SKANDIA SERVICIOS':
                            subsidiaria2 = 7
                            break;
                        case 'SUBSIDIARIA DE ELIMINACIÓN':
                            subsidiaria2 = 11
                            break;

                        default:
                            break;
                    }

                    subsidiaryObj.submachine.push({
                        subsidiary: subsidiaria2,
                        isprimesub: fixed_request.subsidiarias[l].isprimesub,
                        issubinactive: fixed_request.subsidiarias[l].issubinactive,
                    });
                    subsidiary_data = Object.assign(subsidiaryObj);
                }

                //#endregion

                //#region creacion de los domicilios
                try {

                    log.debug('adentro del trycatch', '');

                    var address_data = {};
                    log.debug('a', fixed_request.addressbook.length);

                    for (let j = 0; j < fixed_request.addressbook.length; j++) {


                        addressObj.addressbook.push({

                            // defaultbilling: fixed_request.addressbook[j].defaultbilling,
                            // defaultshipping: fixed_request.addressbook[j].defaultshipping,
                            label: fixed_request.addressbook[j].label_address,
                            addressbookaddress: {
                                //address: fixed_request.addressbook[j].addressbookaddress.id,
                                addr3: fixed_request.addressbook[j].addressbookaddress.id_domicilio_externo,
                                addressee: fixed_request.addressbook[j].addressbookaddress.addresse,
                                attention: fixed_request.addressbook[j].addressbookaddress.attention,
                                country: fixed_request.addressbook[j].addressbookaddress.pais,
                                defaultbilling: fixed_request.addressbook[j].addressbookaddress.defaultbilling,
                                defaultshipping: fixed_request.addressbook[j].addressbookaddress.defaultshipping,
                                addrphone: fixed_request.addressbook[j].addressbookaddress.address_phone,
                                custrecord_streettype: fixed_request.addressbook[j].addressbookaddress.tipo_calle,
                                custrecord_streetname: fixed_request.addressbook[j].addressbookaddress.nombre_calle,
                                custrecord_streetnum: fixed_request.addressbook[j].addressbookaddress.numero_exterior,
                                custrecord_locality: fixed_request.addressbook[j].addressbookaddress.municipio,
                                city: fixed_request.addressbook[j].addressbookaddress.ciudad,
                                state: fixed_request.addressbook[j].addressbookaddress.estado,
                                zip: fixed_request.addressbook[j].addressbookaddress.codigo_postal,
                            }
                        });
                        address_data = Object.assign(addressObj);
                        log.debug('SETEANDO VALORES DIRECCION', '-----------------');
                        log.debug('data', address_data);

                    }

                    log.debug('linea', '411');
                    user_data = Object.assign(user_data2, address_data, sales_data, subsidiary_data);



                } catch (error) {
                    log.debug('error direcciones', error);
                }
                //#endregion

            } else {

                let clienteObj = record.load({
                    type: record.Type.CUSTOMER,
                    id: internalid2,
                    isDynamic: true,
                })



                //#region update de los domicilios
                let addresLines = clienteObj.getLineCount({ sublistId: 'addressbook' });
                log.debug('total lines: ', addresLines);

                var address_data = {};
                log.debug('address length', fixed_request.addressbook.length)


                for (let j = 0; j < fixed_request.addressbook.length; j++) {

                    if (addresLines > 0) {
                        for (let index = 0; index < addresLines; index++) {

                            let id_direccion = clienteObj.getSublistValue({ sublistId: 'addressbook', fieldId: 'internalid', line: index })
                            let id_direccion_Ex = clienteObj.getSublistValue({ sublistId: 'addressbook', fieldId: 'addr3_initialvalue', line: index });
                            //let id2 = clienteObj.getSublistValue({ sublistId: 'addressbook', fieldId: 'addressbookaddress', line: index });
                            log.debug('id direccion externo:', id_direccion_Ex);
                            log.debug('id direccion:', id_direccion);


                            if (id_direccion_Ex == fixed_request.addressbook[j].addressbookaddress.id_domicilio_externo) {

                                log.debug('id direccion request :', fixed_request.addressbook[j].addressbookaddress.id_domicilio_externo);
                                addressObj.addressbook.push({

                                    // defaultbilling: fixed_request.addressbook[j].defaultbilling,
                                    // defaultshipping: fixed_request.addressbook[j].defaultshipping,
                                    label: fixed_request.addressbook[j].label_address,
                                    addressid: id_direccion,
                                    addressbookaddress: {
                                        address: id_direccion,
                                        attention: fixed_request.addressbook[j].addressbookaddress.attention,
                                        country: fixed_request.addressbook[j].addressbookaddress.pais,
                                        defaultbilling: fixed_request.addressbook[j].addressbookaddress.defaultbilling,
                                        defaultshipping: fixed_request.addressbook[j].addressbookaddress.defaultshipping,
                                        addrphone: fixed_request.addressbook[j].addressbookaddress.address_phone,
                                        custrecord_streettype: fixed_request.addressbook[j].addressbookaddress.tipo_calle,
                                        custrecord_streetname: fixed_request.addressbook[j].addressbookaddress.nombre_calle,
                                        custrecord_streetnum: fixed_request.addressbook[j].addressbookaddress.numero_exterior,
                                        custrecord_locality: fixed_request.addressbook[j].addressbookaddress.municipio,
                                        city: fixed_request.addressbook[j].addressbookaddress.ciudad,
                                        state: fixed_request.addressbook[j].addressbookaddress.estado,
                                        zip: fixed_request.addressbook[j].addressbookaddress.codigo_postal,
                                    }
                                });
                                address_data = Object.assign(addressObj);

                            }


                        }

                    }


                }

                //#endregion

                //#region update subsidiaries

                let subsidiaryLines = clienteObj.getLineCount({ sublistId: 'submachine' });
                log.debug('total lines: ', subsidiaryLines);

                let subsidiaryObj = { submachine: [] };
                let subsidiary_data = {};
                let subsidiaria3 = '';
                for (let l = 0; l < fixed_request.subsidiarias.length; l++) {

                    switch (fixed_request.subsidiarias[l].subsidiary) {
                        case 'Parent Company':
                            subsidiaria3 = 1
                            break;
                        case 'SKANDIA ASISTENCIA':
                            subsidiaria3 = 4
                            break;
                        case 'SKANDIA LIFE':
                            subsidiaria3 = 3
                            break;
                        case 'SKANDIA INMUEBLES':
                            subsidiaria3 = 6
                            break;
                        case 'SKANDIA OPERADORA':
                            subsidiaria3 = 2
                            break;
                        case 'SKANDIA SERVICIOS':
                            subsidiaria3 = 7
                            break;
                        case 'SUBSIDIARIA DE ELIMINACIÓN':
                            subsidiaria3 = 11
                            break;

                        default:
                            break;
                    }

                    if (fixed_request.subsidiarias[l].last_value) {
                        for (let k = 0; k < subsidiaryLines; k++) {

                            let subs = clienteObj.getSublistValue({ sublistId: 'submachine', fieldId: 'subsidiary', line: k });

                            if (fixed_request.subsidiarias[l].last_value && subs == fixed_request.subsidiarias[l].last_value) {

                                log.debug('dentro del if', k);

                                try {

                                    clienteObj.setSublistValue({
                                        sublistId: 'submachine',
                                        fieldId: 'subsidiary',
                                        line: k,
                                        value: subsidiaria3
                                    });

                                    clienteObj.commitLine({
                                        sublistId: 'submachine'
                                    });

                                } catch (e) {
                                    log.debug('error', e);
                                }
                            }

                        }
                    } else {
                        try {

                            log.debug('subsidiaria', subsidiaria3);
                            clienteObj.selectNewLine({
                                sublistId: 'submachine'
                            });

                            clienteObj.setCurrentSublistValue({
                                sublistId: 'submachine',
                                fieldId: 'subsidiary',
                                value: subsidiaria3
                            });

                            clienteObj.commitLine({
                                sublistId: 'submachine'
                            });
                        } catch (e) {
                            log.debug('error: ', e);
                        }
                    }
                }

                clienteObj.save({
                    ignoreMandatoryFields: true
                });

                //#endregion

                //#region update salesteam

                try {
                    let salesObj = { salesteam: [] };
                    let sales_data = {};
                    log.debug('sales lines:', fixed_request.salesteams.length);
                    let saleintdernalid = '';
                    for (let k = 0; k < fixed_request.salesteams.length; k++) {

                        let employeeSearchObj = search.create({
                            type: "employee",
                            filters:
                                [
                                    ["externalidstring", "is", fixed_request.salesteams[k].empleado_id]
                                ],
                            columns:
                                [
                                    search_empleado = search.createColumn({ name: "internalid", label: "Internal ID" })
                                ]
                        });
                        let searchResultCount = employeeSearchObj.runPaged().count;
                        employeeSearchObj.run().each(function (result) {
                            empleadoInternalid = result.getValue(search_empleado);
                            return true;
                        });

                        saleintdernalid = internalid2 +'_'+empleadoInternalid;
                        log.debug('id',saleintdernalid);
                        salesObj.salesteam.push({
                            id: saleintdernalid,
                            employee: empleadoInternalid,
                            contribution: fixed_request.salesteams[k].contribucion,
                            issalesrep: fixed_request.salesteams[k].representate_principal,
                            isprimary: fixed_request.salesteams[k].representate_principal,
                            salesrole: -2
                        });

                        sales_data = Object.assign(salesObj);

                    }
                    user_data = Object.assign(user_data2, address_data,sales_data);
                    log.debug('sales data', sales_data);
                } catch (error) {
                    log.debug('error salesrep', error);
                }
                //#endregion




                

            }



            log.debug('linea', '568');

            if (fixed_request.isprimesub == true) {
                fixed_request.isprimesub = "T"
            } else if (fixed_request.isprimesub == false) {
                fixed_request.isprimesub = "F"
            }


            //fixed_request['custentity_fa_created_from'] = runtime.getCurrentScript().id;

            if (internalid2) { obj2create["id"] = internalid2; }
            obj2create['recordType'] = record.Type.CUSTOMER;
            obj2create['isDynamic'] = true;
            obj2create['ignoreMandatoryFields'] = true;
            //Parsear los datos
            let parseTest = JSON.parse(JSON.stringify(user_data));
            obj2create['values'] = parseTest;

            let submit = jsimport.submitFieldsJS(obj2create);
            let objCustomer = record.load({ type: record.Type.CUSTOMER, id: submit.recordId, isDynamic: true });
            let totalLines = objCustomer.getLineCount({ sublistId: 'addressbook' });
            //let idcontact = objCustomer.getValue({fieldId: 'contact'});
            let idexterno = objCustomer.getValue({ fieldId: 'externalid' });


            log.debug('linea', '594');

            log.debug('serverrrr', internalid2);
            if (!internalid2) {
                const objContact = fixed_request.contact;
                log.debug('datos del contactio', objContact);
                let subsi2 = 1;
                switch (fixed_request.subsidiaria_principal) {
                    case 'Parent Company':
                        subsi2 = 1
                        break;
                    case 'SKANDIA ASISTENCIA':
                        subsi2 = 4
                        break;
                    case 'SKANDIA LIFE':
                        subsi2 = 3
                        break;
                    case 'SKANDIA INMUEBLES':
                        subsi2 = 6
                        break;
                    case 'SKANDIA OPERADORA':
                        subsi2 = 2
                        break;
                    case 'SKANDIA SERVICIOS':
                        subsi2 = 7
                        break;
                    case 'SUBSIDIARIA DE ELIMINACIÓN':
                        subsi2 = 11
                        break;

                    default:
                        break;
                }

                objContact.forEach(function (index) {


                    let objRecord = record.create({
                        type: record.Type.CONTACT,
                        isDynamic: true
                    });

                    log.debug('linea', '616')

                    objRecord.setValue({
                        fieldId: 'entityid',
                        value: index.nombre_contacto,
                    }).setValue({
                        fieldId: 'email',
                        value: index.email_contacto
                    }).setValue({
                        fieldId: 'phone',
                        value: index.celular_contacto
                    }).setValue({
                        fieldId: 'title',
                        value: index.puesto_contacto
                    }).setValue({
                        fieldId: 'contactrole',
                        value: index.rol
                    }).setValue({
                        fieldId: 'mobilephone',
                        value: index.celular_contacto
                    }).setValue({
                        fieldId: 'subsidiary',
                        value: subsi2
                    }).setValue({
                        fieldId: 'externalid',
                        value: index.id_contact_externo
                    }).setValue({
                        fieldId: 'company',
                        value: submit.recordId
                    })

                    let id_contacto = objRecord.save({
                        ignoreMandatoryFields: true
                    });

                    contactarr.push({
                        contacto: index.nombre_contacto,
                        id_contact: id_contacto,
                        id_contaxt_externo: index.id_contact_externo
                    });
                });

            }

            log.debug('contactossss:', contactarr);
            let externalid = 0;



            //let contactlines = objCustomer.getLineCount({ sublistId: 'contactroles' });

            log.debug('total lines: ', totalLines);


            response.result = {
                //cliente: objCustomer.getValue({fieldId: 'companyname'}),
                clienteid: submit.recordId,

                direcciones: [],
                contactos: contactarr
            };

            //response.result.contactos.push(arrcontact);

            if (totalLines > 0) {
                for (let index = 0; index < totalLines; index++) {

                    response.result.direcciones.push({
                        direccion: objCustomer.getSublistValue({ sublistId: 'addressbook', fieldId: 'label', line: index }),
                        id_direccion: objCustomer.getSublistValue({ sublistId: 'addressbook', fieldId: 'internalid', line: index })
                    })
                }
            }

            response.message = submit.msg;
        }
        return entry_point;
    });