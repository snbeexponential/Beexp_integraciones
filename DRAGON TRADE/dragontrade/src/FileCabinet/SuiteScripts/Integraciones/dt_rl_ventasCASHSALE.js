/**
 * @author Evelyn Sarmiento evelyn.sarmiento@beexponential.com.mx
 * @Name ac_rl_salesorder.js
 * @description Script de tipo restlet para realizar una sales order y actualizarla
 * @NApiVersion 2.1
 * @NScriptType Restlet
 */

define(['N/search', 'N/record', 'N/https', 'N/format', 'N/file', 'N/encode'], function (search, record, https, format, file, encode) {
    const entry_point = {
        post: null,
        put: null
    };

    // const response = {
    //     code: 200,
    //     message: '',
    //     result: []
    // } 

    entry_point.post = function (context) {

        // let teste = record.load({
        //     type: record.Type.INVENTORY_DETAIL,
        //     id: 1566
        // })

        // response.result.push(teste);

        // return response;

        log.debug('servicio: ', 'POST');
        let request = JSON.parse(JSON.stringify(context));
        let item = request.detalleventa;
        let pagos = request.pagos;
        //let subtotal = request.subtotal;
        let entityid = request.entity;
        let salesrep = request.salesrep;
        let suma_descuentos = 0;
        let disc = 0;
        let resta = 0;
        const record_sale = record.create({ //Se crea la sales order
            type: record.Type.CASH_SALE,
            isDynamic: true,
            defaultValues: {
                entity: entityid,

            }
        }).setValue({
            fieldId: 'subsidiary',
            value: request.subsidiaria
        }).setValue({
            fieldId: 'salesrep',
            value: salesrep
        })
            /*.setValue({
                fieldId: 'subtotal',
                value: 231
            }).setValue({
                fieldId: 'total',
                value: request.total
            })/*.setValue({
                fieldId: 'custbody_mx_txn_sat_payment_method',
                value: request.pagos[0].metodo_pago
            }).setValue({
                fieldId: 'currency',
                value: request.pagos[0].divisa
            })*/
            .setValue({
                fieldId: "discountitem",
                value: -6,
                ignoreFieldChange: true,
            }).setValue({
                fieldId: "custbody_mx_cfdi_folio",
                value: request.folio,
                ignoreFieldChange: true,
            }).setValue({
                fieldId: "custbody_mx_cfdi_uuid",
                value: request.UUID,
                ignoreFieldChange: true,
            }).setValue({
                fieldId: "custbody_fechatimbrado",
                value: request.fechatimbrado,
                ignoreFieldChange: true,
            }).setValue({
                fieldId: "custbody_fechaticket",
                value: request.fechaticket,
                ignoreFieldChange: true,
            }).setValue({
                fieldId: "custbody_cadenaoriginal",
                value: request.fechaticket,
                ignoreFieldChange: true,
            }).setValue({
                fieldId: "custbody_puntosgenerados",
                value: request.puntosgenerados,
                ignoreFieldChange: true,
            }).setValue({
                fieldId: "custbody_puntosconsumidos",
                value: request.puntosconsumidos,
                ignoreFieldChange: true,
            }).setValue({
                fieldId: "location",
                value: request.ubicacion,
                ignoreFieldChange: true,
            }).setValue({
                fieldId: "custbody_mx_cfdi_folio",
                value: request.folioticket,
                ignoreFieldChange: true,
            })



        let fechatimbr = request.fechatimbrado;

        try {




            item.forEach(function (value, index) {
                let internalid = value.articulo;
                let quantity = value.cantidad;
                let rate = value.preciounitario;
                let taxrate1 = value.iva;
                let descuentos = value.descuento;
                let taxe = (rate * quantity) * 0.16


                if (value.paquete) {

                    try {


                        record_sale.selectNewLine({
                            sublistId: 'item'
                        }).setCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'item',
                            value: internalid
                        }).setCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'groupsetup',
                            value: true
                        })

                        log.debug('serial', 'ANTES DEL COMMIT DEL GROUP');

                        record_sale.commitLine({
                            sublistId: 'item',
                        });

                        log.debug('serial', 'DESPUEST DEL COMMIT DEL GROUP');
                    } catch (err) {
                        log.debug('error', err)
                    }

                    try {

                        let grupo = value.paquete;
                        // const lineCount = record_sale.getLineCount({ sublistId: "item" })

                        //     record_sale.selectLine({ sublistId: "item", line: lineNum });
                        //     let itemval = record_sale.getCurrentSublistValue({ sublistId: 'item', fieldId: 'item' });

                        log.debug('serial', 'ANTES DEL FORECAH');

                        //log.debug('itemval', itemval);

                        grupo.forEach(val => {

                            log.debug('item value', val.articulo);

                            record_sale.selectNewLine({
                                sublistId: 'item'
                            }).setCurrentSublistValue({
                                sublistId: 'item',
                                fieldId: 'item',
                                value: val.articulo
                            }).setCurrentSublistValue({
                                sublistId: 'item',
                                fieldId: 'quantity',
                                value: val.cantidad
                            }).setCurrentSublistValue({
                                sublistId: 'item',
                                fieldId: 'price',
                                value: -1
                            }).setCurrentSublistValue({
                                sublistId: 'item',
                                fieldId: 'rate',
                                value: val.preciounitario
                            })

                            if (descuentos != 0) {

                                record_sale.setCurrentSublistValue({
                                    sublistId: "item",
                                    fieldId: "custcol_descuento",
                                    value: descuentos
                                }).setCurrentSublistValue({
                                    sublistId: "item",
                                    fieldId: "custcol_precio_desc",
                                    value: rate - (rate * descuentos)
                                }).setCurrentSublistValue({
                                    sublistId: 'item',
                                    fieldId: 'amount',
                                    value: (rate - (rate * descuentos)) * quantity
                                })

                            }





                            log.debug('foreach', 'en el foreach')

                            if (val.serial_number) {
                                let seriales = val.serial_number;
                                // Create the subrecord for that line.
                                var subrec = record_sale.getCurrentSublistSubrecord({
                                    sublistId: 'item',
                                    fieldId: 'inventorydetail',
                                });

                                subrec.setValue({
                                    fieldId: 'quantity',
                                    value: quantity
                                })
                                seriales.forEach(function (val, ind) {

                                    log.debug('serial', val);
                                    // Add a line to the subrecord's inventory assignment sublist.
                                    let subinv = subrec.selectNewLine({
                                        sublistId: 'inventoryassignment'
                                    });

                                    subrec.setCurrentSublistValue({
                                        sublistId: 'inventoryassignment',
                                        fieldId: 'issueinventorynumber',
                                        value: val
                                    });


                                    // set quantity
                                    subrec.setCurrentSublistValue({
                                        sublistId: 'inventoryassignment',
                                        fieldId: 'quantity',
                                        value: 1
                                    });

                                    //log.debug('cantidad:', quantity);

                                    subrec.setCurrentSublistValue({
                                        sublistId: 'inventoryassignment',
                                        fieldId: 'location',
                                        value: request.ubicacion
                                    });


                                    let myinvnumber3 = subrec.getCurrentSublistValue({
                                        sublistId: 'inventoryassignment',
                                        fieldId: 'issueinventorynumber'
                                    });

                                    log.debug('lot number', myinvnumber3);
                                    //log.debug('lista', subinv);

                                    subrec.commitLine({
                                        sublistId: 'inventoryassignment'
                                    });

                                });


                                // let hue = record_sale.getCurrentSublistSubrecord({
                                //     sublistId: 'item',
                                //     fieldId: 'inventorydetail',
                                // });

                                // log.debug('tesst', hue);

                                //log.debug('antes del commit', 'asdasa');
                                subrec.commit();
                                //log.debug('despues del commit', 'asdasa');
                            }

                            record_sale.commitLine({ sublistId: "item", ignoreRecalc: true });

                        });

                        log.debug('serial', 'DESPUES DEL FORECAH');

                        record_sale.selectNewLine({ sublistId: "item" });
                        record_sale.setCurrentSublistValue({ sublistId: "item", fieldId: "item", value: 0 });
                        record_sale.setCurrentSublistValue({ sublistId: "item", fieldId: "itemtype", value: "EndGroup" });
                        record_sale.commitLine({ sublistId: "item" });
                        log.debug('serial', 'despues del copmmit end group');


                    } catch (err) {
                        log.debug('error en el inventory detail', err);
                    }

                }



                if (!value.paquete) {
                    record_sale.selectNewLine({
                        sublistId: 'item'
                    }).setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'item',
                        value: internalid
                    }).setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'quantity',
                        value: quantity
                    }).setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'price',
                        value: -1
                    }).setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'rate',
                        value: rate
                    }).setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_mx_txn_line_sat_item_code',
                        value: value.clavesat
                    });

                    if (descuentos != 0) {

                        record_sale.setCurrentSublistValue({
                            sublistId: "item",
                            fieldId: "custcol_descuento",
                            value: descuentos
                        }).setCurrentSublistValue({
                            sublistId: "item",
                            fieldId: "custcol_precio_desc",
                            value: rate - (rate * descuentos)
                        }).setCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'amount',
                            value: (rate - (rate * descuentos)) * quantity
                        })

                    }


                    if (value.serial_number) {

                        log.debug('value:', value);

                        let seriales = value.serial_number;
                        // Create the subrecord for that line.
                        var subrec = record_sale.getCurrentSublistSubrecord({
                            sublistId: 'item',
                            fieldId: 'inventorydetail',
                        });

                        subrec.setValue({
                            fieldId: 'quantity',
                            value: quantity
                        })

                        seriales.forEach(function (val, ind) {

                            log.debug('serial', val);
                            // Add a line to the subrecord's inventory assignment sublist.
                            let subinv = subrec.selectNewLine({
                                sublistId: 'inventoryassignment'
                            });

                            subrec.setCurrentSublistValue({
                                sublistId: 'inventoryassignment',
                                fieldId: 'issueinventorynumber',
                                value: val
                            });


                            // set quantity
                            subrec.setCurrentSublistValue({
                                sublistId: 'inventoryassignment',
                                fieldId: 'quantity',
                                value: 1
                            });

                            log.debug('cantidad:', quantity);

                            subrec.setCurrentSublistValue({
                                sublistId: 'inventoryassignment',
                                fieldId: 'location',
                                value: request.ubicacion
                            });


                            let myinvnumber3 = subrec.getCurrentSublistValue({
                                sublistId: 'inventoryassignment',
                                fieldId: 'issueinventorynumber'
                            });

                            log.debug('lot number', myinvnumber3);
                            //log.debug('lista', subinv);

                            subrec.commitLine({
                                sublistId: 'inventoryassignment'
                            });



                            log.debug('linea:', '263');


                        });


                        let hue = record_sale.getCurrentSublistSubrecord({
                            sublistId: 'item',
                            fieldId: 'inventorydetail',
                        });


                        // let heu = subrec.getSublistValue({
                        //     sublistId: 'inventoryassignment',
                        //     fieldId: 'issueinventorynumber',
                        //     line: 0
                        // })

                        // let heo = subrec.getSublistValue({
                        //     sublistId: 'inventoryassignment',
                        //     fieldId: 'quantity',
                        //     line: 0
                        // })

                        // let invid = subrec.getSublistValue({
                        //     sublistId: 'inventoryassignment',
                        //     fieldId: 'inventorydetail',
                        //     line: 0
                        // })

                        log.debug('tesst', hue);



                        log.debug('antes del commit', 'asdasa');
                        subrec.commit();
                        log.debug('despues del commit', 'asdasa');

                    }




                    log.debug('despues del if', 'huessssssssssssss');

                    // Save the line in the record's sublist
                    record_sale.commitLine({ //SE DEBE VOLVER A ACTIVAR
                        sublistId: 'item',
                        ignoreRecalc: true
                    });

                }

            });


            // PAGOS FUNCIONANDO
            record_sale.setValue({
                fieldId: "card",
                value: pagos[0].metodo_pago,
            }).setValue({
                fieldId: 'currency',
                value: pagos[0].divisa
            }).setValue({
                fieldId: 'checknumber',
                value: pagos[0].check
            }).setValue({
                fieldId: 'paymenteventdate',
                value: new Date()
            }).setValue({
                fieldId: 'paymenteventholdreason',
                value: 'ACCEPT'
            }).setValue({
                fieldId: 'paymenteventresult',
                value: 'ACCEPT'
            }).setValue({
                fieldId: 'paymenteventtype',
                value: 'SALE'
            }).setValue({
                fieldId: 'paymentmethodaccount',
                value: pagos[0].cuenta
            }).setValue({
                fieldId: 'paymentmethod',
                value: pagos[0].metodo_pago
            }).setValue({
                fieldId: 'paymentoption',
                value: pagos[0].metodo_pago
            });




            log.debug('monto: ', pagos[0].monto);

            // FIN DE PAGOS FUNCIONANDO

            // let numLines = record_sale.getSublistValue({
            //     sublistId: 'paymentevent',
            //     fieldId: 'amount',
            // });


            //log.debug('payment?', numLines)


            const lineCount = record_sale.getLineCount({ sublistId: "item" });
            log.debug('LINEAS TOTALES DE ITEMS', lineCount);

            let obtenerSubTotal = record_sale.getValue({
                fieldId: 'subtotal',
            });


            //let obtenerTax = 0;
            //let obtenerTotal = 0;

            // for (let j = 0; j < lineCount; j++) {
            //     record_sale.selectLine({
            //         sublistId: 'item',
            //         line: j
            //     })
                
            //     // let atxe = record_sale.getCurrentSublistValue({
            //     //     sublistId:'item',
            //     //     fieldId:'taxamount'
            //     // }); 

            //    // log.debug('tax', atxe);

            //     let itemtype = record_sale.getCurrentSublistValue({
            //         sublistId: 'item',
            //         fieldId: 'itemtype'
            //     });

            //     if(itemtype != 'EndGroup' || itemtype != 'Group'){

            //         let total = record_sale.getSublistValue({
            //             sublistId:'item',
            //             fieldId:'rate',
            //             line: j
            //         });
                    
            //         log.debug('total', total);

            //         obtenerTotal = obtenerTotal+ total;
            //     }

                


            //     // obtenerTax = obtenerTax+ atxe;
                

            // }

            // let obtenerTax = record_sale.getValue({
            //     fieldId: 'taxtotal2',
            // });

            // let obtenerTotal = record_sale.getValue({
            //     fieldId: 'total',
            // });





            let response = {

                code: 200,

                message: "",

                result: [],

            };

            if (obtenerSubTotal != request.subtotal) {
                response.code = 400;
                response.message = "EL CALCULO DEL SUBTOTAL NO COINCIDE";
                return response
                //response.result.push({ id_invoice })

             
            } else {

                var id_invoice = record_sale.save({
                    ignoreMandatoryFields: true
                });

                log.debug('linea:', '402');

                //#region Creacion de los documentos en el filecabinet
                let pdfbase64 = request.pdf;
                log.debug('pdfbase64', pdfbase64);



                // Crear PDF
                var objFilePDF = file.create({
                    name: id_invoice + fechatimbr + ".pdf",
                    fileType: file.Type.PDF,
                    contents: pdfbase64,
                    folder: 1205,
                });

                var idpdf = objFilePDF.save();
                //#endregion

                //#region Creacion del XML
                var docXML = encode.convert({
                    string: request.xml,
                    inputEncoding: encode.Encoding.BASE_64,
                    outputEncoding: encode.Encoding.UTF_8
                });

                var objFileXML = file.create({
                    name: id_invoice + fechatimbr + ".xml",
                    fileType: file.Type.XMLDOC,
                    contents: docXML,
                    folder: 1205,
                });

                var idxml = objFileXML.save();

                guardarDocumentos(id_invoice, idxml, idpdf);
                //pagarInvoice(id_invoice, pagos);

                log.debug('idxml', idxml);
                //#endregion


                response.code = 200,
                    response.message = "Transaccion de venta creada exitosamente",
                    response.result = []

                response.result.push({ id_invoice })

                return response
            }




            return response;

        } catch (err) {
            // log.debug('err', err);
            // let respo = {
            //     code: 400,
            // }
            // let error = err.message;
            // if (error === "Please configure the inventory detail for this line.") {
            //     respo.messsage = 'No hay disponibilidad de este artículo por el momento';
            // } else if (error === 'Multi-location Inventory Error (MLI_LOCATION_REQUIRED): this transaction or its items must have locations.') {
            //     respo.message = 'Favor de insertar una ubicación para esta transacción.'
            // } else {

            //     respo = err;
            // }


            log.debug('error general: ', err);

            return err;
        }

    }


    function guardarDocumentos(id_invoice, idpdf, idxml) {
        try {
            var objRecord = record.load({
                type: record.Type.CASH_SALE,
                id: id_invoice,
                isDynamic: true,
            }).setValue({
                fieldId: 'custbody_documentopdf',
                value: idpdf,
                ignoreFieldChange: true
            }).setValue({
                fieldId: 'custbody_documentoxml',
                value: idxml,
                ignoreFieldChange: true
            }).save({
                ignoreMandatoryFields: true
            });

        } catch (e) {
            log.debug('error', e);
        }
    }

    entry_point.put = function (context) {


    }
    return entry_point;
});