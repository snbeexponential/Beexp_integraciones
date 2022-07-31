/**
* @author saul navarro saul.navarro@beexponential.com.mx<>
* @Modificacion <>
* @Name hm_rl_inventory.js
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

    const response = {
        code: 200,
        message: "",
        result: []
    };

    entry_point.get = function (request) {
    }

    entry_point.post = function (context) {
        let request = JSON.parse(JSON.stringify(context));
        let req_subsidiary=request.subsidiary
        let req_department=request.department
        let req_class=request.class
        let req_adjlocation=request.adjlocation
        let req_account=request.account
        let req_item = request.item
        
        
        
        
        const record_inv_adj = record.create({ //Se crea la sales order
            type: record.Type.INVENTORY_ADJUSTMENT,
            isDynamic: true,
        })
        record_inv_adj.setValue({
            fieldId:'subsidiary',
            value:req_subsidiary,
        })
        record_inv_adj.setValue({
            fieldId:'department',
            value:req_department,
        })
        record_inv_adj.setValue({
            fieldId:'class',
            value:req_class,
        })
        record_inv_adj.setValue({
            fieldId:'adjlocation',
            value:req_adjlocation,
        })
        record_inv_adj.setValue({
            fieldId:'account',
            value:req_account,
        })
        
        req_item.forEach(function(index){
            
            let item_idItem=index.idItem
            let item_location=index.location
            let item_units=index.units
            let item_description=index.description
            let item_adjustqtyby=index.adjustqtyby
            let item_avgunitcost=index.avgunitcost
            let item_department=index.department
            let item_class=index.class
            
            log.debug("AQUÍ SI LLEGA GG")
            
            record_inv_adj.selectNewLine({
                sublistId: 'inventory'
            }).setCurrentSublistValue({
                sublistId: 'inventory',
                fieldId: 'item',
                value: item_idItem
            }).setCurrentSublistValue({
                sublistId: 'inventory',
                fieldId: 'location',
                value: item_location
            }).setCurrentSublistValue({
                sublistId: 'inventory',
                fieldId: 'units',
                value: item_units
            }).setCurrentSublistValue({
                sublistId: 'inventory',
                fieldId: 'description',
                value: item_description
            }).setCurrentSublistValue({
                sublistId: 'inventory',
                fieldId: 'adjustqtyby',
                value: item_adjustqtyby
            }).setCurrentSublistValue({
                sublistId: 'inventory',
                fieldId: 'avgunitcost',
                value:item_avgunitcost
            }).setCurrentSublistValue({
                sublistId: 'inventory',
                fieldId: 'department',
                value:item_department
            }).setCurrentSublistValue({
                sublistId: 'inventory',
                fieldId: 'class',
                value: item_class
            }).commitLine({
                sublistId: "inventory"
            });
            
        });
        
        var id_ajuste = record_inv_adj.save({
            ignoreMandatoryFields: true
        });
        
        const response = {
            code: 200,
            message: "Ajuste de inventario realizado exitosamente",
            result: []
        };
        response.result.push({ id_ajuste })
        
        return response;
        
    }
    
    
    
    entry_point.put = function (context) {
        
        let request = JSON.parse(JSON.stringify(context));
        let req_subsidiary=request.subsidiary
        let req_department=request.department
        let req_class=request.class
        let req_adjlocation=request.adjlocation
        let req_account=request.account
        let req_item = request.item

        const objRecord = record.load({ //Carga la sales order del id que le pasas por JSON
            type: record.Type.INVENTORY_ADJUSTMENT,
            id: request.idajuste,
            isDynamic: true
        });
        

        objRecord.setValue({
            fieldId:'subsidiary',
            value:req_subsidiary,
        })
        objRecord.setValue({
            fieldId:'department',
            value:req_department,
        })
        objRecord.setValue({
            fieldId:'class',
            value:req_class,
        })
        objRecord.setValue({
            fieldId:'adjlocation',
            value:req_adjlocation,
        })
        objRecord.setValue({
            fieldId:'account',
            value:req_account,
        })
        
        var item_count = objRecord.getLineCount({ sublistId: 'item' });
        for (let i = 0; i < item_count; i++) {
            
       /*      var seline = objRecord.selectLine({
                sublistId: 'item',
                line: i
            }); */
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
        
            response.code=200;
            response.message="Transacción de venta actualizada exitosamente";
        ;
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
    