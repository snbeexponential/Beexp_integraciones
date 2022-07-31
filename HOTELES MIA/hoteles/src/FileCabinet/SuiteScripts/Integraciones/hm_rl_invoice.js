/**
* @author Carlos Abreu Novelo carlos.abreu@beexponential.com.mx<>
* @Modificacion <>
* @Name hm_rl_Invoice.js
* @description Script para creacion de invoice con su pago 
* @file <URL PENDIENTE>
* @NApiVersion 2.1
* @NScriptType Restlet
*/
define(['N/search', 'N/record', 'N/https', 'N/format'], function (search, record, https, format) {
    const entry_point = {
        post: null,
        put: null,
        get: null
    };
    entry_point.get = function (request) {
        var id = request.id
        var objeRcord = record.load({
            type: record.Type.INVOICE,
            id: 17,
            isDynamic: true,
        })
        var sublistName = objeRcord.getSublists();

        log.debug('sublistas', sublistName);
        log.debug('ID', id);
        log.debug('objeto', objeRcord);
        return objeRcord;



    }

    entry_point.post = function (context) {
        

        let request = JSON.parse(JSON.stringify(context));
        log.debug('request', request);

        let pagos = request.pagos;
      	log.debug('pagos', pagos);

        let item = request.item;
        log.debug('item', item);
        let gg = request.item_total;
        log.debug('item total', gg)
        /*
        let subtotal = request.subtotal;
        log.debug('subtotal', subtotal) */
        let entityid = request.entity;
        log.debug('entityid', entityid);

        
        const d = new Date(request.fecha);
        log.debug('date', d);

        let myaccount = parseFloat(request.cuenta) ;
        log.debug('myaccount', myaccount);

        

        

        const record_sale = record.create({ //Se crea la sales order
            type: record.Type.INVOICE,
            isDynamic: true,
            
        }).setValue({
            fieldId: 'customform',
            value: "134",

        }).setValue({
            fieldId: 'exchangerate',
            value: "1.00",

        }).setValue({
            fieldId: 'currency',
            value: "1",

        }).setValue({
            fieldId: 'subtotal',
            value: request.item_total
        }).setValue({
            fieldId: 'entity',
            value: request.entity
        }).setValue({
            fieldId: 'total',
            value: request.total
        }).setValue({
            fieldId: 'subsidiary',
            value: request.subcidiaria
        }).setValue({
            fieldId: 'approvalstatus',
            value: request.estatus
        }).setValue({
            fieldId: 'postingperiod',
            value: request.postingperiod
        }).setValue({
            fieldId: 'trandate',
            value: d
        }).setValue({
            fieldId: 'location',
            value: request.locacion
        }).setValue({
            fieldId: 'account',
            value: request.cuenta
        })
        


        log.debug('body', record_sale);
        log.debug('context', context);

        item.forEach(function (index) {
            
            
            let internalid = index.item;
            log.debug('internalid', internalid);
            let description = index.description;
            log.debug('description', description);
            let rate = index.rate;
            log.debug('rate', rate);
            let quantity = index.quantity;
            log.debug('quantity', quantity);
            let taxamount = index.taxamount;
            log.debug('taxamount', taxamount);
            let total = index.total;
            log.debug('total', total);
            
            let amount = index.amount;
            log.debug('amount', amount);

            let myString = parseFloat(amount) ;
            log.debug('myString', myString);


            record_sale.selectNewLine({
                sublistId: 'item'
            }).setCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'item',
                value: internalid
            }).setCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'description',
                value: description
            }).setCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'taxrate',
                value: rate
            }).setCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'grossamt',
                value: total
            }).setCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'amount',
                value: myString
            }).setCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'account',
                value: index.cuenta
            }).commitLine({
                sublistId: "item"
            });

        });

        log.debug('record_sale', record_sale);

       
        record_sale.save({
            ignoreMandatoryFields: true
        });

        var id_invoice = record_sale.save({
            ignoreMandatoryFields: true
        });

        const response = {
            code: 200,
            message: "Transaccion de venta Creada exitosamente",
            result: []
        };
        response.result.push({ id_invoice })
        pagarInvoice(id_invoice, pagos);
       


        /* if (response.code === 200) {
            record_id = id;
            log.debug('record_id', record_id);
            let invoice = record.load({

                type: record.Type.INVOICE,
    
                id: Number(id),
    
                isDynamic: true,
    
            });
            log.debug('invoice', invoice);

            let request = JSON.parse(JSON.stringify(context));
            log.debug('request', request);
            let customer = request.entity;
            log.debug('customer', customer);
            let trandate = request.fecha;
            log.debug('trandate', trandate);
            const datepay = new Date(trandate);
            log.debug('datepay', datepay);





            const record_pay = record.create({ //Se crea la sales order
                type: record.Type.CUSTOMER_PAYMENT,
                isDynamic: true,
                
            }).setValue({
                fieldId: 'customer',
                value: customer,
    
            }).setValue({
                fieldId: 'trandate',
                value: datepay,
    
            }).setValue({
                fieldId: 'exchangerate',
                value: '1.00',
    
            }).setValue({
                fieldId: 'payment',
                value: '1740',
    
            }).setValue({
                fieldId: 'autoapply',
                value: true,
    
            }).save({})//customer trandate exchangerate  payment


        } */


        return response;

    }
    function pagarInvoice(id_invoice, pagos) {

        let response = {}
        try {
            pagos.forEach(function (pago) {
                let objPayments = record.transform({
                    fromType: record.Type.INVOICE,
                    fromId: id_invoice,
                    toType: record.Type.CUSTOMER_PAYMENT,
                    isDynamic: true
                });
                objPayments.setValue({ fieldId: 'paymentoption', value: pago.metodo_pago });
                objPayments.setValue({ fieldId: 'currency', value: pago.divisa });
                //objPayments.setValue({ fieldId: 'trandate', value: new Date(pago.trandate) });
                const sublistId = 'apply';
                let totalCount = objPayments.getLineCount({ sublistId: sublistId });
                for (let index = 0; index < totalCount; index++) {
                    objPayments.selectLine({ sublistId: sublistId, line: index });
                    objPayments.setCurrentSublistValue({ sublistId: sublistId, fieldId: 'apply', value: true });
                    objPayments.setCurrentSublistValue({ sublistId: sublistId, fieldId: 'amount', value: pago.monto });
                    objPayments.setCurrentSublistValue({ sublistId: sublistId, fieldId: 'due', value: pago.monto });
                    objPayments.setCurrentSublistValue({ sublistId: sublistId, fieldId: 'total', value: pago.monto });
                    objPayments.commitLine({ sublistId: sublistId });
                }
                var id = objPayments.save({ enableSourcing: true, ignoreMandatoryFields: true });
                // response.result.push({
                //     invoice: id_invoice,
                //     pago: id
                // });
            });
        } catch (error) {
            response.code = 400;
            response.message = response.message = error.message;
        }
    }



    entry_point.put = function (context) {

        let request = JSON.parse(JSON.stringify(context));
        log.debug('request', request);

        let item = request.item;
        log.debug('item', item);

        let pagos = request.pagos;
      	log.debug('pagos', pagos);

        var objRecord = record.load({ //Carga la sales order del id que le pasas por JSON
            type: record.Type.INVOICE,
            id: request.idinvoice,
            isDynamic: true
        });
        log.debug('objRecord', objRecord);


        var item_count = objRecord.getLineCount({ sublistId: 'item' });


        for (let i = 0; i < item_count; i++) {

            var seline = objRecord.selectLine({
                sublistId: 'item',
                line: i
            });
            var internalid = objRecord.getSublistValue({
                sublistId: 'item',
                fieldId: 'item',
                line: i
            });
            var description = objRecord.getSublistValue({
                sublistId: 'item',
                fieldId: 'description',
                line: i
            });
            var rate = objRecord.getSublistValue({
                sublistId: 'item',
                fieldId: 'taxrate',
                line: i
            });
            var total = objRecord.getSublistValue({
                sublistId: 'item',
                fieldId: 'grossamt',
                line: i
            });
            var amount = objRecord.getSublistValue({
                sublistId: 'item',
                fieldId: 'amount',
                line: i
            });
            objRecord.setCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'item',
                value: item[i].item,
                ignoreFieldChange: true
            }).setCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'description',
                value: item[i].description,
                ignoreFieldChange: true
            }).setCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'rate',
                value: item[i].rate,
                ignoreFieldChange: true
            }).setCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'grossamt',
                value: item[i].total,
                ignoreFieldChange: true
            }).setCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'amount',
                value: item[i].amount,
                ignoreFieldChange: true
            }).commitLine({ sublistId: 'item', ignoreRecalc: true });


        }

        var id_invoice = objRecord.save({
            ignoreMandatoryFields: true
        });


        const response = {
            code: 200,
            message: "Transacción de venta actualizada exitosamente",
            result: []
        };
        response.result.push({ id_invoice })

        pagarInvoice(id_invoice, pagos);




        return response;

    }
    function pagarInvoice(id_invoice, pagos) {

        let response = {}
        try {
            pagos.forEach(function (pago) {
                let objPayments = record.transform({
                    fromType: record.Type.INVOICE,
                    fromId: id_invoice,
                    toType: record.Type.CUSTOMER_PAYMENT,
                    isDynamic: true
                });
                objPayments.setValue({ fieldId: 'paymentoption', value: pago.metodo_pago });
                objPayments.setValue({ fieldId: 'currency', value: pago.divisa });
                //objPayments.setValue({ fieldId: 'trandate', value: new Date(pago.trandate) });
                const sublistId = 'apply';
                let totalCount = objPayments.getLineCount({ sublistId: sublistId });
                for (let index = 0; index < totalCount; index++) {
                    objPayments.selectLine({ sublistId: sublistId, line: index });
                    objPayments.setCurrentSublistValue({ sublistId: sublistId, fieldId: 'apply', value: true });
                    objPayments.setCurrentSublistValue({ sublistId: sublistId, fieldId: 'amount', value: pago.monto });
                    objPayments.setCurrentSublistValue({ sublistId: sublistId, fieldId: 'due', value: pago.monto });
                    objPayments.setCurrentSublistValue({ sublistId: sublistId, fieldId: 'total', value: pago.monto });
                    objPayments.commitLine({ sublistId: sublistId });
                }
                var id = objPayments.save({ enableSourcing: true, ignoreMandatoryFields: true });
                // response.result.push({
                //     invoice: id_invoice,
                //     pago: id
                // });
            });
        } catch (error) {
            response.code = 400;
            response.message = response.message = error.message;
        }
    }


    return entry_point;
});