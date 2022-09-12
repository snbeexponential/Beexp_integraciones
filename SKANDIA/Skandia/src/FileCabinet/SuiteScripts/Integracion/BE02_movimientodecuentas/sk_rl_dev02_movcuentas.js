/**
 * @author saul.navarro@beexponential.com.mx
 * @Name sk_rl_dev02_movcuentas.js
 * @description Integración 1 de movimiento de cuentas
 * @NApiVersion 2.1
 * @NScriptType Restlet
 * @NAmdConfig ../../excel_module/sk_sc_excel_conf.json
 */


define(['N/record', 'N/search', 'N/file', "xlsx", "N/util", "N/format"], function (record, search, file, XLSX, util, format) {

    const response = {
        code: 200,
        message: "",
        result: []
    };
    let clienteid = '';
    let departamentid = '';
    let classid = '';
    let locationid = '';
    let discountid = '';
    let itemid = '';
    let contratoid = '';
    let satcode = '';
    let unitid = '';
    let invoiceid = ''
    //Funcion que crea un nuevo registro <CUSTOMER> a partir de los parametros de la solicitud
    function get(contexturl) {
        var id = contexturl.id
        /* var f = file.load({id:"SuiteScripts/Integracion/BE02_movimientodecuentas/invoicetemplate/InvoiceTemplateOperadora_1.xlsx"}); */
        var obejson = excelFileToJson(id)

        var numinv = 0

        obejson[0].forEach(element => {
            if (element.externalid) {
                numinv++
            }
        });

        var arreglimto = []
        for (let i = 0; i < numinv; i++) {
            arreglimto.push({
                cabecera: {},
                lines: []
            })
        }
        var flag1 = 0
        obejson[0].forEach(element => {
            if (element.externalid && flag1 < numinv) {
                arreglimto[flag1].cabecera = {
                    externalid: element.externalid || null,
                    tranId: element.tranId || null,
                    customer: element.customer || null,
                    trandate: element.trandate || null,
                    invoicestatus: element.invoicestatus || null,
                    otherrefnum: element.otherrefnum || null,
                    memo: element.memo || null,
                    salesrep: element.salesrep || null,
                    partner: element.partner || null,
                    department: element.department || null,
                    class: element.class || null,
                    location: element.location || null,
                    discount_discountitem: element.discountItem || null,
                    discount_discountrate: element.discountrate || null
                }
                arreglimto[flag1].lines.push({
                    itemLine_item: element.itemLine_item || null,
                    itemLine_quantity: element.itemLine_quantity || null,
                    itemLine_units: element.itemLine_units || null,
                    itemLine_salesPrice: element.itemLine_salesPrice || null,
                    itemLine_amount: element.itemLine_amount || null,
                    itemLine_description: element.itemLine_description || null,
                    itemLine_isTaxable: element.itemLine_isTaxable || null,
                    itemLine_priceLevel: element.itemLine_priceLevel || null,
                    itemLine_department: element.itemLine_department || null,
                    itemLine_class: element.itemLine_class || null,
                    itemLine_location: element.itemLine_location || null,
                    itemLine_skan_contrato: element.itemLine_skan_contrato || null,
                    terms: element.terms || null
                })
                flag1++
            } else {
                var newindex = flag1 - 1
                arreglimto[newindex].lines.push({
                    itemLine_item: element.itemLine_item || null,
                    itemLine_quantity: element.itemLine_quantity || null,
                    itemLine_units: element.itemLine_units || null,
                    itemLine_salesPrice: element.itemLine_salesPrice || null,
                    itemLine_amount: element.itemLine_amount || null,
                    itemLine_description: element.itemLine_description || null,
                    itemLine_isTaxable: element.itemLine_isTaxable || null,
                    itemLine_priceLevel: element.itemLine_priceLevel || null,
                    itemLine_department: element.itemLine_department || null,
                    itemLine_class: element.itemLine_class || null,
                    itemLine_location: element.itemLine_location || null,
                    itemLine_skan_contrato: element.itemLine_skan_contrato || null,
                    terms: element.terms || null
                })
            }
        });

        //return(arreglimto)

        var arrrinvoice = createInvoice(arreglimto)


        return arrrinvoice
    }


    function post(context) {

        var fileObj = record.create({
            type: record.Type.INVOICE,
            isDynamic: true
        })
        return fileObj

    }

    //Function Area

    function excelFileToJson(fileId, headers) {
        var returnData = [];
        var excelFile = file.load({
            id: fileId
        });

        var workbook = XLSX.read(excelFile.getContents(), { type: 'base64' });
        for (var sn in workbook.SheetNames) {
            var sheet = workbook.Sheets[workbook.SheetNames[sn]];
            returnData.push(isEmpty(headers) || isEmpty(headers[workbook.SheetNames[sn]]) ? XLSX.utils.sheet_to_json(sheet) : XLSX.utils.sheet_to_json(sheet, headers[workbook.SheetNames[sn]]));
        }
        return returnData;
    }

    function createInvoice(arrinv) {
        var cabecera = []
        let objInvoice = {};
        arrinv.forEach(element2 => {
            
            let externalid = element2.cabecera.externalid
            let tranId = element2.cabecera.tranId
            let customer = element2.cabecera.customer
            let trandate = element2.cabecera.trandate
            let invoicestatus = element2.cabecera.invoicestatus
            let otherrefnum = element2.cabecera.otherrefnum
            let memo = element2.cabecera.memo
            let salesrep = element2.cabecera.salesrep
            let partner = element2.cabecera.partner
            let department = element2.cabecera.department
            let inv_class = element2.cabecera.class
            let location = element2.cabecera.location
            let discountItem = element2.cabecera.discount_discountitem
            let discountrate = element2.cabecera.discount_discountrate
            let fechafuncion = transformdate(trandate);

            let customerParseado = customer.toString();
            log.debug('validando', customer)
            if (customer && customer != '') {
                let customerSearchObj = search.create({
                    type: "customer",
                    filters:
                        [
                            ["externalid", "is", customerParseado]
                        ],
                    columns:
                        [
                            search_id = search.createColumn({ name: "internalid", label: "Internal ID" })
                        ]
                });
                var searchResultCount = customerSearchObj.runPaged().count;
                log.debug("customerSearchObj result count", searchResultCount);
                customerSearchObj.run().each(function (result) {

                    clienteid = result.getValue(search_id)
                    log.debug('dentro de la funcion', result.getValue(search_id))
                    return true;
                });

                log.debug('id en netsuite: ', typeof (clienteid));


            } else {
                throw ('No se ha proporcionado el id externo del cliente');
            }

            //#region busqueda department
            var departmentSearchObj = search.create({
                type: "department",
                filters:
                    [
                        ["name", "is", department]
                    ],
                columns:
                    [
                        search_department = search.createColumn({ name: "internalid", label: "Internal ID" })
                    ]
            });
            var searchResultCount = departmentSearchObj.runPaged().count;
            departmentSearchObj.run().each(function (result) {
                departamentid = result.getValue(search_department)
                return true;
            });

            //#endregion

            //#region busqueda clase
            var classificationSearchObj = search.create({
                type: "classification",
                filters:
                    [
                        ["name", "is", inv_class]
                    ],
                columns:
                    [
                        search_class = search.createColumn({ name: "internalid", label: "Internal ID" })
                    ]
            });
            var searchResultCount = classificationSearchObj.runPaged().count;
            log.debug("classificationSearchObj result count", searchResultCount);
            classificationSearchObj.run().each(function (result) {
                classid = result.getValue(search_class);
                return true;
            });
            //#endregion

            //#region busqueda ubicacion
            var locationSearchObj = search.create({
                type: "location",
                filters:
                    [
                        ["name", "is", location]
                    ],
                columns:
                    [
                        search_location = search.createColumn({ name: "internalid", label: "Internal ID" })
                    ]
            });
            var searchResultCount = locationSearchObj.runPaged().count;
            log.debug("locationSearchObj result count", searchResultCount);
            locationSearchObj.run().each(function (result) {
                locationid = result.getValue(search_location);
                return true;
            });
            //#endregion

            //#region busqueda invoice
            if (externalid != '' && externalid != null) {
                var transactionSearchObj = search.create({
                    type: "transaction",
                    filters:
                        [
                            ["recordtype", "is", "Invoice"],
                            "AND",
                            ["mainline", "is", "T"],
                            "AND",
                            ["externalidstring", "is", externalid]
                        ],
                    columns:
                        [
                            search_invoice = search.createColumn({ name: "internalid", label: "Internal ID" })
                        ]
                });
                var searchResultCount = transactionSearchObj.runPaged().count;
                log.debug("transactionSearchObj result count", searchResultCount);
                transactionSearchObj.run().each(function (result) {
                    invoiceid = result.getValue(search_invoice);
                    return true;
                });
            } else {
                throw 'El campo externalid es obligatorio.'
            }
            //#endregion
            log.debug('INVOICE ID', invoiceid)
            if (invoiceid == '') {
                var invObj = record.create({
                    type: record.Type.INVOICE,
                    isDynamic: true
                }).setValue({
                    fieldId: "entity",
                    value: clienteid
                }).setValue({
                    fieldId: "approvalstatus",
                    value: invoicestatus
                }).setValue({
                    fieldId: "trandate",
                    value: fechafuncion
                }).setValue({
                    fieldId: "memo",
                    value: memo
                }).setValue({
                    fieldId: "salesrep",
                    value: salesrep
                }).setValue({
                    fieldId: "department",
                    value: departamentid
                }).setValue({
                    fieldId: "class",
                    value: classid
                }).setValue({
                    fieldId: "location",
                    value: locationid
                }).setValue({
                    fieldId: "discountitem",
                    value: discountItem
                }).setValue({
                    fieldId: "discountrate",
                    value: discountrate
                }).setValue({
                    fieldId: "externalid",
                    value: externalid
                })


                let cliente = invObj.getValue({ fieldId: 'entity' })
                log.debug('cliente', typeof (cliente))

                element2.lines.forEach(line => {

                    let temLine_item = line.itemLine_item
                    let temLine_quantity = line.itemLine_quantity
                    let temLine_units = line.itemLine_units
                    let temLine_salesPrice = line.itemLine_salesPrice
                    let temLine_amount = line.itemLine_amount
                    let temLine_description = line.itemLine_description
                    let temLine_isTaxable = line.itemLine_isTaxable
                    let temLine_priceLevel = line.itemLine_priceLevel
                    let temLine_department = line.itemLine_department
                    let temLine_class = line.itemLine_class
                    let temLine_location = line.itemLine_location
                    let temLine_skan_contrato = line.itemLine_skan_contrato
                    let temLine_satcode = '';

                    //#region busqueda del item
                    if (temLine_item != null && temLine_item != '') {
                        var itemSearchObj = search.create({
                            type: "item",
                            filters:
                                [
                                    ["name", "is", line.itemLine_item]
                                ],
                            columns:
                                [
                                    search_item = search.createColumn({ name: "internalid", label: "Internal ID" })
                                ]
                        });
                        var searchResultCount = itemSearchObj.runPaged().count;
                        log.debug("itemSearchObj result count", searchResultCount);
                        itemSearchObj.run().each(function (result) {
                            itemid = result.getValue(search_item);
                            return true;
                        });
                        if (itemid == '') {
                            throw 'El artículo enviado no existe';
                        }
                    } else {
                        throw 'Debe ingresar al menos un artículo'
                    }

                    //#endregion

                    //#region busqueda contrato
                    if (temLine_skan_contrato != null && temLine_skan_contrato != '') {
                        var customrecord_skan_contratosSearchObj = search.create({
                            type: "customrecord_skan_contratos",
                            filters:
                                [
                                    ["name", "is", temLine_skan_contrato]
                                ],
                            columns:
                                [
                                    search_contrato = search.createColumn({ name: "id", label: "ID" })
                                ]
                        });
                        var searchResultCount = customrecord_skan_contratosSearchObj.runPaged().count;
                        log.debug("customrecord_skan_contratosSearchObj result count", searchResultCount);
                        customrecord_skan_contratosSearchObj.run().each(function (result) {
                            contratoid = result.getValue(search_contrato)
                            return true;
                        });
                        if (contratoid == '') {
                            throw 'El contrato enviado no existe';
                        }
                    }
                    log.debug('contratoid', contratoid);
                    //#endregion

                    //#region busqueda del SAT CODE
                    if (temLine_satcode != '' && temLine_satcode != null) {
                        var customrecord_mx_sat_item_codeSearchObj = search.create({
                            type: "customrecord_mx_sat_item_code",
                            filters:
                                [
                                    ["custrecord_mx_ic_code", "is", "84121701"]
                                ],
                            columns:
                                [
                                    search_satcode = search.createColumn({ name: "internalid", label: "Internal ID" })
                                ]
                        });
                        var searchResultCount = customrecord_mx_sat_item_codeSearchObj.runPaged().count;
                        log.debug("customrecord_mx_sat_item_codeSearchObj result count", searchResultCount);
                        customrecord_mx_sat_item_codeSearchObj.run().each(function (result) {
                            satcode = result.getValue(search_satcode);
                            return true;
                        });
                    }

                    //#endregion

                    //#region busqueda del tipo de unidad
                    var unitstypeSearchObj = search.create({
                        type: "unitstype",
                        filters:
                            [
                                ["abbreviation", "is", temLine_units]
                            ],
                        columns:
                            [
                                search_unit = search.createColumn({ name: "internalid", label: "Internal ID" })
                            ]
                    });
                    var searchResultCount = unitstypeSearchObj.runPaged().count;
                    unitstypeSearchObj.run().each(function (result) {
                        unitid = result.getValue(search_unit);
                        return true;
                    });
                    if (unitid == '') {
                        throw 'El tipo de unidad que ha enviado no existe'
                    }
                    //#endregion
                    invObj.setCurrentSublistValue({
                        sublistId: "item",
                        fieldId: "item",
                        value: itemid
                    }).setCurrentSublistValue({
                        sublistId: "item",
                        fieldId: "quantity",
                        value: temLine_quantity
                    }).setCurrentSublistValue({
                        sublistId: "item",
                        fieldId: "units",
                        value: unitid
                    }).setCurrentSublistValue({
                        sublistId: "item",
                        fieldId: "amount",
                        value: temLine_amount
                    }).setCurrentSublistValue({
                        sublistId: "item",
                        fieldId: "",
                        value: temLine_description
                    }).setCurrentSublistValue({
                        sublistId: "item",
                        fieldId: "pricelevels",
                        value: -1
                    }).setCurrentSublistValue({
                        sublistId: "item",
                        fieldId: "custcol_skan_contrato2",
                        value: contratoid
                    }).commitLine({
                        sublistId: "item",
                    })
                    log.debug("haciendo commit")
                });

                let idObj = invObj.save({
                    ignoreMandatoryFields: true
                });

                log.debug('id invoices credas', idObj);
                cabecera.push({
                    idInvoice: idObj
                })

                log.debug("Se hizo una invoice", cabecera)
            } else {
                log.debug('actualizando', invoiceid)
                var invObj = record.load({
                    type: record.Type.INVOICE,
                    id: invoiceid,
                    isDynamic: true
                }).setValue({
                    fieldId: "entity",
                    value: clienteid
                }).setValue({
                    fieldId: "approvalstatus",
                    value: invoicestatus
                }).setValue({
                    fieldId: "trandate",
                    value: fechafuncion
                }).setValue({
                    fieldId: "memo",
                    value: memo
                }).setValue({
                    fieldId: "salesrep",
                    value: salesrep
                }).setValue({
                    fieldId: "department",
                    value: departamentid
                }).setValue({
                    fieldId: "class",
                    value: classid
                }).setValue({
                    fieldId: "location",
                    value: locationid
                }).setValue({
                    fieldId: "discountitem",
                    value: discountItem
                }).setValue({
                    fieldId: "discountrate",
                    value: discountrate
                });

                log.debug('ITEMS LENGTH', element2.lines.length);
                let element2copy = element2.lines.slice();
                element2.lines.forEach(function (line, index) {
                    log.debug('primero array posicion', index);
                    let temLine_item = line.itemLine_item
                    let temLine_quantity = line.itemLine_quantity
                    let temLine_units = line.itemLine_units
                    let temLine_salesPrice = line.itemLine_salesPrice
                    let temLine_amount = line.itemLine_amount
                    let temLine_description = line.itemLine_description
                    let temLine_isTaxable = line.itemLine_isTaxable
                    let temLine_priceLevel = line.itemLine_priceLevel
                    let temLine_department = line.itemLine_department
                    let temLine_class = line.itemLine_class
                    let temLine_location = line.itemLine_location
                    let temLine_skan_contrato = line.itemLine_skan_contrato
                    let temLine_satcode = '';

                    //#region busqueda del item
                    if (temLine_item != null && temLine_item != '') {
                        var itemSearchObj = search.create({
                            type: "item",
                            filters:
                                [
                                    ["name", "is", line.itemLine_item]
                                ],
                            columns:
                                [
                                    search_item = search.createColumn({ name: "internalid", label: "Internal ID" })
                                ]
                        });
                        var searchResultCount = itemSearchObj.runPaged().count;
                        itemSearchObj.run().each(function (result) {
                            itemid = result.getValue(search_item);
                            return true;
                        });
                        if (itemid == '') {
                            throw 'El artículo enviado no existe';
                        }
                    }

                    //#endregion

                    //#region busqueda contrato
                    if (temLine_skan_contrato != null && temLine_skan_contrato != '') {
                        var customrecord_skan_contratosSearchObj = search.create({
                            type: "customrecord_skan_contratos",
                            filters:
                                [
                                    ["name", "is", temLine_skan_contrato]
                                ],
                            columns:
                                [
                                    search_contrato = search.createColumn({ name: "id", label: "ID" })
                                ]
                        });
                        var searchResultCount = customrecord_skan_contratosSearchObj.runPaged().count;
                        customrecord_skan_contratosSearchObj.run().each(function (result) {
                            contratoid = result.getValue(search_contrato)
                            return true;
                        });
                        if (contratoid == '') {
                            throw 'El contrato enviado no existe';
                        }
                    }

                    //#endregion

                    //#region busqueda del SAT CODE
                    if (temLine_satcode != '' && temLine_satcode != null) {
                        var customrecord_mx_sat_item_codeSearchObj = search.create({
                            type: "customrecord_mx_sat_item_code",
                            filters:
                                [
                                    ["custrecord_mx_ic_code", "is", "84121701"]
                                ],
                            columns:
                                [
                                    search_satcode = search.createColumn({ name: "internalid", label: "Internal ID" })
                                ]
                        });
                        var searchResultCount = customrecord_mx_sat_item_codeSearchObj.runPaged().count;
                        log.debug("customrecord_mx_sat_item_codeSearchObj result count", searchResultCount);
                        customrecord_mx_sat_item_codeSearchObj.run().each(function (result) {
                            satcode = result.getValue(search_satcode);
                            return true;
                        });
                    }

                    //#endregion

                    //#region busqueda del tipo de unidad
                    if (temLine_units != '' && temLine_units != null) {
                        var unitstypeSearchObj = search.create({
                            type: "unitstype",
                            filters:
                                [
                                    ["abbreviation", "is", temLine_units]
                                ],
                            columns:
                                [
                                    search_unit = search.createColumn({ name: "internalid", label: "Internal ID" })
                                ]
                        });
                        var searchResultCount = unitstypeSearchObj.runPaged().count;
                        unitstypeSearchObj.run().each(function (result) {
                            unitid = result.getValue(search_unit);
                            return true;
                        });
                        if (unitid == '') {
                            throw 'El tipo de unidad que ha enviado no existe'
                        }
                    }

                    //#endregion

                    

                    let itemcount = invObj.getLineCount({
                        sublistId: 'item'
                    });

                    if (index < itemcount) {
                        
                        invObj.selectLine({
                            sublistId: 'item',
                            line: index
                        })
                        invObj.setCurrentSublistValue({
                            sublistId: "item",
                            fieldId: "quantity",
                            value: temLine_quantity
                        }).setCurrentSublistValue({
                            sublistId: "item",
                            fieldId: "units",
                            value: unitid
                        }).setCurrentSublistValue({
                            sublistId: "item",
                            fieldId: "amount",
                            value: temLine_amount
                        }).setCurrentSublistValue({
                            sublistId: "item",
                            fieldId: "",
                            value: temLine_description
                        }).setCurrentSublistValue({
                            sublistId: "item",
                            fieldId: "custcol_skan_contrato2",
                            value: contratoid
                        }).commitLine({
                            sublistId: "item",
                        });
                        log.debug('commit','commit realizado')
                        //element2copy.splice(index, 1);
                        element2copy[index] = '';
                        
                        log.debug('arreglo copiado', element2copy);
                    }

                });


                let arrItemNuevo = element2copy.filter(item => item != '');
                log.debug('items nuevos por agregar:', arrItemNuevo);
                arrItemNuevo.forEach(line2 => {
                    log.debug('arreglo 2', 'AGREGANDO NUEVO ITEM');
                    let temLine_item = line2.itemLine_item
                    let temLine_quantity = line2.itemLine_quantity
                    let temLine_units = line2.itemLine_units
                    let temLine_salesPrice = line2.itemLine_salesPrice
                    let temLine_amount = line2.itemLine_amount
                    let temLine_description = line2.itemLine_description
                    let temLine_isTaxable = line2.itemLine_isTaxable
                    let temLine_priceLevel = line2.itemLine_priceLevel
                    let temLine_department = line2.itemLine_department
                    let temLine_class = line2.itemLine_class
                    let temLine_location = line2.itemLine_location
                    let temLine_skan_contrato = line2.itemLine_skan_contrato
                    let temLine_satcode = '';

                    //#region busqueda del item
                    if (temLine_item != null && temLine_item != '') {
                        var itemSearchObj = search.create({
                            type: "item",
                            filters:
                                [
                                    ["name", "is", line2.itemLine_item]
                                ],
                            columns:
                                [
                                    search_item = search.createColumn({ name: "internalid", label: "Internal ID" })
                                ]
                        });
                        var searchResultCount = itemSearchObj.runPaged().count;
                        itemSearchObj.run().each(function (result) {
                            itemid = result.getValue(search_item);
                            return true;
                        });
                        if (itemid == '') {
                            throw 'El artículo enviado no existe';
                        }
                    }

                    //#endregion

                    //#region busqueda contrato
                    if (temLine_skan_contrato != null && temLine_skan_contrato != '') {
                        var customrecord_skan_contratosSearchObj = search.create({
                            type: "customrecord_skan_contratos",
                            filters:
                                [
                                    ["name", "is", temLine_skan_contrato]
                                ],
                            columns:
                                [
                                    search_contrato = search.createColumn({ name: "id", label: "ID" })
                                ]
                        });
                        var searchResultCount = customrecord_skan_contratosSearchObj.runPaged().count;
                        customrecord_skan_contratosSearchObj.run().each(function (result) {
                            contratoid = result.getValue(search_contrato)
                            return true;
                        });
                        if (contratoid == '') {
                            throw 'El contrato enviado no existe';
                        }
                    }
                    //#endregion


                    //#region busqueda del tipo de unidad
                    if (temLine_units != '' && temLine_units != null) {
                        var unitstypeSearchObj = search.create({
                            type: "unitstype",
                            filters:
                                [
                                    ["abbreviation", "is", temLine_units]
                                ],
                            columns:
                                [
                                    search_unit = search.createColumn({ name: "internalid", label: "Internal ID" })
                                ]
                        });
                        var searchResultCount = unitstypeSearchObj.runPaged().count;
                        unitstypeSearchObj.run().each(function (result) {
                            unitid = result.getValue(search_unit);
                            return true;
                        });
                        if (unitid == '') {
                            throw 'El tipo de unidad que ha enviado no existe'
                        }
                    }

                    //#endregion

                    invObj.selectNewLine({
                        sublistId: 'item'
                    });
                    invObj.setCurrentSublistValue({
                        sublistId: "item",
                        fieldId: "item",
                        value: itemid
                    }).setCurrentSublistValue({
                        sublistId: "item",
                        fieldId: "quantity",
                        value: temLine_quantity
                    }).setCurrentSublistValue({
                        sublistId: "item",
                        fieldId: "units",
                        value: unitid
                    }).setCurrentSublistValue({
                        sublistId: "item",
                        fieldId: "amount",
                        value: temLine_amount
                    }).setCurrentSublistValue({
                        sublistId: "item",
                        fieldId: "",
                        value: temLine_description
                    }).setCurrentSublistValue({
                        sublistId: "item",
                        fieldId: "pricelevels",
                        value: -1
                    }).setCurrentSublistValue({
                        sublistId: "item",
                        fieldId: "custcol_skan_contrato2",
                        value: contratoid
                    }).commitLine({
                        sublistId: "item",
                    })
                    log.debug("haciendo commit","COMMIT")

                })





                let idObj = invObj.save({
                    ignoreMandatoryFields: true
                });

                log.debug('id invoices credas', idObj);
                cabecera.push({
                    idInvoice: idObj
                })

                log.debug("Se hizo una invoice", cabecera)
            }
        });
        return cabecera
    }


    function isEmpty(value) {
        if (value == undefined || value == null)
            return true;
        if (util.isNumber(value) || util.isBoolean(value) || util.isDate(value) || util.isFunction(value))
            return false;
        if (util.isString(value))
            return (value.length == 0) ? true : false;
        return (Object.keys(value).length == 0) ? true : false;
    }

    function transformdate(vardate) {
        let a = vardate.slice(1, 11)
        var a1 = a.split("/");
        var fecha = new Date(a1[1] + "/" + a1[0] + "/" + a1[2]);
        return fecha

    }

    return {
        get: get,
        post: post
    };
});