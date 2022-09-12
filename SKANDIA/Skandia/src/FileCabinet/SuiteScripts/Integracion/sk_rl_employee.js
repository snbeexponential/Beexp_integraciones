/**
 * @author Evelyn Sarmiento Cámbara<>
 * @Modificacion <>
 * @Name sk_rl_employee.js
 * @description Script para la importacion/exportacion de Empleados
 * @file  <URL PENDIENTE>
 * @NApiVersion 2.1
 * @NScriptType Restlet
 */

define([
    'N/log',
    'N/record',
    'N/runtime',
    "N/search",
    "N/format"
],
    function (log, record, runtime, search, format) {

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

        let supervisor_id = '';

        //Consulta del cliente por numero de id interno
        entry_point.get = function (request) {
            return 'h2'
        }

        //Creación del empleado
        entry_point.post = function (request) {
            log.audit('POST', request);
            let fixed_request = JSON.parse(JSON.stringify(request));
            log.debug('request', fixed_request);



            try {
                let subsi = 1;
                switch (fixed_request.subsidiary) {
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

                    default:
                        break;
                }

                let employetype = 1;
                switch (fixed_request.employeetype) {
                    case "FP":
                        employetype = 17
                        break;
                    case "Propietario":
                        employetype = 2
                        break;
                    case "Funcionario":
                        employetype = 1
                        break;
                    case "Exento":
                        employetype = 6
                        break;
                    case "Empleado regular":
                        employetype = 3
                        break;
                    case "Empleado estatuario":
                        employetype = 4
                        break;
                    case "Contratista":
                        employetype = 5
                        break;
                    case "Agente":
                        employetype = 16
                        break;
                }

                let employeeSearchObj = search.create({
                    type: "employee",
                    filters:
                        [
                            ["externalidstring", "is", fixed_request.supervisor]
                        ],
                    columns:
                        [
                            search_idsupervisor = search.createColumn({ name: "internalid", label: "Internal ID" })
                        ]
                });
                var searchResultCount = employeeSearchObj.runPaged().count;
                employeeSearchObj.run().each(function (result) {
                    supervisor_id = result.getValue(search_idsupervisor)
                    return true;
                });

                log.debug('supervisor', supervisor_id)

                let empRecord = record.create({
                    type: record.Type.EMPLOYEE,
                    isDynamic: true
                }).setValue({
                    fieldId: 'autoname',
                    value: false
                }).setValue({
                    fieldId: 'entityid',
                    value: fixed_request.entityId
                }).setValue({
                    fieldId: 'externalid',
                    value: fixed_request.externalid_employee
                }).setValue({
                    fieldId: 'isinactive',
                    value: fixed_request.isInactive
                }).setValue({
                    fieldId: 'firstname',
                    value: fixed_request.firstname
                }).setValue({
                    fieldId: 'lastname',
                    value: fixed_request.lastname
                }).setValue({
                    fieldId: 'email',
                    value: fixed_request.email
                }).setValue({
                    fieldId: 'phone',
                    value: fixed_request.phone
                }).setValue({
                    fieldId: 'subsidiary',
                    value: subsi
                }).setValue({
                    fieldId: 'employeetype',
                    value: employetype
                }).setValue({
                    fieldId: 'supervisor',
                    value: supervisor_id
                }).setValue({
                    fieldId: 'issalesrep',
                    value: fixed_request.isSalesRep
                }).setValue({
                    fieldId: 'giveaccess',
                    value: fixed_request.giveaccess_sendemail
                }).setText({
                    fieldId: 'mlrole',
                    value: fixed_request.role
                }).setValue({
                    fieldId: 'socialsecuritynumber',
                    value: fixed_request.social_security_number
                }).setValue({
                    fieldId: 'birthdate',
                    value: fixed_request.birth_date
                }).setText({
                    fieldId: 'employeestatus',
                    value: fixed_request.employee_status
                }).setValue({
                    fieldId: 'hiredate',
                    value: fixed_request.hire_date
                }).setValue({
                    fieldId: 'releasedate',
                    value: fixed_request.termination_release_date
                }).setValue({
                    fieldId: 'jobdescription',
                    value: fixed_request.job_description
                }).setText({
                    fieldId: 'gender',
                    value: fixed_request.gender
                }).setText({
                    fieldId: 'currency',
                    value: fixed_request.currency
                }).setText({
                    fieldId: 'departament',
                    value: fixed_request.departament
                }).setText({
                    fieldId: 'location',
                    value: fixed_request.location
                }).setValue({
                    fieldId: 'comments',
                    value: fixed_request.notes
                }).setValue({
                    fieldId: 'title',
                    value: fixed_request.job_title
                }).setValue({
                    fieldId: 'defaultexpensereportcurrency',
                    value: 1
                });

                let address = fixed_request.addressbook;
                log.debug('direccion', address);

                address.forEach(element => {

                    // let subrec = empRecord.getCurrentSublistSubrecord({
                    //     sublistId: 'addressbook',
                    //     fieldId: 'addressbookaddress',
                    // });

                    let subrec = empRecord.getCurrentSublistSubrecord({
                        sublistId: 'addressbook',
                        fieldId: 'addressbookaddress'
                    });

                    //log.debug('subrec', subrec);

                    empRecord.selectNewLine({
                        sublistId: 'addressbook'
                    });

                    subrec.setValue({
                        fieldId: 'country',
                        value: element.addressbookaddress.pais
                    }).setValue({
                        fieldId: 'state',
                        value: element.addressbookaddress.estado
                    }).setValue({
                        fieldId: 'city',
                        value: element.addressbookaddress.ciudad
                    }).setValue({
                        fieldId: 'custrecord_village',
                        value: element.addressbookaddress.municipio
                    }).setValue({
                        fieldId: 'custrecord_streettype',
                        value: element.addressbookaddress.tipo_calle
                    }).setValue({
                        fieldId: 'custrecord_streetname',
                        value: element.addressbookaddress.nombre_calle
                    }).setValue({
                        fieldId: 'custrecord_streetnum',
                        value: element.addressbookaddress.numero_exterior
                    }).setValue({
                        fieldId: 'custrecord_unit',
                        value: element.addressbookaddress.numero_piso
                    }).setValue({
                        fieldId: 'custrecord_colonia',
                        value: element.addressbookaddress.colonia
                    }).setValue({
                        fieldId: 'zip',
                        value: element.addressbookaddress.codigo_postal
                    }).setValue({
                        fieldId: 'phone',
                        value: element.addressbookaddress.address_phone
                    }).setValue({
                        fieldId: 'departament',
                        value: element.addressbookaddress.departamento
                    }).setValue({
                        fieldId: 'custrecord_id_externo_domicilio',
                        value: element.addressbookaddress.id_domicilio_externo
                    }).setValue({
                        fieldId: 'addresse',
                        value: element.addressbookaddress.addresse
                    }).setValue({
                        fieldId: 'defaultbilling',
                        value: element.addressbookaddress.defaultbilling
                    }).setValue({
                        fieldId: 'cdefaultshipping',
                        value: element.addressbookaddress.defaultshipping
                    }).setValue({
                        fieldId: 'attention',
                        value: element.addressbookaddress.attention
                    });

                    // subrec.commit();

                    empRecord.commitLine({
                        sublistId: 'addressbook'
                    })



                });



                let employeeid = empRecord.save({
                    ignoreMandatoryFields: true
                });


                response.result = {
                    //cliente: objCustomer.getValue({fieldId: 'companyname'}),
                    employeeid: employeeid,

                    direcciones: [],

                };



            } catch (error) {
                log.error('entry_point.post ERROR', error);
                response.code = 400;
                response.message = error.message;
            }
            return response;
        }

        entry_point.put = (request) => {
            log.debug('PUT', request);
            let fixed_request = JSON.parse(JSON.stringify(request));

            let employetype = 0;
            switch (fixed_request.employeetype) {
                case "FP":
                    employetype = 17
                    break;
                case "Propietario":
                    employetype = 2
                    break;
                case "Funcionario":
                    employetype = 1
                    break;
                case "Exento":
                    employetype = 6
                    break;
                case "Empleado regular":
                    employetype = 3
                    break;
                case "Empleado estatuario":
                    employetype = 4
                    break;
                case "Contratista":
                    employetype = 5
                    break;
                case "Agente":
                    employetype = 16
                    break;
            }

            let subsi = 1;
            switch (fixed_request.subsidiary) {
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

                default:
                    break;
            }

            let idexterno = fixed_request.externalid_employee;
            let internalid2 = '';

            search.create({
                type: "employee",
                filters:
                    [
                        ["entityid", "is", idexterno]
                    ],
                columns:
                    [
                        search.createColumn({ name: "internalid", label: "Internal ID" })
                    ]
            }).run().each(function (element) {
                let internalid = element.getValue({ name: 'internalid' });
                internalid2 = internalid;


                return true;
            });

            let employeeSearchObj = search.create({
                type: "employee",
                filters:
                    [
                        ["externalidstring", "is", fixed_request.supervisor]
                    ],
                columns:
                    [
                        search_idsupervisor = search.createColumn({ name: "internalid", label: "Internal ID" })
                    ]
            });
            var searchResultCount = employeeSearchObj.runPaged().count;
            employeeSearchObj.run().each(function (result) {
                supervisor_id = result.getValue(search_idsupervisor)
                return true;
            });


            log.debug('id:', internalid2);
            let empRecord = record.load({
                type: record.Type.EMPLOYEE,
                id: internalid2,
                isDynamic: true,
            }).setValue({
                fieldId: 'autoname',
                value: false
            }).setValue({
                fieldId: 'entityid',
                value: fixed_request.entityId
            }).setValue({
                fieldId: 'externalid',
                value: fixed_request.externalid_employee
            }).setValue({
                fieldId: 'isinactive',
                value: fixed_request.isInactive
            }).setValue({
                fieldId: 'firstname',
                value: fixed_request.firstname
            }).setValue({
                fieldId: 'lastname',
                value: fixed_request.lastname
            }).setValue({
                fieldId: 'email',
                value: fixed_request.email
            }).setValue({
                fieldId: 'phone',
                value: fixed_request.phone
            }).setValue({
                fieldId: 'subsidiary',
                value: subsi
            }).setValue({
                fieldId: 'employeetype',
                value: employetype
            }).setValue({
                fieldId: 'supervisor',
                value: supervisor_id
            }).setValue({
                fieldId: 'issalesrep',
                value: fixed_request.isSalesRep
            }).setValue({
                fieldId: 'giveaccess',
                value: fixed_request.giveaccess_sendemail
            }).setText({
                fieldId: 'mlrole',
                value: fixed_request.role
            }).setValue({
                fieldId: 'socialsecuritynumber',
                value: fixed_request.social_security_number
            }).setValue({
                fieldId: 'birthdate',
                value: fixed_request.birth_date
            }).setText({
                fieldId: 'employeestatus',
                value: fixed_request.employee_status
            }).setValue({
                fieldId: 'hiredate',
                value: fixed_request.hire_date
            }).setValue({
                fieldId: 'releasedate',
                value: fixed_request.termination_release_date
            }).setValue({
                fieldId: 'jobdescription',
                value: fixed_request.job_description
            }).setText({
                fieldId: 'gender',
                value: fixed_request.gender
            }).setText({
                fieldId: 'currency',
                value: fixed_request.currency
            }).setText({
                fieldId: 'departament',
                value: fixed_request.departament
            }).setText({
                fieldId: 'location',
                value: fixed_request.location
            }).setValue({
                fieldId: 'comments',
                value: fixed_request.notes
            }).setValue({
                fieldId: 'title',
                value: fixed_request.job_title
            }).setValue({
                fieldId: 'defaultexpensereportcurrency',
                value: 1
            });

            let direccion = [];
            let address = fixed_request.addressbook;
            address.forEach(element => {

                // let subrec = empRecord.getCurrentSublistSubrecord({
                //     sublistId: 'addressbook',
                //     fieldId: 'addressbookaddress',
                // });

                let numLines = empRecord.getLineCount({
                    sublistId: 'addressbook'
                });

                let subrec = empRecord.getCurrentSublistSubrecord({
                    sublistId: 'addressbook',
                    fieldId: 'addressbookaddress'
                });

                for (let i = 0; i < numLines; i++) {

                    let id_ext = subrec.getValue({
                        fieldId: 'custrecord_id_externo_domicilio'
                    });
                    let id_address = subrec.getValue({
                        fieldId: 'internalid'
                    });

                    direccion.push({
                        id: id_address,
                        id_direccion_externo: id_ext
                    });

                    if (id_ext === element.addressbookaddress.id_domicilio_externo) {
                        log.debug('subrec', subrec);

                        empRecord.selectLine({
                            sublistId: 'addressbook',
                            line: i
                        });

                        subrec.setValue({
                            fieldId: 'country',
                            value: element.addressbookaddress.pais
                        }).setValue({
                            fieldId: 'state',
                            value: element.addressbookaddress.estado
                        }).setValue({
                            fieldId: 'city',
                            value: element.addressbookaddress.ciudad
                        }).setValue({
                            fieldId: 'custrecord_village',
                            value: element.addressbookaddress.municipio
                        }).setValue({
                            fieldId: 'custrecord_streettype',
                            value: element.addressbookaddress.tipo_calle
                        }).setValue({
                            fieldId: 'custrecord_streetname',
                            value: element.addressbookaddress.nombre_calle
                        }).setValue({
                            fieldId: 'custrecord_streetnum',
                            value: element.addressbookaddress.numero_exterior
                        }).setValue({
                            fieldId: 'custrecord_unit',
                            value: element.addressbookaddress.numero_piso
                        }).setValue({
                            fieldId: 'custrecord_colonia',
                            value: element.addressbookaddress.colonia
                        }).setValue({
                            fieldId: 'zip',
                            value: element.addressbookaddress.codigo_postal
                        }).setValue({
                            fieldId: 'phone',
                            value: element.addressbookaddress.address_phone
                        }).setValue({
                            fieldId: 'departament',
                            value: element.addressbookaddress.departamento
                        }).setValue({
                            fieldId: 'custrecord_id_externo_domicilio',
                            value: element.addressbookaddress.id_domicilio_externo
                        }).setValue({
                            fieldId: 'addresse',
                            value: element.addressbookaddress.addresse
                        }).setValue({
                            fieldId: 'defaultbilling',
                            value: element.addressbookaddress.defaultbilling
                        }).setValue({
                            fieldId: 'cdefaultshipping',
                            value: element.addressbookaddress.defaultshipping
                        }).setValue({
                            fieldId: 'attention',
                            value: element.addressbookaddress.attention
                        });

                        // subrec.commit();

                        empRecord.commitLine({
                            sublistId: 'addressbook'
                        })

                    } else {
                        empRecord.selectNewLine({
                            sublistId: 'addressbook'
                        });

                        subrec.setValue({
                            fieldId: 'country',
                            value: element.addressbookaddress.pais
                        }).setValue({
                            fieldId: 'state',
                            value: element.addressbookaddress.estado
                        }).setValue({
                            fieldId: 'city',
                            value: element.addressbookaddress.ciudad
                        }).setValue({
                            fieldId: 'custrecord_village',
                            value: element.addressbookaddress.municipio
                        }).setValue({
                            fieldId: 'custrecord_streettype',
                            value: element.addressbookaddress.tipo_calle
                        }).setValue({
                            fieldId: 'custrecord_streetname',
                            value: element.addressbookaddress.nombre_calle
                        }).setValue({
                            fieldId: 'custrecord_streetnum',
                            value: element.addressbookaddress.numero_exterior
                        }).setValue({
                            fieldId: 'custrecord_unit',
                            value: element.addressbookaddress.numero_piso
                        }).setValue({
                            fieldId: 'custrecord_colonia',
                            value: element.addressbookaddress.colonia
                        }).setValue({
                            fieldId: 'zip',
                            value: element.addressbookaddress.codigo_postal
                        }).setValue({
                            fieldId: 'phone',
                            value: element.addressbookaddress.address_phone
                        }).setValue({
                            fieldId: 'departament',
                            value: element.addressbookaddress.departamento
                        }).setValue({
                            fieldId: 'custrecord_id_externo_domicilio',
                            value: element.addressbookaddress.id_domicilio_externo
                        }).setValue({
                            fieldId: 'addresse',
                            value: element.addressbookaddress.addresse
                        }).setValue({
                            fieldId: 'defaultbilling',
                            value: element.addressbookaddress.defaultbilling
                        }).setValue({
                            fieldId: 'cdefaultshipping',
                            value: element.addressbookaddress.defaultshipping
                        }).setValue({
                            fieldId: 'attention',
                            value: element.addressbookaddress.attention
                        });

                        // subrec.commit();

                        empRecord.commitLine({
                            sublistId: 'addressbook'
                        })
                    }


                }







            });


            let employeeid = empRecord.save({
                ignoreMandatoryFields: true
            });




            response.result = {
                //cliente: objCustomer.getValue({fieldId: 'companyname'}),
                employee: employeeid,
                externalid_employee: fixed_request.externalid_employee,

                direcciones: direccion,

            };

            return response;
        }

        return entry_point;
    });